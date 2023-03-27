---
title: "Spring Security Oauth2 Part 1"
excerpt: "Spring Security Fundamentals"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# Spring Security Fundamentals

## SecurityBuilder & SecurityConfigurer

![builder_configurer](/assets/images/jsf/Spring_Security/oauth2/builder_configurer.png)

Spring Security는 내부적으로 여러 인증 필터들을 통해 각각의 보안 로직을 동작시킨다. 이때 웹 보안과 관련된 빈 객체를 생성하는 역할을 SecurityBuidler에서 담당하게 되고, HttpSecurity 와 WebSecurity가 이에 해당한다. 

form login, csrf, session, 등 각각의 보안 로직에 관련 설정은 SecurityConfigurer을 통해 이루어지며, 이는 SecurityBuilder 내부에 포함되어 있다.

SecurityBuilder가 build를 통해 객체 생성이 되는 과정에 configurer에 대해서, init과 configure 메소드가 호출되게 된다.

```java
@Override
protected final O doBuild() throws Exception {
    synchronized (this.configurers) {
        this.buildState = BuildState.INITIALIZING;
        beforeInit();
        init();
        this.buildState = BuildState.CONFIGURING;
        beforeConfigure();
        configure();
        this.buildState = BuildState.BUILDING;
        O result = performBuild();
        this.buildState = BuildState.BUILT;
        return result;
    }
}

@SuppressWarnings("unchecked")
private void init() throws Exception {
    Collection<SecurityConfigurer<O, B>> configurers = getConfigurers();
    for (SecurityConfigurer<O, B> configurer : configurers) {
        configurer.init((B) this);
    }
    for (SecurityConfigurer<O, B> configurer : this.configurersAddedInInitializing) {
        configurer.init((B) this);
    }
}

@SuppressWarnings("unchecked")
private void configure() throws Exception {
    Collection<SecurityConfigurer<O, B>> configurers = getConfigurers();
    for (SecurityConfigurer<O, B> configurer : configurers) {
        configurer.configure((B) this);
    }
}
```

Form Login 관련 설정을 처리하는 FormLoginConfigurer의 예시를 살펴보자. 내부적으로 Form Login 관련된 설정을 처리해서, LoginFilter을 만들어내는 것을 확인할 수 있다.

```java
@Override
public void init(H http) throws Exception {
    super.init(http);
    initDefaultLoginFilter(http);
}

@Override
protected RequestMatcher createLoginProcessingUrlMatcher(String loginProcessingUrl) {
    return new AntPathRequestMatcher(loginProcessingUrl, "POST");
}

/**
    * Gets the HTTP parameter that is used to submit the username.
    * @return the HTTP parameter that is used to submit the username
    */
private String getUsernameParameter() {
    return getAuthenticationFilter().getUsernameParameter();
}

/**
    * Gets the HTTP parameter that is used to submit the password.
    * @return the HTTP parameter that is used to submit the password
    */
private String getPasswordParameter() {
    return getAuthenticationFilter().getPasswordParameter();
}

/**
    * If available, initializes the {@link DefaultLoginPageGeneratingFilter} shared
    * object.
    * @param http the {@link HttpSecurityBuilder} to use
    */
private void initDefaultLoginFilter(H http) {
    DefaultLoginPageGeneratingFilter loginPageGeneratingFilter = http
            .getSharedObject(DefaultLoginPageGeneratingFilter.class);
    if (loginPageGeneratingFilter != null && !isCustomLoginPage()) {
        loginPageGeneratingFilter.setFormLoginEnabled(true);
        loginPageGeneratingFilter.setUsernameParameter(getUsernameParameter());
        loginPageGeneratingFilter.setPasswordParameter(getPasswordParameter());
        loginPageGeneratingFilter.setLoginPageUrl(getLoginPage());
        loginPageGeneratingFilter.setFailureUrl(getFailureUrl());
        loginPageGeneratingFilter.setAuthenticationUrl(getLoginProcessingUrl());
    }
}
```

## Configuration 과정

### Custom Configuration

아래와 같이 Configurer class을 만들어서 보안 설정들을 처리해서 Spring Security에 등록하는 것이 가능하다.

> CustomSecurityConfigure

```java
public class CustomSecurityConfigure extends AbstractHttpConfigurer<CustomSecurityConfigure, HttpSecurity> {
    private boolean isSecure;

    @Override
    public void init(HttpSecurity builder) throws Exception {
        super.init(builder);
        System.out.println("init method started...");
    }

    @Override
    public void configure(HttpSecurity builder) throws Exception {
        super.configure(builder);
        System.out.println("configure method started...");
        if (isSecure) {
            System.out.println("https is required");
        }
        else{
            System.out.println("https is optional");
        }
    }

    public CustomSecurityConfigure setFlag(boolean isSecure) {
        this.isSecure = isSecure;
        return this;
    }
}
```

> SecurityConfig

```java
public class SecurityConfig {

    @Bean
    public SecurityFilterChain SecurityFilterChain1(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests().anyRequest().authenticated();
        httpSecurity.apply(new CustomSecurityConfigure().setFlag(true));
        httpSecurity.formLogin();
        return httpSecurity.build();
    }
}
```

### Auto Configuration

위와 같이 위와 같이 Custom한 Configuration을 만들어주지 않는 경우 Spring은 내부에서 자동으로 Configuration을 진행한다.

> SecurityFilterAutoConfiguration

DelegatingFtilerProxy를 등록하는 작업 진행

```java
public class SecurityFilterAutoConfiguration {

	private static final String DEFAULT_FILTER_NAME = AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME;

	@Bean
	@ConditionalOnBean(name = DEFAULT_FILTER_NAME)
	public DelegatingFilterProxyRegistrationBean securityFilterChainRegistration(
			SecurityProperties securityProperties) {
		DelegatingFilterProxyRegistrationBean registration = new DelegatingFilterProxyRegistrationBean(
				DEFAULT_FILTER_NAME);
		registration.setOrder(securityProperties.getFilter().getOrder());
		registration.setDispatcherTypes(getDispatcherTypes(securityProperties));
		return registration;
	}
}
```

> HttpSecurityConfiguration

HttpSecurity 객체를 생성한다. Spring Security Config에서 따로 설정하지 않더라도 filter들이 등록되는 이유는 아래와 같이 내부에서 기본적인 filter들을 등록하기 때문이다.

```java
@Bean(HTTPSECURITY_BEAN_NAME)
@Scope("prototype")
HttpSecurity httpSecurity() throws Exception {
    LazyPasswordEncoder passwordEncoder = new LazyPasswordEncoder(this.context);
    AuthenticationManagerBuilder authenticationBuilder = new DefaultPasswordEncoderAuthenticationManagerBuilder(
            this.objectPostProcessor, passwordEncoder);
    authenticationBuilder.parentAuthenticationManager(authenticationManager());
    authenticationBuilder.authenticationEventPublisher(getAuthenticationEventPublisher());
    HttpSecurity http = new HttpSecurity(this.objectPostProcessor, authenticationBuilder, createSharedObjects());
    WebAsyncManagerIntegrationFilter webAsyncManagerIntegrationFilter = new WebAsyncManagerIntegrationFilter();
    webAsyncManagerIntegrationFilter.setSecurityContextHolderStrategy(this.securityContextHolderStrategy);
    // @formatter:off
    http
        .csrf(withDefaults())
        .addFilter(webAsyncManagerIntegrationFilter)
        .exceptionHandling(withDefaults())
        .headers(withDefaults())
        .sessionManagement(withDefaults())
        .securityContext(withDefaults())
        .requestCache(withDefaults())
        .anonymous(withDefaults())
        .servletApi(withDefaults())
        .apply(new DefaultLoginPageConfigurer<>());
    http.logout(withDefaults());
    // @formatter:on
    applyDefaultConfigurers(http);
    return http;
}
```

> SpringBootWebSecurityConfiguration

SecurityFilterChain을 등록하는 작업을 진행한다. 이때, @Conditional annotation이 설정되어 있는데, 이는 custom한 SecurityFilterChain이 있는 경우에는 아래의 SecurityFilterChain이 생성되지 않는다. 

```java
class SpringBootWebSecurityConfiguration {

	/**
	 * The default configuration for web security. It relies on Spring Security's
	 * content-negotiation strategy to determine what sort of authentication to use. If
	 * the user specifies their own {@link SecurityFilterChain} bean, this will back-off
	 * completely and the users should specify all the bits that they want to configure as
	 * part of the custom security configuration.
	 */
	@Configuration(proxyBeanMethods = false)
	@ConditionalOnDefaultWebSecurity
	static class SecurityFilterChainConfiguration {

		@Bean
		@Order(SecurityProperties.BASIC_AUTH_ORDER)
		SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
			http.authorizeHttpRequests().anyRequest().authenticated();
			http.formLogin();
			http.httpBasic();
			return http.build();
		}

	}
}
```

> WebSecurityConfiguration

WebSecurityBuilder 내부에 SecurityFilterChain들을 저장하여, 나중에, WebSecurity가 build 될때 SecurityFilterChain을 FilterChainProxy에 등록한다. @Autowired된 메소드를 통해 여러 개의 SecurityFilterChain을 등록할 수 있는 것을 확인할 수 있다.

```java
@Bean(name = AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME)
public Filter springSecurityFilterChain() throws Exception {
    boolean hasFilterChain = !this.securityFilterChains.isEmpty();
    if (!hasFilterChain) {
        this.webSecurity.addSecurityFilterChainBuilder(() -> {
            this.httpSecurity.authorizeHttpRequests((authorize) -> authorize.anyRequest().authenticated());
            this.httpSecurity.formLogin(Customizer.withDefaults());
            this.httpSecurity.httpBasic(Customizer.withDefaults());
            return this.httpSecurity.build();
        });
    }
    for (SecurityFilterChain securityFilterChain : this.securityFilterChains) {
        this.webSecurity.addSecurityFilterChainBuilder(() -> securityFilterChain);
    }
    for (WebSecurityCustomizer customizer : this.webSecurityCustomizers) {
        customizer.customize(this.webSecurity);
    }
    return this.webSecurity.build();
}

@Autowired(required = false)
void setFilterChains(List<SecurityFilterChain> securityFilterChains) {
    this.securityFilterChains = securityFilterChains;
}
```

## AuthenticationEntryPoint

로그인이 실패이후의 처리과정을 담당하는 객체이다. Form Login의 경우 /login으로 redirect, Basic 인증의 경우 Basic 헤더를 다시 받도록 하는 등, 각각의 인증방식에 따라 처리되는 것이 다르므로 이를 등록해주는 작업을 진행해야한다.

AuthenticationEntryPoint는 ExceptionTranslationFilter 에서 처리되는 것으로, ExceptionHandlingConfigurer에 AuthenticationEntryPoint을 등록한다.

> LoginUrlAuthenticationEntryPoint

Form Login의 경우 LoginUrlAuthenticationEntryPoint을 등록해서 특정 loginPage로 redirect 하도록 한다.

```java
@Override
public void commence(HttpServletRequest request, HttpServletResponse response,
        AuthenticationException authException) throws IOException, ServletException {
    if (!this.useForward) {
        // redirect to login page. Use https if forceHttps true
        String redirectUrl = buildRedirectUrlToLoginPage(request, response, authException);
        this.redirectStrategy.sendRedirect(request, response, redirectUrl);
        return;
    }
    String redirectUrl = null;
    if (this.forceHttps && "http".equals(request.getScheme())) {
        // First redirect the current request to HTTPS. When that request is received,
        // the forward to the login page will be used.
        redirectUrl = buildHttpsRedirectUrlForRequest(request);
    }
    if (redirectUrl != null) {
        this.redirectStrategy.sendRedirect(request, response, redirectUrl);
        return;
    }
    String loginForm = determineUrlToUseForThisRequest(request, response, authException);
    logger.debug(LogMessage.format("Server side forward to: %s", loginForm));
    RequestDispatcher dispatcher = request.getRequestDispatcher(loginForm);
    dispatcher.forward(request, response);
    return;
}
```

>  BasicAuthenticationEntryPoint

basic 인증 방식의 경우 BasicAuthenticationEntryPoint 등록된다.
```java
@Override
public void commence(HttpServletRequest request, HttpServletResponse response,
        AuthenticationException authException) throws IOException {
    response.addHeader("WWW-Authenticate", "Basic realm=\"" + this.realmName + "\"");
    response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.getReasonPhrase());
}
```

AuthenticationEntryPoint는 ExceptionHandlingConfigurer의 defaultEntryPointMappings에 등록된다.

```java
public final class ExceptionHandlingConfigurer<H extends HttpSecurityBuilder<H>>
		extends AbstractHttpConfigurer<ExceptionHandlingConfigurer<H>, H> {

	private AuthenticationEntryPoint authenticationEntryPoint;

	private AccessDeniedHandler accessDeniedHandler;

	private LinkedHashMap<RequestMatcher, AuthenticationEntryPoint> defaultEntryPointMappings = new LinkedHashMap<>();

    public ExceptionHandlingConfigurer<H> defaultAccessDeniedHandlerFor(AccessDeniedHandler deniedHandler,
			RequestMatcher preferredMatcher) {
		this.defaultDeniedHandlerMappings.put(preferredMatcher, deniedHandler);
		return this;
	} 
}
```

### AuthenticationEntryPoint 처리 과정

내부적으로 인증 실패에 대해 처리는 아래와 같이 이루어진다. configure 메소드 호출을 통해 실행하게될 AuthenticationEntryPoint을 설정하게 되는데, 이때 만약 AuthenticationEntryPoint 객체가 없는 경우에는 Http403ForbiddenEntryPoint을 새로 생성해서 부여한다.

```java
@Override
public void configure(H http) {
    AuthenticationEntryPoint entryPoint = getAuthenticationEntryPoint(http);
    ExceptionTranslationFilter exceptionTranslationFilter = new ExceptionTranslationFilter(entryPoint,
            getRequestCache(http));
    AccessDeniedHandler deniedHandler = getAccessDeniedHandler(http);
    exceptionTranslationFilter.setAccessDeniedHandler(deniedHandler);
    exceptionTranslationFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());
    exceptionTranslationFilter = postProcess(exceptionTranslationFilter);
    http.addFilter(exceptionTranslationFilter);
}

AuthenticationEntryPoint getAuthenticationEntryPoint(H http) {
    AuthenticationEntryPoint entryPoint = this.authenticationEntryPoint;
    if (entryPoint == null) {
        entryPoint = createDefaultEntryPoint(http);
    }
    return entryPoint;
}

private AuthenticationEntryPoint createDefaultEntryPoint(H http) {
    if (this.defaultEntryPointMappings.isEmpty()) {
        return new Http403ForbiddenEntryPoint();
    }
    if (this.defaultEntryPointMappings.size() == 1) {
        return this.defaultEntryPointMappings.values().iterator().next();
    }
    DelegatingAuthenticationEntryPoint entryPoint = new DelegatingAuthenticationEntryPoint(
            this.defaultEntryPointMappings);
    entryPoint.setDefaultEntryPoint(this.defaultEntryPointMappings.values().iterator().next());
    return entryPoint;
}
```

만일, 2개 이상의 AuthenticationEntryPoint가 설정되어 있는 경우에는 아래의 AuthenticationEntryPoint가 실행되어, request에 적합한 AuthenticationEntryPoint을 찾아서 실행한다.

```java

public class DelegatingAuthenticationEntryPoint {
@Override
public void commence(HttpServletRequest request, HttpServletResponse response,
        AuthenticationException authException) throws IOException, ServletException {
    for (RequestMatcher requestMatcher : this.entryPoints.keySet()) {
        logger.debug(LogMessage.format("Trying to match using %s", requestMatcher));
        if (requestMatcher.matches(request)) {
            AuthenticationEntryPoint entryPoint = this.entryPoints.get(requestMatcher);
            logger.debug(LogMessage.format("Match found! Executing %s", entryPoint));
            entryPoint.commence(request, response, authException);
            return;
        }
    }
    logger.debug(LogMessage.format("No match found. Using default entry point %s", this.defaultEntryPoint));
    // No EntryPoint matched, use defaultEntryPoint
    this.defaultEntryPoint.commence(request, response, authException);
    }   
}
```

아래와 같이 Custom AuthenticationEntryPoint을 부여한 경우

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
    httpSecurity.authorizeHttpRequests().anyRequest().authenticated();
    httpSecurity.formLogin();
    httpSecurity.httpBasic();
    httpSecurity.exceptionHandling().authenticationEntryPoint(new AuthenticationEntryPoint() {
        @Override
        public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
            System.out.println("Custom Authentication Entrypoint");
        }
    });
    return httpSecurity.build();
}
```
AuthenticationEntryPoint을 생성하는 작업은 생략한다.

```java
AuthenticationEntryPoint getAuthenticationEntryPoint(H http) {
    AuthenticationEntryPoint entryPoint = this.authenticationEntryPoint;
    if (entryPoint == null) {
        entryPoint = createDefaultEntryPoint(http);
    }
    return entryPoint;
}
```

## Http Basic

![http_basic](/assets/images/jsf/Spring_Security/oauth2/http_basic.png)

http basic 인증 방식은 인증 헤더를 활용하여 인증을 수행하는 방식이다. user, password 값을 base64로 encoding해서 header에 작성하여 서버로 전달해서 서버는 헤더의 값을 통해 인증을 처리한다. 헤더의 경우 그대로 값이 노출되기 때문에 https을 통해 통신 회선을 암호화하는 것이 필요하다.

Http Basic 관련 인증 처리는 BasicAuthenticationFilter에서 처리하게 된다.

### 인증 과정

1. BasicAuthenticationConverter을 활용하여 헤더 추출해서 UsernamePasswordAuthenticationToken 객체 생성

```java
UsernamePasswordAuthenticationToken authRequest = this.authenticationConverter.convert(request);
```

2. UsernamePasswordAuthenticationToken을 활용하여 인증 처리

```java
Authentication authResult = this.authenticationManager.authenticate(authRequest);

```

3-1: 인증에 실패한 경우 AuthenticationEntryPoint을 호출한다.

```java
this.authenticationEntryPoint.commence(request, response, ex);
```

3-2: 인증에 성공하면 SecurityContext에 저장한다.

```java
SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();
context.setAuthentication(authResult);
this.securityContextHolderStrategy.setContext(context);
```

> 세션 활용

인증을 처리하기 전에 SecurityContext에서 Authentication을 가져오는 작업을 진행하는데, 이는 세션을 활용하는 Basic 인증방식의 경우 인증 이후에 Session에 Authentication을 저장하게 되므로 나중에 재접근시 인증처리 과정을 생략가능하다. 세션이 없는 경우에는 매번 인증과정을 거친다.

```java
protected boolean authenticationIsRequired(String username) {
    // Only reauthenticate if username doesn't match SecurityContextHolder and user
    // isn't authenticated (see SEC-53)
    Authentication existingAuth = this.securityContextHolderStrategy.getContext().getAuthentication();
    if (existingAuth == null || !existingAuth.getName().equals(username) || !existingAuth.isAuthenticated()) {
        return true;
    }
    // Handle unusual condition where an AnonymousAuthenticationToken is already
    // present. This shouldn't happen very often, as BasicProcessingFitler is meant to
    // be earlier in the filter chain than AnonymousAuthenticationFilter.
    // Nevertheless, presence of both an AnonymousAuthenticationToken together with a
    // BASIC authentication request header should indicate reauthentication using the
    // BASIC protocol is desirable. This behaviour is also consistent with that
    // provided by form and digest, both of which force re-authentication if the
    // respective header is detected (and in doing so replace/ any existing
    // AnonymousAuthenticationToken). See SEC-610.
    return (existingAuth instanceof AnonymousAuthenticationToken);
    }
```

## CORS

Browser은 기본적으로 SOP(Single Origin Policy) 기반으로 동작한다. 다른 도메인의 자원에 대한 접근에 대해서는 브라우저 자체에서 접근을 제한하기 때문에, 다른 출처의 자원에 접근하기 위해서는 적절한 헤더처리가 요구된다. 

아무런 처리를 하지 않으면 아래와 같이 SOP에 따라 에러가 발생하게 된다.
[cors_issue](/assets/images/jsf/Spring_Security/oauth2/cors_issue.png)

Access-Control-Allow-Origin, Access-Control-Allow-Method 등의 헤더 값을 비교하여 다른 출처의 자원에 대한 접근을 판단한다.

### Simple Request

![simple_request](/assets/images/jsf/Spring_Security/oauth2/simple_request.png)

Prefligt Request(예비요청) 없이 바로 서버에 자원을 요청하고, 서버에서 전달한 Http Response의 Access-Control-Allow-Origin의 헤더값을 확인하여 허용여부를 판단한다.

Simple Request 방식을 사용하기 위해서는 아래의 조건들을 만족해야한다.

1. Http METHOD는 GET,POST,HEAD Method 중에 선택
2. Accept, Accept-Language,Content-Language, Content-Type, DPR, Downlink, Save-Data, Viewport-Width, Width와 같은 헤더 설정만 가능하다.
3. Content-Type는 application/x-www-form-urlencoded, multipart/form-data, text/plain만 가능하다.

> CORS 요청 

```html
<script>
    function corsTest(){
        fetch("http://localhost:8081/api/users",{
            method : "GET",
            headers : {
                "Content-Type" : "text/plain",
            }
        })
            .then(response => {
                response.json().then(function(data){
                    console.log(data)
                })
            })
    }

</script>
```

위와 같이 요청하게 되면 Simple-Request 조건에 부합하기 때문에 Simple-Request 방식에 따라 처리된다. 아래의 그림을 통해 요청에 대한 HttpResponse가 정상적으로 오는 것을 확인할 수 있다.

[simple_request_example](/assets/images/jsf/Spring_Security/oauth2/simple_request_example.png)

### Preflight Request

[preflight_request](/assets/images/jsf/Spring_Security/oauth2/preflight_request.png)

Simple Request의 조건에 부합하지 않은 경우 Prefligt Request 방식으로 처리되게 된다. 이는 본 자원에 대한 요청을 처리하기 전에 Preflight Request(예비 요청)을 보내서 서버의 자원에 대한 접근이 가능한지를 판단한 후 실제 요청을 보낸다. 

> Prefligt Request

Content-Type이 text/xml이므로 Simple Request는 불가능하다.

```html
<script>
    function corsTest(){
        fetch("http://localhost:8081/api/users",{
            method : "GET",
            headers : {
                "Content-Type" : "text/xml",
            }
        })
            .then(response => {
                response.json().then(function(data){
                    console.log(data)
                })
            })
    }

</script>
```

아래의 그림을 통해 preflight request를 먼저 보낸 이후에, 본 요청을 보내는 것을 확인할 수 있다.

![preflight_request_example](/assets/images/jsf/Spring_Security/oauth2/preflight_request_example.png)

### CorsFilter

Spring에서 CORS 관련 처리는 CorsFilter에서 담당한다.

|Headers|Description|
|--|--|
|Access-Control-Allow-Origin|접근 가능한 리소스의 출처 명시|
|Access-Control-Allow-Methods|실제 요청 가능한 메소드의 종류 명시|
|Access-Control-Allow-Headers|실제 요청시 사용가능한 헤더 정의|
|Access-Control-Allow-Credentials|쿠키, 인증 등의 사용자 자격증명이 포함될 수 있음을 명시(단,해당 헤더를 사용하는 경우 Access-Control-Allow-Origin의 값은 "*"이 될수 없다.)|
|Access-Control-Max-Age|Prefligt 요청에 대한 캐싱을 진행하여, 해당 시간동안 Prefligt 요청을 중복처리하지 않는다.|

> Security Config

CorsConfiguration을 통해 Cors 관련 설정을 하며, CorsConfigurationSource에 담아서 Bean 객체로 만들게 되면 CorsConfigurer에서 이에 대한 처리를 한다.

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
    httpSecurity.authorizeHttpRequests().anyRequest().permitAll();
    httpSecurity.cors().configurationSource(corsConfigurationSource());
    return httpSecurity.build();
}

@Bean
public CorsConfigurationSource corsConfigurationSource(){
    CorsConfiguration corsConfiguration = new CorsConfiguration();
    corsConfiguration.addAllowedOrigin("*");
    corsConfiguration.addAllowedHeader("*");
    corsConfiguration.addAllowedMethod("*");

    UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
    urlBasedCorsConfigurationSource.registerCorsConfiguration("/**",corsConfiguration);
    return urlBasedCorsConfigurationSource;

}
```

> CorsConfigurer

CorsFilter을 만들때 필요한 설정들을 진행한다. CorsFilter을 만들 때 CorsConfigurationSource 객체를 찾아서 전달하는데, 만일 없으면 Spring 내부에 기본적으로 설정된 Configuration을 활용한다.

```java
@Override
public void configure(H http) {
    ApplicationContext context = http.getSharedObject(ApplicationContext.class);
    CorsFilter corsFilter = getCorsFilter(context);
    Assert.state(corsFilter != null, () -> "Please configure either a " + CORS_FILTER_BEAN_NAME + " bean or a "
            + CORS_CONFIGURATION_SOURCE_BEAN_NAME + "bean.");
    http.addFilter(corsFilter);
}

private CorsFilter getCorsFilter(ApplicationContext context) {
    if (this.configurationSource != null) {
        return new CorsFilter(this.configurationSource);
    }
    boolean containsCorsFilter = context.containsBeanDefinition(CORS_FILTER_BEAN_NAME);
    if (containsCorsFilter) {
        return context.getBean(CORS_FILTER_BEAN_NAME, CorsFilter.class);
    }
    boolean containsCorsSource = context.containsBean(CORS_CONFIGURATION_SOURCE_BEAN_NAME);
    if (containsCorsSource) {
        CorsConfigurationSource configurationSource = context.getBean(CORS_CONFIGURATION_SOURCE_BEAN_NAME,
                CorsConfigurationSource.class);
        return new CorsFilter(configurationSource);
    }
    if (mvcPresent) {
        return MvcCorsFilter.getMvcCorsFilter(context);
    }
    return null;
}
```

> CorsFilter

```java
@Override
public void doFilter(final ServletRequest servletRequest, final ServletResponse servletResponse,
        final FilterChain filterChain) throws IOException, ServletException {
    if (!(servletRequest instanceof HttpServletRequest) || !(servletResponse instanceof HttpServletResponse)) {
        throw new ServletException(sm.getString("corsFilter.onlyHttp"));
    }

    // Safe to downcast at this point.
    HttpServletRequest request = (HttpServletRequest) servletRequest;
    HttpServletResponse response = (HttpServletResponse) servletResponse;

    // Determines the CORS request type.
    CorsFilter.CORSRequestType requestType = checkRequestType(request);

    // Adds CORS specific attributes to request.
    if (isDecorateRequest()) {
        CorsFilter.decorateCORSProperties(request, requestType);
    }
    switch (requestType) {
        case SIMPLE:
            // Handles a Simple CORS request.
        case ACTUAL:
            // Handles an Actual CORS request.
            this.handleSimpleCORS(request, response, filterChain);
            break;
        case PRE_FLIGHT:
            // Handles a Pre-flight CORS request.
            this.handlePreflightCORS(request, response, filterChain);
            break;
        case NOT_CORS:
            // Handles a Normal request that is not a cross-origin request.
            this.handleNonCORS(request, response, filterChain);
            break;
        default:
            // Handles a CORS request that violates specification.
            this.handleInvalidCORS(request, response, filterChain);
            break;
    }
}
```

> Simple Request 처리

Access-Control-Allow-Origin, Access-Control-Allow-Method에 따른 처리를 진행

```java
protected void handleSimpleCORS(final HttpServletRequest request, final HttpServletResponse response,
            final FilterChain filterChain) throws IOException, ServletException {

    CorsFilter.CORSRequestType requestType = checkRequestType(request);
    if (!(requestType == CorsFilter.CORSRequestType.SIMPLE || requestType == CorsFilter.CORSRequestType.ACTUAL)) {
        throw new IllegalArgumentException(sm.getString("corsFilter.wrongType2", CorsFilter.CORSRequestType.SIMPLE,
                CorsFilter.CORSRequestType.ACTUAL));
    }

    final String origin = request.getHeader(CorsFilter.REQUEST_HEADER_ORIGIN);
    final String method = request.getMethod();

    // Section 6.1.2
    if (!isOriginAllowed(origin)) {
        handleInvalidCORS(request, response, filterChain);
        return;
    }

    if (!getAllowedHttpMethods().contains(method)) {
        handleInvalidCORS(request, response, filterChain);
        return;
    }

    addStandardHeaders(request, response);

    // Forward the request down the filter chain.
    filterChain.doFilter(request, response);
}
```

> Preflight Request 처리 

Simple Request 보다 처리 가능한 Header 들이 더 많아서, 조금 더 세밀한 처리가 가능하다.

```java
protected void handlePreflightCORS(final HttpServletRequest request, final HttpServletResponse response,
            final FilterChain filterChain) throws IOException, ServletException {

    CORSRequestType requestType = checkRequestType(request);
    if (requestType != CORSRequestType.PRE_FLIGHT) {
        throw new IllegalArgumentException(sm.getString("corsFilter.wrongType1",
                CORSRequestType.PRE_FLIGHT.name().toLowerCase(Locale.ENGLISH)));
    }

    final String origin = request.getHeader(CorsFilter.REQUEST_HEADER_ORIGIN);

    // Section 6.2.2
    if (!isOriginAllowed(origin)) {
        handleInvalidCORS(request, response, filterChain);
        return;
    }

    // Section 6.2.3
    String accessControlRequestMethod = request.getHeader(CorsFilter.REQUEST_HEADER_ACCESS_CONTROL_REQUEST_METHOD);
    if (accessControlRequestMethod == null) {
        handleInvalidCORS(request, response, filterChain);
        return;
    } else {
        accessControlRequestMethod = accessControlRequestMethod.trim();
    }

    // Section 6.2.4
    String accessControlRequestHeadersHeader = request
            .getHeader(CorsFilter.REQUEST_HEADER_ACCESS_CONTROL_REQUEST_HEADERS);
    List<String> accessControlRequestHeaders = new ArrayList<>();
    if (accessControlRequestHeadersHeader != null && !accessControlRequestHeadersHeader.trim().isEmpty()) {
        String[] headers = accessControlRequestHeadersHeader.trim().split(",");
        for (String header : headers) {
            accessControlRequestHeaders.add(header.trim().toLowerCase(Locale.ENGLISH));
        }
    }

    // Section 6.2.5
    if (!getAllowedHttpMethods().contains(accessControlRequestMethod)) {
        handleInvalidCORS(request, response, filterChain);
        return;
    }

    // Section 6.2.6
    if (!accessControlRequestHeaders.isEmpty()) {
        for (String header : accessControlRequestHeaders) {
            if (!getAllowedHttpHeaders().contains(header)) {
                handleInvalidCORS(request, response, filterChain);
                return;
            }
        }
    }

    addStandardHeaders(request, response);

    // Do not forward the request down the filter chain.
}

```







## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



