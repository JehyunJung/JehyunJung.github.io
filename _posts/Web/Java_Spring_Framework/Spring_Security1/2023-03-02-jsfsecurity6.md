---
title: "Spring Security Part 6"
excerpt: "실전 프로젝트 구성 - ajax"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# 실전 프로젝트 구성 - ajax

현재까지는 Form Login 방식의 Spring Security 설정을 진행하였는데, Backend 개발과정에서 API는 뻬놓을 수 없는 영역이다. Front와 Back를 서로 구분하여 개발하여 Front-Back 통신 간에 API를 활용하기 때문에 API 개발은 필수이다.

Ajax을 이용한 Spring Security의 인증은 아래와 같은 흐름으로 이루어진다. 보면 알듯이, Form Login과 매우 유사하게 동작하는 확인할 수 있다. 

![ajax_flow](/assets/images/jsf/Spring_Security/ajax_flow.png)

## Config

API 인증 방식 처리를 위해 별도의 설정 클래스로 분리해서 진행하도록 하고, SecurityMatcher을 등록하여 해당 경로로 오는 요청에 대해서는 해당 설정을 따라가도록 한다.

> Security Config

```java
@Bean
@Order(0)
public SecurityFilterChain ajaxSecurityFilterChain(HttpSecurity httpSecurity) throws Exception{
    httpSecurity
            .securityMatcher("/api/**")
            .authorizeHttpRequests()
            .anyRequest().authenticated();
    httpSecurity
            .addFilterBefore(ajaxLoginProcessingFilter(), UsernamePasswordAuthenticationFilter.class);

    httpSecurity
            .csrf().disable();

    return httpSecurity.build();
}
```

## Components

### AjaxAuthenticationFilter

UsernamePasswordAuthenticationFilter 처럼 Ajax 방식을 처리하는 Filter가 요구된다. Ajax을 처리할 수 있는지 여부를 판단하여 Token을 만들어주는 작업을 진행한다.

> AjaxAuthenticationToken

```java
public class AjaxAuthenticationToken extends AbstractAuthenticationToken {
    private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

    private final Object principal;

    private Object credentials;

    public AjaxAuthenticationToken(Object principal, Object credentials) {
        super(null);
        this.principal = principal;
        this.credentials = credentials;
        setAuthenticated(false);
    }

    public AjaxAuthenticationToken(Object principal, Object credentials,
                                               Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = credentials;
        super.setAuthenticated(true); // must use super, as we override
    }

    @Override
    public Object getCredentials() {
        return this.credentials;
    }

    @Override
    public Object getPrincipal() {
        return this.principal;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        Assert.isTrue(!isAuthenticated,
                "Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead");
        super.setAuthenticated(false);
    }

    @Override
    public void eraseCredentials() {
        super.eraseCredentials();
        this.credentials = null;
    }

}
```

> AjaxAuthenticationFilter

```java

public class AjaxLoginProcessingFilter extends AbstractAuthenticationProcessingFilter {
    public static final String SPRING_SECURITY_FORM_USERNAME_KEY = "username";
    public static final String SPRING_SECURITY_FORM_PASSWORD_KEY = "password";

    private String usernameParameter = SPRING_SECURITY_FORM_USERNAME_KEY;

    private String passwordParameter =SPRING_SECURITY_FORM_PASSWORD_KEY;


    private ObjectMapper objectMapper = new ObjectMapper();

    public AjaxLoginProcessingFilter(){
        super(new AntPathRequestMatcher("/api/login"));;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        //ajax 요청인지 확인
        if(!isAjax(request))
            throw new IllegalStateException(("Authentication is not supported"));
        String username = obtainUsername(request);
        String password = obtainPassword(request);
        if(username.isEmpty() || password.isEmpty())
            throw new IllegalStateException("Username or Password is empty");
        
        //AjaxAuthenticationToken을 만들어서 AuthenticationManager에 등록한다.
        AjaxAuthenticationToken ajaxAuthenticationToken = new AjaxAuthenticationToken(username,password);

        return getAuthenticationManager().authenticate(ajaxAuthenticationToken);
    }

    private boolean isAjax(HttpServletRequest request) {
        if ("XMLHttpRequest".equals(request.getHeader("X-Requested-with")))
            return true;
        return false;
    }

    @Nullable
    protected String obtainPassword(HttpServletRequest request) {
        return request.getParameter(this.passwordParameter);
    }

    @Nullable
    protected String obtainUsername(HttpServletRequest request) {
        return request.getParameter(this.usernameParameter);
    }

    public void setUsernameParameter(String usernameParameter) {
        Assert.hasText(usernameParameter, "Username parameter must not be empty or null");
        this.usernameParameter = usernameParameter;
    }

    public void setPasswordParameter(String passwordParameter) {
        Assert.hasText(passwordParameter, "Password parameter must not be empty or null");
        this.passwordParameter = passwordParameter;
    }


    public final String getUsernameParameter() {
        return this.usernameParameter;
    }

    public final String getPasswordParameter() {
        return this.passwordParameter;
    }
}
```

만들어준 필터를 등록해주는 설정을 추가한다. 

> Security Config

```java
@Bean
public AjaxLoginProcessingFilter ajaxLoginProcessingFilter() throws Exception {
    return new AjaxLoginProcessingFilter();
}

httpSecurity
    .addFilterBefore(ajaxLoginProcessingFilter(), UsernamePasswordAuthenticationFilter.class);
```
### AjaxAuthenticationProvider

Ajax 요청 방식에서 인증을 처리하는 Provider을 생성해주도록 하자

```java
@Component
@RequiredArgsConstructor
public class AjaxAuthenticationProvider implements AuthenticationProvider {

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String loginId = authentication.getName();
        String passWord = (String)authentication.getCredentials();

        AccountContext userDetails = (AccountContext)userDetailsService.loadUserByUsername(loginId);

        if(userDetails == null|| !passwordEncoder.matches(passWord,userDetails.getPassword())){
            throw new BadCredentialsException("BadCredentialException");
        }

        FormWebAuthenticationDetails details = (FormWebAuthenticationDetails)authentication.getDetails();
        String secretKey = details.getSecretKey();

        if(secretKey == null || !secretKey.equals("secret")){
            throw new InsufficientAuthenticationException("secret key error");
        }
        return new AjaxAuthenticationToken(userDetails.getAccount(), null, userDetails.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return AjaxAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
```

Provider을 만들어줬으니, AuthenticationManager에 해당 provider을 등록해주는 설정을 추가한다.

> Security Config

```java
private final AuthenticationConfiguration authenticationConfiguration;
private final AjaxAuthenticationProvider ajaxAuthenticationProvider;

@Bean
public AuthenticationManager ajaxAuthenticationManager(AuthenticationConfiguration authConfiguration) throws Exception {
    ProviderManager authenticationManager = (ProviderManager)authConfiguration.getAuthenticationManager();
    authenticationManager.getProviders().add(0,ajaxAuthenticationProvider);
    return authenticationManager;
}

@Bean
public AjaxLoginProcessingFilter ajaxLoginProcessingFilter() throws Exception {
    AjaxLoginProcessingFilter ajaxLoginProcessingFilter = new AjaxLoginProcessingFilter();
    ajaxLoginProcessingFilter.setAuthenticationManager(ajaxAuthenticationManager(authenticationConfiguration));
    return ajaxLoginProcessingFilter;
}
```




## References
link: [inflearn](https://www.inflearn.com/course/%EC%BD%94%EC%96%B4-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



