---
title: "Spring Security Part 7"
excerpt: "실전 프로젝트 구성 - Custom Authorization"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# 실전 프로젝트 구성 - Custom Authorization

기존까지의 인가 과정에서는 Security Config에 수동으로 입력해서 이에 따른 권한 검증을 수행하였는데, 실제로는 관리자가 상황에 따라서 동적으로 권한을 처리해야하는 경우가 발생할 수 있기 때문에 이에 대한 처리를 진행하기 위해 Custom Authorization을 진행하도록한다.

![custom_authorization](/assets/images/jsf/Spring_Security/custom_authorization.jpg)

구성해야하는 component들은 아래와 같다

1. CustomAuthorizationFilter
2. CustomAuthorizationManager
3. PermitAll
4. AccessIp
5. SecurityResourceService
6. RoleHierarchy

## CustomAuthorizationFilter

해당 필터는 FilterChainProxy에 등록되어 맨 마지막에서 권한 검증을 수행하는 필터이다. 내부 동작과정은 AuthorizationFilter은 동일하며, 실제 인가 검증을 수행하는 AuthorizationManager을 호출한다.

```java
public class CustomAuthorizationFilter extends AuthorizationFilter {
    public CustomAuthorizationFilter(AuthorizationManager<HttpServletRequest> authorizationManager) {
        super(authorizationManager);
    }
}
```

권한 검증은 최종적으로 진행되는 로직으로 기존의 인가 검증을 수행하는 Authorization Filter 뒤에 넣어줘야한다. CustomAuthorizationFilter을 생성해서 등록하는 부분은 내부 component을 먼저 만들고 진행한다.

## CustomAuthorizationManager

AuthorizationFilter으로부터 호출되어 resource에 설정된 권한정보와 유저의 권한을 검증한다. 동작과정은 RequestMatcherDelegatingAuthorizationManager와 AuthorityAuthorizationManager 내부 동작을 합쳤다.

검증 순서는 아래의 순서대로 이루어진다.

1. IP검증
2. PermitAll
3. url resource 검증

```java
@Slf4j
@RequiredArgsConstructor
public class CustomAuthorizationManager implements AuthorizationManager<HttpServletRequest> {
    //인가 검증 결과를 담는 변수 default: DENY
    private static final AuthorizationDecision DENY = new AuthorizationDecision(false);
    //resource에 설정된 권한 정보를 가져오기 위한 Service 객체
    private final SecurityResourceService securityResourceService;
    //계층 권한 정보를 담고 있는 객체
    private RoleHierarchy roleHierarchy = new NullRoleHierarchy();
    //permitAll 설정된 url 정보
    private List<RequestMatcher> permitAlls = new ArrayList<>();
    //허용되지 않은 IP정보를 담고 있는 객체
    private List<RequestMatcher> deniedIps=new ArrayList<>();
    private final Log logger = LogFactory.getLog(getClass());

    public void setPermitAlls(List<RequestMatcher> permitAlls) {
        this.permitAlls = permitAlls;
    }

    public void setDeniedIps(List<RequestMatcher> deniedIps) {
        this.deniedIps = deniedIps;
    }

    public void setRoleHierarchy(RoleHierarchy roleHierarchy) {
        Assert.notNull(roleHierarchy, "roleHierarchy cannot be null");
        this.roleHierarchy = roleHierarchy;
    }

    public void setAuthenticatedUrls(String... urls) {
        for (String url : urls) {
            this.defaultMappings.add(new RequestMatcherEntry<>(new AntPathRequestMatcher(url), AuthenticatedAuthorizationManager.authenticated()));
        }
    }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, HttpServletRequest request) {
        if (this.logger.isTraceEnabled())
            this.logger.trace(LogMessage.format("Authorizing %s", request));

        
        for (RequestMatcher ipMatcher : deniedIps) {
            if(ipMatcher.matches(request))
                return DENY;
        }

        for(RequestMatcher permitMatcher: permitAlls)
            if(permitMatcher.matches(request))
                return new AuthorizationDecision(true);

        List<RequestMatcherEntry<AuthorizationManager<RequestAuthorizationContext>>> mappings = securityResourceService.getResourceList();
        mappings.addAll(defaultMappings);

        for (RequestMatcherEntry<AuthorizationManager<RequestAuthorizationContext>> mapping : mappings) {
            RequestMatcher matcher = mapping.getRequestMatcher();
            RequestMatcher.MatchResult matchResult = matcher.matcher(request);
            if (matchResult.isMatch()) {
                AuthorizationManager<RequestAuthorizationContext> manager = mapping.getEntry();
                if (this.logger.isTraceEnabled()) {
                    this.logger.trace(LogMessage.format("Checking authorization on %s using %s", request, manager));
                }
                return manager.check(authentication,
                        new RequestAuthorizationContext(request, matchResult.getVariables()));
            }
        }
        if (this.logger.isTraceEnabled()) {
            this.logger.trace(LogMessage.of(() -> "Denying request since did not find matching RequestMatcher"));
        }
        return DENY;
    }
}
```

## PermitAll
"/", "/login", 등과 같은 경로에 대해서는 모든 사람에 대한 접근이 가능하도록 설정해야한다. 따라서, permitall로 설정해서 해당 경로에 대해서는 인증/인가 검증을 수행하지 않는다.

```java
customAuthorizationManager.setPermitAlls(Arrays.asList(
    new AntPathRequestMatcher("/"),
    new AntPathRequestMatcher("/user"),
    new AntPathRequestMatcher("/login"),
    new AntPathRequestMatcher("/login_proc"),
    new AntPathRequestMatcher("/denied"),
    new AntPathRequestMatcher("/signIn")));

//PermitAll 검증
for(RequestMatcher permitMatcher: permitAlls)
    if(permitMatcher.matches(request))
        return new AuthorizationDecision(true);
```

## AccessIp

경우에 따라서는 허용된 IP를 제한할 수 있다.

```java
customAuthorizationManager.setDeniedIps(Arrays.asList(
        new IpAddressMatcher("192.168.0.0/16")
        )
);

for (RequestMatcher ipMatcher : deniedIps) {
        if(ipMatcher.matches(request))
            return DENY;
    }
```

5. SecurityResourceService

DB에 등록된 url resource에 대한 권한정보를 가져오는 Service 객체이다. Resource에 등록시 권한 검증을 수행하는 AuthorityAuthorizationManager 객체를 삽입한다.

> SecurityResourceService

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecurityResourceService {
    private final ResourcesRepository resourcesRepository;

    private final RoleHierarchyImpl roleHierarchyImpl;

    List<RequestMatcherEntry<AuthorizationManager<RequestAuthorizationContext>>> securityResources=new ArrayList<>();

    public void load() {
        securityResources.clear();

        List<Resources> allResources = resourcesRepository.findAllResources();

        allResources.forEach(
                (resource)->{
                    Set < String > authoritites = new HashSet<>();
                    resource.getRoleSet().forEach(
                            (role) -> {
                                authoritites.add(role.getRoleName());
                            });
                    AuthorityAuthorizationManager<RequestAuthorizationContext> authorizationManager = AuthorityAuthorizationManager.hasAnyAuthority(authoritites.toArray(new String[0]));
                    authorizationManager.setRoleHierarchy(roleHierarchyImpl);
                    securityResources.add(new RequestMatcherEntry<>(new AntPathRequestMatcher(resource.getResourceName()),authorizationManager));
                }
        );
    }
    public List<RequestMatcherEntry<AuthorizationManager<RequestAuthorizationContext>>> getResourceList() {
        return securityResources;
    }

}
```

6. RoleHierarchy

ROLE_ADMIN, ROLE_MANAGER, ROLE_USER을 보면 개별적인 권한으로 이들간에 아무런 상관관계가 존재하지 않는다. ROLE_ADMIN을 가지고 있는 유저라도 ROLE_USER 권한이 설정되어 있는 resource에 접근이 불가능하다.
하지만 보통 ROLE_ADMIN > ROLE_MANAGER > ROLE_USER와 같이 계층정보를 가지게 하여 상위 권한을 가진 유저는 하위 권한이 설정된 resource에 접근이 가능해야한다. 이를 위해 RoleHierarchy를 설정한다.

> RoleHierarchy

```java
//@JsonIdentityInfo(generator = ObjectIdGenerators.IntSequenceGenerator.class)
public class RoleHierarchy implements Serializable {

    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "child_name")
    private String childName;

    @ManyToOne(cascade = {CascadeType.ALL},fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_name", referencedColumnName = "child_name")
    private RoleHierarchy parentName;

    @OneToMany(mappedBy = "parentName", cascade={CascadeType.ALL})
    private Set<RoleHierarchy> roleHierarchy = new HashSet<RoleHierarchy>();
}
```

부모 권한, 자식 권한 형태로 DB에 저장한다.

> RoleHierarchyService

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleHierarchyServiceImpl implements RoleHierarchyService {
    private final RoleHierarchyRepository roleHierarchyRepository;

    @Override
    public String findAllHierarchy() {
        List<RoleHierarchy> roleHierarchyList = roleHierarchyRepository.findAll();
        StringBuilder stringBuilder = new StringBuilder();
        for (RoleHierarchy roleHierarchy : roleHierarchyList) {
            if(roleHierarchy.getParentName() == null)
                continue;
            stringBuilder.append(roleHierarchy.getParentName().getChildName());
            stringBuilder.append(" > ");
            stringBuilder.append(roleHierarchy.getChildName());
            stringBuilder.append("\n");
        }

        return stringBuilder.toString();
    }
}
```

```java
roleHierarchyImpl.setHierarchy(roleHierarchyService.findAllHierarchy());
```

부모 권한, 자식 권한 형태로 매핑된 정보를 토대로 부모 권한 > 자식 권한으로 변환한다. 이후, 이를 Spring의 RoleHierarchyImpl 객체에 등록하게 되면, 내부에서 상위 권한에 포함된 하위 권한을 찾아서 유저의 권한 정보에 모두 포함시켜 각 권한의 계층 정보를 list 형태로 flat 작업을 수행한다.


## SecurityConfig 설정

1. CustomAuthorizationManager 등록

```java
private final SecurityResourceService securityResourceService;

@Bean
public RoleHierarchyImpl roleHierarchyImpl() {
    RoleHierarchyImpl roleHierarchy = new RoleHierarchyImpl();
    return roleHierarchy;
}

@Bean
public CustomAuthorizationManager customAuthorizationManager() throws Exception {
    CustomAuthorizationManager customAuthorizationManager = new CustomAuthorizationManager(securityResourceService);
    customAuthorizationManager.setPermitAlls(Arrays.asList(
            new AntPathRequestMatcher("/"),
            new AntPathRequestMatcher("/user"),
            new AntPathRequestMatcher("/login"),
            new AntPathRequestMatcher("/login_proc"),
            new AntPathRequestMatcher("/denied"),
            new AntPathRequestMatcher("/signIn")));
    customAuthorizationManager.setDeniedIps(Arrays.asList(
            new IpAddressMatcher("192.168.0.0/16")
            )
    );

    return customAuthorizationManager;
}
```

2. CustomAuthorizationFilter 등록

```java
private final ApplicationContext applicationContext;

public CustomAuthorizationFilter customAuthorizationFilter() throws Exception {
    CustomAuthorizationFilter authorizationFilter = new CustomAuthorizationFilter(customAuthorizationManager());
    authorizationFilter.setAuthorizationEventPublisher((applicationContext.getBeanNamesForType(AuthorizationEventPublisher.class).length > 0) ? applicationContext.getBean(AuthorizationEventPublisher.class) : new SpringAuthorizationEventPublisher(applicationContext));
    authorizationFilter.setSecurityContextHolderStrategy(SecurityContextHolder.getContextHolderStrategy());
    authorizationFilter.setShouldFilterAllDispatcherTypes(true);
    authorizationFilter.setObserveOncePerRequest(true);
    return authorizationFilter;
}

@Bean
@Order(1)
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests()
        .anyRequest().permitAll();

    http.addFilterAfter(customAuthorizationFilter(), AuthorizationFilter.class);

    return http.build();
}
```

3. Spring Security 관련 초기화

Spring Container가 실행된 이후에 필요한 Security 관련 설정들을 초기화 할 수 있도록 한다. 해당 프로젝트에서는 DB에서 url resource에 관한 권한 정보를 가져오는 작업과 권한의 계층정보를 설정하는 작업을 진행하도록 한다.

```java
@Component
@RequiredArgsConstructor
public class SecurityInitializer implements ApplicationRunner {
    private final RoleHierarchyService roleHierarchyService;
    private final RoleHierarchyImpl roleHierarchyImpl;
    private final SecurityResourceService securityResourceService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        securityResourceService.load();
        roleHierarchyImpl.setHierarchy(roleHierarchyService.findAllHierarchy());
    }
}
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%BD%94%EC%96%B4-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



