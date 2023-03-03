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
    ajaxLoginProcessingFilter.setSecurityContextRepository(new HttpSessionSecurityContextRepository());  //AbstractAuthenticationProcessingFilter의 기본형이 RequestAttributeSecurityContextRepository인데, 이를 활용할시에는 Session에 Security Context을 저장하는 작업을 진행하지 않게되므로, HttpSessionSecurityContextRepository로 설정하도록 한다.
    return ajaxLoginProcessingFilter;
}
```

### Success Handler & Failure Handler

인증이 성공하거나, 실패했을 때 호출되는 handler들을 정의한다.

> AjaxSuccessHandler

```java

@Component
public class AjaxSuccessHandler implements AuthenticationSuccessHandler {
    private ObjectMapper objectMapper = new ObjectMapper();
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        Account account = (Account)authentication.getPrincipal();

        response.setStatus(HttpStatus.OK.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        objectMapper.writeValue(response.getWriter(),account);
    }
}
```

> AjaxFailureHandler

```java
@Component
public class AjaxFailureHandler implements AuthenticationFailureHandler {
    private ObjectMapper objectMapper = new ObjectMapper();
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        String errorMessage = "Invalid Username or Password";

        if (exception instanceof UsernameNotFoundException) {
            errorMessage = "Invalid Username or Password";
        } else if (exception instanceof InsufficientAuthenticationException) {
            errorMessage = " Invalid Secret Key";
        }

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        objectMapper.writeValue(response.getWriter(), errorMessage);
    }
}
```

> Security Config

```java

private final AjaxSuccessHandler ajaxSuccessHandler;
private final AjaxFailureHandler ajaxFailureHandler;

public AjaxLoginProcessingFilter ajaxLoginProcessingFilter() throws Exception {
    ...
    ajaxLoginProcessingFilter.setAuthenticationSuccessHandler(ajaxSuccessHandler);
    ajaxLoginProcessingFilter.setAuthenticationFailureHandler(ajaxFailureHandler);
    ...
    return ajaxLoginProcessingFilter;
}
```

### AuthenticationEntryPoint & AccessDeniedHandler

ExceptionTranslationFilter에서 인증 예외가 발생항게 되면 AuthenticationException이 발생하게 되면서 RequestCache 처리와 AuthenticationEntrypoint을 호출하게 된다. 인가 예외가 발생했을 경우에는 AccessDeniedException을 발생시켜 AccessDeniedHandler을 호출한다.

> AjaxLoginAuthenticationEntryPoint

```java
@Component
public class AjaxLoginAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
    }
}
```

> AjaxAccessDeniedHandler

```java
@Component
public class AjaxAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access is denied");
    }
}
```

> Securiy Config

```java
private final AjaxLoginAuthenticationEntryPoint ajaxLoginAuthenticationEntryPoint;
private final AjaxAccessDeniedHandler ajaxAccessDeniedHandler;

public SecurityFilterChain securityFilterChain(HttpSecutiry httpSecurity){
    httpSecurity.exceptionHandling()
            .authenticationEntryPoint(ajaxLoginAuthenticationEntryPoint)
            .accessDeniedHandler(ajaxAccessDeniedHandler);
}
```

### DSL Configurer

DSL을 활용해서 Config file을 클래스 하나로 일괄적으로 관리할 수 있다.

> AjaxLoginConfigurer

```java
public class AjaxLoginConfigurer<H extends HttpSecurityBuilder<H>> extends AbstractAuthenticationFilterConfigurer<H,AjaxLoginConfigurer<H>, AjaxLoginProcessingFilter> {
    private AuthenticationSuccessHandler successHandler;
    private AuthenticationFailureHandler failureHandler;
    private AuthenticationManager authenticationManager;

    private AuthenticationDetailsSource authencationDetailsSource;

    public AjaxLoginConfigurer() {
        super(new AjaxLoginProcessingFilter(), null);
    }

    @Override
    public void init(H http) throws Exception {
        super.init(http);
    }

    @Override
    public void configure(H http) {

        if(authenticationManager == null){
            authenticationManager = http.getSharedObject(AuthenticationManager.class);
        }
        getAuthenticationFilter().setAuthenticationManager(authenticationManager);
        getAuthenticationFilter().setAuthenticationSuccessHandler(successHandler);
        getAuthenticationFilter().setAuthenticationFailureHandler(failureHandler);
        getAuthenticationFilter().setAuthenticationDetailsSource(authencationDetailsSource);

        SessionAuthenticationStrategy sessionAuthenticationStrategy = http
                .getSharedObject(SessionAuthenticationStrategy.class);
        if (sessionAuthenticationStrategy != null) {
            getAuthenticationFilter().setSessionAuthenticationStrategy(sessionAuthenticationStrategy);
        }
        RememberMeServices rememberMeServices = http
                .getSharedObject(RememberMeServices.class);
        if (rememberMeServices != null) {
            getAuthenticationFilter().setRememberMeServices(rememberMeServices);
        }
        http.setSharedObject(AjaxLoginProcessingFilter.class,getAuthenticationFilter());
        http.addFilterBefore(getAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    }

    public AjaxLoginConfigurer<H> successHandlerAjax(AuthenticationSuccessHandler successHandler) {
        this.successHandler = successHandler;
        return this;
    }

    public AjaxLoginConfigurer<H> failureHandlerAjax(AuthenticationFailureHandler authenticationFailureHandler) {
        this.failureHandler = authenticationFailureHandler;
        return this;
    }

    public AjaxLoginConfigurer<H> setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
        return this;
    }

    public AjaxLoginConfigurer<H> setAuthenticationDetailsSource(AuthenticationDetailsSource authenticationDetailsSource) {
        this.authencationDetailsSource = authenticationDetailsSource;
        return this;
    }

    @Override
    protected RequestMatcher createLoginProcessingUrlMatcher(String loginProcessingUrl) {
        return new AntPathRequestMatcher(loginProcessingUrl, "POST");
    }
}

```

위와 같은 configurer class을 정의하면 아래와 같이 간단하게 처리할 수 있게 된다. Security Class에 표준화된 설정을 처리할 수 있다는 것이 DSL 만의 장점이다.

> Security Config

```java
private void customConfigurerAjax(HttpSecurity httpSecurity) throws Exception {
    httpSecurity
            .apply(new AjaxLoginConfigurer<>())
            .successHandlerAjax(ajaxSuccessHandler)
            .failureHandlerAjax(ajaxFailureHandler)
            .setAuthenticationManager(ajaxAuthenticationManager(authenticationConfiguration));
    httpSecurity.formLogin()
            .loginPage("/api/login")
            .loginProcessingUrl("api/login")
            .permitAll();
    }

public SecurityFilterChain ajaxSecurityFilterChain(HttpSecurity httpSecurity) throws Exception{
    customConfigurerAjax(httpSecurity);
    return httpSecurity.build()
}
```





## References
link: [inflearn](https://www.inflearn.com/course/%EC%BD%94%EC%96%B4-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



