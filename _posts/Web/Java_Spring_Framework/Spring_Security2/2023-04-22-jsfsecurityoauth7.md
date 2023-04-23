---
title: "Spring Security Oauth2 Part 7"
excerpt: "OAuth2 Social Login"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# OAuth2 Social Login

Google, Naver, Kakao 와 같은 소셜 로그인을 지원하기 위한 작업 수행

## 각 OAuth2 Provider에 대한 Client 등록

아래의 사이트들을 통해 OAuth2 인증을 위한 Application을 생성한다.

Google: https://console.cloud.google.com/
Naver: https://developers.naver.com/main/
Kakao: https://developers.kakao.com/

이후, client_id, client_secret, oauth2 provider에 대한 endpoint을 등록한다.

> OAuth2-application.yml

```yml
server:
    port: 8081
spring:
    security:
        oauth2:
            client:
                registration:
                    google:
                        client-id: [cliend-id]
                        client-secret: [client-secret]
                        scope: openid,profile,email

                    naver:
                        client-id: [cliend-id]
                        client-secret: [client-secret]
                        client-name: naver-client-app
                        redirect-uri: http://localhost:8081/login/oauth2/code/naver
                        scope: profile,email
                    kakao:
                        client-id: [cliend-id]
                        client-secret: [client-secret]
                        authorization-grant-type: authorization_code
                        client-name: client-app
                        redirect-uri: http://localhost:8081/login/oauth2/code/kakao
                        scope: openid,profile_nickname,profile_image,account_email

                provider:
                    naver:
                        authorization-uri: https://nid.naver.com/oauth2.0/authorize
                        token-uri: https://nid.naver.com/oauth2.0/token
                        user-info-uri: https://openapi.naver.com/v1/nid/me
                        user-name-attribute: response
                    kakao:
                        issuer-uri: https://kauth.kakao.com
                        authorization-uri: https://kauth.kakao.com/oauth/authorize
                        token-uri: https://kauth.kakao.com/oauth/token
                        user-info-uri: https://kapi.kakao.com/v2/user/me
                        user-name-attribute: id

    mvc:
      static-path-pattern: /static/**
```

## Configuration

Oauth2 기반의 인증을 위한 보안 설정, OAuth2Login 설정을 통해 Social Login이 가능하도록 설정하며, CustomUserService들을 등록해서 UserInfo에 접근하는 과정에서 사용자가 정의한 객체가 활용될 수 있도록 한다.

> OAuth2ClientConfig

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class OAuth2ClientConfig {
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOidcUserService customOidcUserService;

    //정적 파일에 대한 보안 인증을 생략
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer(){
        return (web) -> web.ignoring().requestMatchers(
                "/static/js/**", "/static/images/**", "/static/css/**", "/static/scss/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
        httpSecurity.authorizeHttpRequests()
                .requestMatchers("/api/user").hasAnyRole("SCOPE_profile", "SCOPE_email","OAUTH2_USER")
                .requestMatchers("/api/oidc").hasAnyRole("SCOPE_openid")
                .requestMatchers("/").permitAll()
                .anyRequest().authenticated();
        //oauth2 기반의 인증
        httpSecurity
                .oauth2Login(oauth2->oauth2
                        .userInfoEndpoint(userInfoEndpointConfig -> userInfoEndpointConfig
                                        .userService(customOAuth2UserService)
                                        .oidcUserService(customOidcUserService)
                        )
                );
        //form 인증
        httpSecurity.formLogin()
                .loginPage("/login")
                .loginProcessingUrl("/loginProc")
                .defaultSuccessUrl("/")
                .permitAll();

        httpSecurity.exceptionHandling().authenticationEntryPoint(new LoginUrlAuthenticationEntryPoint("/login"));
        httpSecurity.logout().logoutSuccessUrl("/");
        return httpSecurity.build();
    }

}
```

## Model

각각의 Provider에서 제공하는 정보가 다를 수 있기 때문에, GoogleUser, NaverUser, KakaoUser와 같이 각 모델을 분리해서 저장할 수 있도록 한다.

### PrincipalUser

UserDetails, Oauth2User, OidcUser에 대해 모두 처리할 수 있는 record

```java
public record PrincipalUser(ProviderUser providerUser) implements UserDetails, OidcUser, OAuth2User {

    @Override
    public String getName() {
        return providerUser.getUserName();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return providerUser.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return providerUser.getAuthorities();
    }

    @Override
    public String getPassword() {
        return providerUser.getPassword();
    }

    @Override
    public String getUsername() {
        return providerUser.getUserName();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public Map<String, Object> getClaims() {
        return null;
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return null;
    }

    @Override
    public OidcIdToken getIdToken() {
        return null;
    }
}
```


### ProviderUser

공통적인 메소드에 대해서는 인터페이스로 추상화한다.

```java
public interface ProviderUser {
    String getId();
    String getUserName();
    String getPassword();
    String getEmail();
    String getProvider();
    String getPicture();
    List<? extends GrantedAuthority> getAuthorities();
    Map<String, Object> getAttributes();
    OAuth2User getOAuth2User();
    boolean isCertificated();
    void isCertificated(boolean bool);
}
```

각 Social Login 과정에서 얻은 유저 정보를 토대로 각 login 방식에 맞는 User model 생성

### Users

> Oauth2ProviderUser

Oauth2 기반의 인증에서 공통적으로 사용할 수 있는 유저 모델, 각 모델에서 공통적으로 처리될 수 있는 메소드에 대해서 추상클래스로 묶어서 처리한다.

```java
@Data
public abstract class OAuth2ProviderUser implements ProviderUser {
    private Map<String, Object> attributes;
    private OAuth2User oAuth2User;
    private ClientRegistration clientRegistration;
    private boolean isCertificated;

    public OAuth2ProviderUser(Map<String,Object> attributes,OAuth2User oAuth2User, ClientRegistration clientRegistration) {
        this.attributes = attributes;
        this.oAuth2User = oAuth2User;
        this.clientRegistration = clientRegistration;
    }

    @Override
    public String getPassword() {
        return UUID.randomUUID().toString();
    }

    @Override
    public String getEmail() {
        return (String) getAttributes().get("email");
    }

    @Override
    public String getProvider() {
        return clientRegistration.getRegistrationId();
    }

    @Override
    public List<? extends GrantedAuthority> getAuthorities() {
        return oAuth2User.getAuthorities()
                .stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    @Override
    public boolean isCertificated() {
        return isCertificated;
    }

    @Override
    public void isCertificated(boolean isCertificated) {
        this.isCertificated = isCertificated;
    }
}
```

> GoogleUser

```java
public class GoogleUser extends OAuth2ProviderUser {

    public GoogleUser(Attributes attributes, OAuth2User oAuth2User, ClientRegistration clientRegistration) {
        super(attributes.getMainAttributes(), oAuth2User, clientRegistration);
    }

    @Override
    public String getId() {
        return (String) getAttributes().get("sub");
    }

    @Override
    public String getUserName() {
        return (String) getAttributes().get("name");
    }

    @Override
    public String getPicture() {
        return null;
    }
}
```

> NaverUser

```java
public class NaverUser extends OAuth2ProviderUser {
    public NaverUser(Attributes attributes, OAuth2User oAuth2User, ClientRegistration clientRegistration) {
        //네이버의 경우 response 계층이 존재하여 한 단계 더 들어가야하는 차이점이 있다.
        super(attributes.getSubAttributes(), oAuth2User, clientRegistration);
    }

    @Override
    public String getId() {
        return (String) getAttributes().get("id");
    }

    @Override
    public String getUserName() {
        return (String) getAttributes().get("name");
    }

    @Override
    public String getPicture() {
        return (String) getAttributes().get("profile_image");
    }
}
```

> KakaoOidcUser

```java
public class KakaoOidcUser extends OAuth2ProviderUser {

    public KakaoOidcUser(Attributes attributes, OAuth2User oAuth2User, ClientRegistration clientRegistration) {
        super(attributes.getMainAttributes(), oAuth2User, clientRegistration);
    }

    @Override
    public String getId() {
        return (String) getAttributes().get("id");
    }

    @Override
    public String getUserName() {
        return (String) getAttributes().get("nickname");
    }

    @Override
    public String getPicture() {
        return (String) getAttributes().get("profile_image_url");
    }
}
```

> KakaoUser

```java
public class KakaoUser extends OAuth2ProviderUser {
    private Map<String, Object> otherAttributes;
    private Map<String, Object> subAttributes;

    public KakaoUser(Attributes attributes, OAuth2User oAuth2User, ClientRegistration clientRegistration) {
        //카카오의 경우 특정 유저 정보에 접근하기 위해 2단계를 거쳐야한다.
        super(attributes.getOtherAttributes(), oAuth2User, clientRegistration);
        this.otherAttributes = attributes.getOtherAttributes();
        this.subAttributes = attributes.getSubAttributes();
    }

    @Override
    public String getId() {
        return (String) getAttributes().get("id");
    }

    @Override
    public String getUserName() {
        return (String) subAttributes.get("nickname");
    }

    @Override
    public String getPicture() {
        return (String) otherAttributes.get("profile_image_url");
    }
}
```

> FormUser

form login 기반의 인증도 수행할 수 있도록 FormUser 클래스도 정의한다.

```java
@Data
@Builder
public class FormUser implements ProviderUser {
    private String id;
    private String username;
    private String password;
    private String email;
    private List<? extends GrantedAuthority> authorities;
    private String provider;
    private boolean isCertificated;

    @Override
    public String getId() {
        return id;
    }

    @Override
    public String getUserName() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getEmail() {
        return email;
    }

    @Override
    public String getProvider() {
        return null;
    }

    @Override
    public String getPicture() {
        return null;
    }

    @Override
    public List<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public OAuth2User getOAuth2User() {
        return null;
    }
    @Override
    public boolean isCertificated() {
        return isCertificated;
    }

    @Override
    public void isCertificated(boolean isCertificated) {
        this.isCertificated = isCertificated;
    }
}
```

### Attributes

유저 정보를 저장할 수 있는 Attributes 객체

```java
@Data
@Builder
public class Attributes {
    private Map<String, Object> mainAttributes;
    private Map<String, Object> subAttributes;
    private Map<String, Object> otherAttributes;
}
```

### OAuth2Util

OAuth2 인증 과정에서 사용되는 메소드들을 제공하는 유틸리티 클래스

```java
public class OAuth2Utils {

    public static Attributes getMainAttributes(OAuth2User oAuth2User) {

        return Attributes.builder()
                .mainAttributes(oAuth2User.getAttributes())
                .build();
    }

    public static Attributes getSubAttributes(OAuth2User oAuth2User, String subAttributesKey) {

        Map<String, Object> subAttributes = (Map<String, Object>) oAuth2User.getAttributes().get(subAttributesKey);
        return Attributes.builder()
                .subAttributes(subAttributes)
                .build();
    }

    public static Attributes getOtherAttributes(OAuth2User oAuth2User, String subAttributesKey, String otherAttributesKey) {

        Map<String, Object> subAttributes = (Map<String, Object>) oAuth2User.getAttributes().get(subAttributesKey);
        Map<String, Object> otherAttributes = (Map<String, Object>) subAttributes.get(otherAttributesKey);

        return Attributes.builder()
                .subAttributes(subAttributes)
                .otherAttributes(otherAttributes)
                .build();
    }

    public static String oAuth2UserName(OAuth2AuthenticationToken authentication, PrincipalUser principalUser) {
        String username;
        String registrationId = authentication.getAuthorizedClientRegistrationId();
        OAuth2User oAuth2User = principalUser.providerUser().getOAuth2User();

        //Google, Facebook, Apple
        Attributes attributes = OAuth2Utils.getMainAttributes(oAuth2User);
        username = (String) attributes.getMainAttributes().get("name");

        //Naver
        if (registrationId.equals(OAuth2Config.SocialType.NAVER.getSocialName())) {
            attributes = OAuth2Utils.getSubAttributes(oAuth2User, "response");
            username = (String) attributes.getSubAttributes().get("name");
        }
        //Kakao
        if (registrationId.equals(OAuth2Config.SocialType.KAKAO.getSocialName())) {
            if (oAuth2User instanceof OidcUser) {
                attributes = OAuth2Utils.getMainAttributes(oAuth2User);
                username = (String) attributes.getSubAttributes().get("nickname");
            }else {
                attributes = OAuth2Utils.getOtherAttributes(oAuth2User, "profile", null);
                username = (String) attributes.getSubAttributes().get("nickname");
            }
        }

        return username;
    }
}
```

## Converters

각 로그인 인증 방식에 맞는 User 객체를 반환 할 수 있도록 Converter 클래스를 생성해서, 각 인증 과정에서 처리할 수 있는 User 객체를 반환하도록 한다.

> ProviderUserConverter

Input에 대해 Output을 반환하는 converter 메소드에 대한 인터페이스 정의

```java
public interface ProviderUserConverter<T,R> {
    R converter(T t);
}
```

> ProviderUserRequest

ClientRegistration, OAuth2User, User와 같은 정보를 포함하고 UserRequest으로 해당 정보를 토대로 인증 방식 및 유저 정보에 접근이 가능하다.

```java
public record ProviderUserRequest(ClientRegistration clientRegistration, OAuth2User oAuth2User, User user) {
    public ProviderUserRequest(ClientRegistration clientRegistration, OAuth2User oAuth2User){
        this(clientRegistration, oAuth2User, null);
    }
    public ProviderUserRequest(User user){
        this(null,null,user);
    }

}
```

> DelegatingProviderUserConverter

converter list을 저장하고 있어, 인증 방식에 맞는 converter가 처리 될 수 있도록 한다.

```java
@Component
public class DelegatingProviderUserConverter implements ProviderUserConverter<ProviderUserRequest, ProviderUser>{
    private List<ProviderUserConverter<ProviderUserRequest, ProviderUser>> converters;

    public DelegatingProviderUserConverter() {
        List<ProviderUserConverter<ProviderUserRequest, ProviderUser>> providerUserConverters =
                Arrays.asList(
                        new UserDetailsProviderUserConverter(),
                        new OAuth2GoogleProviderUserConverter(),
                        new OAuth2NaverProviderUserConverter(),
                        new OAuth2KakaoProviderUserConverter(),
                        new OAuth2KakaoOidcProviderUserConverter()
                );
        this.converters = Collections.unmodifiableList(new LinkedList<>(providerUserConverters));
    }

    @Override
    public ProviderUser converter(ProviderUserRequest providerUserRequest) {
        Assert.notNull(providerUserRequest, "providerUserRequest cannot be null");
        for (ProviderUserConverter<ProviderUserRequest, ProviderUser> converter : converters) {
            ProviderUser providerUser = converter.converter(providerUserRequest);
            if (providerUser != null) {
                return providerUser;
            }
        }
        return null;
    }
}
```
### 각 인증을 처리하는 converter

> OAuth2GoogleProviderUserConverter

```java
public class OAuth2GoogleProviderUserConverter implements ProviderUserConverter<ProviderUserRequest, ProviderUser> {
    @Override
    public ProviderUser converter(ProviderUserRequest providerUserRequest) {
        if (!providerUserRequest.clientRegistration().getRegistrationId().equals(OAuth2Config.SocialType.GOOGLE.getSocialName())) {
            return null;
        }
        return new GoogleUser(OAuth2Utils.getMainAttributes(providerUserRequest.oAuth2User()),
                providerUserRequest.oAuth2User(),
                providerUserRequest.clientRegistration());
    }
}

```

> OAuth2KakaoOidcProviderUserConverter

```java
public class OAuth2KakaoOidcProviderUserConverter implements ProviderUserConverter<ProviderUserRequest, ProviderUser> {
    @Override
    public ProviderUser converter(ProviderUserRequest providerUserRequest) {

        if (!providerUserRequest.clientRegistration().getRegistrationId().equals(OAuth2Config.SocialType.KAKAO.getSocialName())) {
            return null;
        }
        if (!(providerUserRequest.oAuth2User() instanceof OidcUser)) {
            return null;
        }
        return new KakaoOidcUser(OAuth2Utils.getMainAttributes(providerUserRequest.oAuth2User()),
                providerUserRequest.oAuth2User(),
                providerUserRequest.clientRegistration());
    }
}
```

> OAuth2KakaoProviderUserConverter

```java
public class OAuth2KakaoProviderUserConverter implements ProviderUserConverter<ProviderUserRequest, ProviderUser> {
    @Override
    public ProviderUser converter(ProviderUserRequest providerUserRequest) {

        if (!providerUserRequest.clientRegistration().getRegistrationId().equals(OAuth2Config.SocialType.KAKAO.getSocialName())) {
            return null;
        }
        if (providerUserRequest.oAuth2User() instanceof OidcUser) {
            return null;
        }
        return new KakaoUser(OAuth2Utils.getOtherAttributes(providerUserRequest.oAuth2User(),"kakao_account","profile"),
                providerUserRequest.oAuth2User(),
                providerUserRequest.clientRegistration());
    }
}
```

> OAuth2NaverProviderUserConverter

```java
public class OAuth2NaverProviderUserConverter implements ProviderUserConverter<ProviderUserRequest, ProviderUser> {
    @Override
    public ProviderUser converter(ProviderUserRequest providerUserRequest) {

        if (!providerUserRequest.clientRegistration().getRegistrationId().equals(OAuth2Config.SocialType.NAVER.getSocialName())) {
            return null;
        }
        return new NaverUser(OAuth2Utils.getSubAttributes(providerUserRequest.oAuth2User(),"response"),
                providerUserRequest.oAuth2User(),
                providerUserRequest.clientRegistration());
    }
}

```

> UserDetailsProviderUserConverter

```java
public class UserDetailsProviderUserConverter implements ProviderUserConverter<ProviderUserRequest, ProviderUser> {
    @Override
    public ProviderUser converter(ProviderUserRequest providerUserRequest) {
        User user = providerUserRequest.user();
        if (user == null) {
            return null;
        }

        return FormUser.builder()
                .id(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .email(user.getEmail())
                .authorities(user.getAuthorities())
                .provider("none")
                .build();
    }
}
```

## User Service

Oauth2 인증, Form Login 인증에서 유저 정보에 접근하기 위해 UserService가 호출되는데, 이때 CustomUserService들을 설정하여 로직을 추가한다. 로그인을 시도하는 과정에서 회원이 등록되어 있지 않은 경우 회원가입이 이루어질 수 있도록 한다.

> AbstractUserService

providerUserConverter가 등록되어 있는데, 이는 DelegatingProviderUserConverter가 주입되어 상황에 맞는 converter가 동작할 수 있게끔 한다.

```java
@Service
@Getter
public abstract class AbstractUserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserService userService;

    @Autowired
    private ProviderUserConverter<ProviderUserRequest, ProviderUser> providerUserConverter;

    //ProviderUser을 반환하는 작업(DelegatingProviderUserConverter 호출)
    public ProviderUser providerUser(ProviderUserRequest providerUserRequest) {
        return providerUserConverter.converter(providerUserRequest);
    }
    //회원 등록 처리
    protected void register(ProviderUser providerUser, OAuth2UserRequest userRequest) {
        userService.register(userRequest.getClientRegistration().getRegistrationId(),providerUser);
    }
}
```

> UserService & UserRepository

User 객체를 DB에 등록하는 Service, Repository

```java
//UserService
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public void register(String registrationId, ProviderUser providerUser) {
        User user = User.builder().registrationId(registrationId)
                .username(providerUser.getUserName())
                .provider(providerUser.getProvider())
                .email(providerUser.getEmail())
                .authorities(providerUser.getAuthorities())
                .build();
        userRepository.register(user);
    }
}

//UserRepository
@Repository
public class UserRepository {
    private Map<String, Object> users = new HashMap<>();

    public Optional<User> findByUsername(String username) {
        return Optional.ofNullable((User)users.get(username));
    }

    public void register(User user) {
        if(users.containsKey(user.getUsername()))
            return;
        users.put(user.getUsername(), user);
    }
}
```

> CustomOAuth2UserService

OAuth2Prodiver 방식에서 사용되는 User Service

```java
@Service
public class CustomOAuth2UserService extends AbstractUserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        //OAuth2User 객체 반환
        ClientRegistration clientRegistration = userRequest.getClientRegistration();
        OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = oAuth2UserService.loadUser(userRequest);

        //OAuth2User 객체를 각 User model로 변환하는 작업
        ProviderUserRequest providerUserRequest = new ProviderUserRequest(clientRegistration, oAuth2User);

        ProviderUser providerUser = super.providerUser(providerUserRequest);

        //회원 등록하는 과정
        super.register(providerUser, userRequest);

        return new PrincipalUser(providerUser);
    }
}
```

> CustomOidcUserService

OIDC Provider 방식에서 사용되는 User Service

```java
@Service
public class CustomOidcUserService extends AbstractUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {
    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        //OIDC 기반의 인증에서는 username attribute가 sub가 되어야 한다.
        ClientRegistration clientRegistration = ClientRegistration.withClientRegistration(userRequest.getClientRegistration())
                .userNameAttributeName("sub")
                .build();

        OidcUserRequest oidcUserRequest = new OidcUserRequest(clientRegistration,
                userRequest.getAccessToken(),
                userRequest.getIdToken(), userRequest.getAdditionalParameters());
        //Oidc2User 객체 반환
        OAuth2UserService<OidcUserRequest, OidcUser> oAuth2UserService = new OidcUserService();
        OidcUser oidcUser = oAuth2UserService.loadUser(oidcUserRequest);
        //OidcUser 객체를 각 User model로 변환하는 작업
        ProviderUserRequest providerUserRequest = new ProviderUserRequest(clientRegistration, oidcUser);
        ProviderUser providerUser = super.providerUser(providerUserRequest);
        
        //회원 등록하는 과정
        super.register(providerUser, userRequest);

        return new PrincipalUser(providerUser);
    }
}
```

> CustomUserDetailsService

Form Login 과정에서 사용되는 User Service

```java
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService extends AbstractUserService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElse(
                        User.builder()
                                .id("1")
                                .username("user1")
                                .password("{noop}1234")
                                .authorities(AuthorityUtils.createAuthorityList("ROLE_USER"))
                                .email("user@a.com")
                                .build());

        ProviderUserRequest providerUserRequest = new ProviderUserRequest(user);
        ProviderUser providerUser = providerUser(providerUserRequest);
        return new PrincipalUser(providerUser);
    }
}
```

## 인증된 유저 접근

아래와 같이 @AuthenticationPrincipal annotation을 이용해서 유저 객체를 인자로 받을 수 있다.

```java
@Controller
public class IndexController {
    @GetMapping("/")
    public String index(Model model, Authentication authentication, @AuthenticationPrincipal PrincipalUser principalUser) {
        String view = "index";
        if (authentication != null) {
            String username=principalUser.providerUser().getUserName();
            model.addAttribute("user", username);
            model.addAttribute("providerUser", principalUser.providerUser().getProvider());
            if(!principalUser.providerUser().isCertificated())
                view = "selfcert";
        }
        return view;
    }
}
```
## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



