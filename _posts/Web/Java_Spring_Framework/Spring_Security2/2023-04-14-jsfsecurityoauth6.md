---
title: "Spring Security Oauth2 Part 6"
excerpt: "Oauth2 Client"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# OAuth2 Client

OAuth2 Client 방식의 인증을 살펴보자.

> OAuth2Login

1. Authorization Code 발급
2. Access Token 발급
3. UserInfo 요청 --> 최종 사용자 인증

> OAuth2Client

1. Authorization Code 발급
2. Access Token 발급

OAuth2Client는 OAuth2Login 과정에서 최종 사용자에 대한 인증을 제외한 과정까지 진행하게 된다. 따라서, 이후 최종 사용자에 대한 인증은 과정은 직접 구현해야한다.

## OAuth2AuthorizationCodeGrantFilter

LoginAuthenticationFilter 대신, CodeGrantFilter가 동작하는데, 사용자 인증을 제외한 과정을 처리한다. 아래의 코드를 보면 알듯이, Authentication 객체를 반환하지 않고 단순히 OAutheAuthorizedClient을 저장해서 Redirect Uri로 이동하는 작업을 수행한다.

> LoginAuthenticationFilter

```java
@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException {
		MultiValueMap<String, String> params = OAuth2AuthorizationResponseUtils.toMultiMap(request.getParameterMap());
		if (!OAuth2AuthorizationResponseUtils.isAuthorizationResponse(params)) {
			OAuth2Error oauth2Error = new OAuth2Error(OAuth2ErrorCodes.INVALID_REQUEST);
			throw new OAuth2AuthenticationException(oauth2Error, oauth2Error.toString());
		}
		OAuth2AuthorizationRequest authorizationRequest = this.authorizationRequestRepository
				.removeAuthorizationRequest(request, response);
		if (authorizationRequest == null) {
			OAuth2Error oauth2Error = new OAuth2Error(AUTHORIZATION_REQUEST_NOT_FOUND_ERROR_CODE);
			throw new OAuth2AuthenticationException(oauth2Error, oauth2Error.toString());
		}
		String registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
		ClientRegistration clientRegistration = this.clientRegistrationRepository.findByRegistrationId(registrationId);
		if (clientRegistration == null) {
			OAuth2Error oauth2Error = new OAuth2Error(CLIENT_REGISTRATION_NOT_FOUND_ERROR_CODE,
					"Client Registration not found with Id: " + registrationId, null);
			throw new OAuth2AuthenticationException(oauth2Error, oauth2Error.toString());
		}
		// @formatter:off
		String redirectUri = UriComponentsBuilder.fromHttpUrl(UrlUtils.buildFullRequestUrl(request))
				.replaceQuery(null)
				.build()
				.toUriString();
		// @formatter:on
		OAuth2AuthorizationResponse authorizationResponse = OAuth2AuthorizationResponseUtils.convert(params,
				redirectUri);
		Object authenticationDetails = this.authenticationDetailsSource.buildDetails(request);
		OAuth2LoginAuthenticationToken authenticationRequest = new OAuth2LoginAuthenticationToken(clientRegistration,
				new OAuth2AuthorizationExchange(authorizationRequest, authorizationResponse));
		authenticationRequest.setDetails(authenticationDetails);
		OAuth2LoginAuthenticationToken authenticationResult = (OAuth2LoginAuthenticationToken) this
				.getAuthenticationManager().authenticate(authenticationRequest);
		OAuth2AuthenticationToken oauth2Authentication = this.authenticationResultConverter
				.convert(authenticationResult);
		Assert.notNull(oauth2Authentication, "authentication result cannot be null");
		oauth2Authentication.setDetails(authenticationDetails);
		OAuth2AuthorizedClient authorizedClient = new OAuth2AuthorizedClient(
				authenticationResult.getClientRegistration(), oauth2Authentication.getName(),
				authenticationResult.getAccessToken(), authenticationResult.getRefreshToken());

		this.authorizedClientRepository.saveAuthorizedClient(authorizedClient, oauth2Authentication, request, response);
		return oauth2Authentication;
	}
```

> CodeGrantFilter

```java
private void processAuthorizationResponse(HttpServletRequest request, HttpServletResponse response)
        throws IOException {
    OAuth2AuthorizationRequest authorizationRequest = this.authorizationRequestRepository
            .removeAuthorizationRequest(request, response);
    String registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);
    ClientRegistration clientRegistration = this.clientRegistrationRepository.findByRegistrationId(registrationId);
    MultiValueMap<String, String> params = OAuth2AuthorizationResponseUtils.toMultiMap(request.getParameterMap());
    String redirectUri = UrlUtils.buildFullRequestUrl(request);
    OAuth2AuthorizationResponse authorizationResponse = OAuth2AuthorizationResponseUtils.convert(params,
            redirectUri);
    OAuth2AuthorizationCodeAuthenticationToken authenticationRequest = new OAuth2AuthorizationCodeAuthenticationToken(
            clientRegistration, new OAuth2AuthorizationExchange(authorizationRequest, authorizationResponse));
    authenticationRequest.setDetails(this.authenticationDetailsSource.buildDetails(request));
    OAuth2AuthorizationCodeAuthenticationToken authenticationResult;
    try {
        authenticationResult = (OAuth2AuthorizationCodeAuthenticationToken) this.authenticationManager
                .authenticate(authenticationRequest);
    }
    catch (OAuth2AuthorizationException ex) {
        OAuth2Error error = ex.getError();
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromUriString(authorizationRequest.getRedirectUri())
                .queryParam(OAuth2ParameterNames.ERROR, error.getErrorCode());
        if (!StringUtils.isEmpty(error.getDescription())) {
            uriBuilder.queryParam(OAuth2ParameterNames.ERROR_DESCRIPTION, error.getDescription());
        }
        if (!StringUtils.isEmpty(error.getUri())) {
            uriBuilder.queryParam(OAuth2ParameterNames.ERROR_URI, error.getUri());
        }
        this.redirectStrategy.sendRedirect(request, response, uriBuilder.build().encode().toString());
        return;
    }
    Authentication currentAuthentication = this.securityContextHolderStrategy.getContext().getAuthentication();
    String principalName = (currentAuthentication != null) ? currentAuthentication.getName() : "anonymousUser";
    OAuth2AuthorizedClient authorizedClient = new OAuth2AuthorizedClient(
            authenticationResult.getClientRegistration(), principalName, authenticationResult.getAccessToken(),
            authenticationResult.getRefreshToken());
    this.authorizedClientRepository.saveAuthorizedClient(authorizedClient, currentAuthentication, request,
            response);
    String redirectUrl = authorizationRequest.getRedirectUri();
    SavedRequest savedRequest = this.requestCache.getRequest(request, response);
    if (savedRequest != null) {
        redirectUrl = savedRequest.getRedirectUrl();
        this.requestCache.removeRequest(request, response);
    }
    this.redirectStrategy.sendRedirect(request, response, redirectUrl);
}
```

## OAuth2AuthorizedClientManager

OAuth2AuthorizedClient를 전반적으로 관리하는 객체로, 각 권한 부여에 맞는 Provider을 실행하여 실제 권한 부여 흐름에 맞게 처리를 수행하고 OAuth2AuthorizedClient을 최종적으로 반환한다. 다음과 같이 필요한 Provider을 생성해서 Client Manager에 설정한 DefaultOAuth2AuthorizedClientManager 객체를 Bean으로 등록하여 이후 인증 과정에서 사용할 수 있도록 한다.

```java
@Bean
public DefaultOAuth2AuthorizedClientManager oAuth2AuthorizedClientManager(ClientRegistrationRepository clientRegistrationRepository, OAuth2AuthorizedClientRepository oAuth2AuthorizedClientRepository) {
    OAuth2AuthorizedClientProvider oAuth2AuthorizedClientProvider = OAuth2AuthorizedClientProviderBuilder.builder()
            .authorizationCode()
            .password(passwordGrantBuilder -> passwordGrantBuilder.clockSkew(Duration.ofSeconds(3600)))
            .clientCredentials()
            .refreshToken(refreshTokenGrantBuilder -> refreshTokenGrantBuilder.clockSkew(Duration.ofSeconds(3600)))
            .build();
    
    OAuth2AuthorizationSuccessHandler authorizationSuccessHandler = (authorizedClient, principal, attributes) -> oAuth2AuthorizedClientRepository
            .saveAuthorizedClient(authorizedClient, principal,
                    (HttpServletRequest) attributes.get(HttpServletRequest.class.getName()),
                    (HttpServletResponse) attributes.get(HttpServletResponse.class.getName()));


    DefaultOAuth2AuthorizedClientManager oAuth2AuthorizedClientManager  = new DefaultOAuth2AuthorizedClientManager(clientRegistrationRepository,oAuth2AuthorizedClientRepository);
    oAuth2AuthorizedClientManager.setAuthorizedClientProvider(oAuth2AuthorizedClientProvider);
    oAuth2AuthorizedClientManager.setAuthorizationSuccessHandler(authorizationSuccessHandler);
    return oAuth2AuthorizedClientManager;
}
```

## OAuth2 Client을 활용하여 로그인 처리

1. /oauth2Login으로 요청을 보내 권한 부여 흐름을 요청한다.

```java
@GetMapping("/oauth2Login")
public String oauth2Login(Model model, HttpServletRequest request, HttpServletResponse response) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    OAuth2AuthorizeRequest oAuth2AuthorizeRequest = OAuth2AuthorizeRequest.withClientRegistrationId("keycloak")
            .principal(authentication)
            .attribute(HttpServletRequest.class.getName(), request)
            .attribute(HttpServletResponse.class.getName(), response)
            .build();

    OAuth2AuthorizedClient authorizedClient = oAuth2AuthorizedClientManager.authorize(oAuth2AuthorizeRequest);
}
```

2. DefaultOAuth2AuthorizedClientManager을 활용하여 권한 부여 흐름을 처리한다.

3. 이후, OAuth2AuthorizedClient을 활용하여 /userinfo에 대한 요청으로 사용자 정보를 받와서 인증객체를 만들어낸다.

```java
if(oAuth2AuthorizedClient != null) {
    ClientRegistration clientRegistration = oAuth2AuthorizedClient.getClientRegistration();
    OAuth2AccessToken accessToken = oAuth2AuthorizedClient.getAccessToken();
    OAuth2RefreshToken refreshToken = oAuth2AuthorizedClient.getRefreshToken();

    OAuth2UserService oAuth2UserService = new DefaultOAuth2UserService();
    OAuth2User oauth2User = oAuth2UserService.loadUser(new OAuth2UserRequest(
            oAuth2AuthorizedClient.getClientRegistration(), accessToken));

    SimpleAuthorityMapper simpleAuthorityMapper = new SimpleAuthorityMapper();
    Collection<? extends GrantedAuthority> authorities = simpleAuthorityMapper.mapAuthorities(oauth2User.getAuthorities());
    OAuth2AuthenticationToken oAuth2AuthenticationToken = new OAuth2AuthenticationToken(oauth2User, authorities, clientRegistration.getRegistrationId());

    authorizationSuccessHandler.onAuthorizationSuccess(oAuth2AuthorizedClient, oAuth2AuthenticationToken, createAttributes(request, response));

    return oAuth2AuthenticationToken;
}
```

## 권한 부여 흐름 처리

전체적인 흐름은 OAuth2ClientManager에서 정의한 대로 진행하지만 각 권한 부여 흐름에 따라 그에 맞는 Provider가 동작하게 된다.

```java
@Override
@Nullable
public OAuth2AuthorizedClient authorize(OAuth2AuthorizationContext context) {
    Assert.notNull(context, "context cannot be null");
    for (OAuth2AuthorizedClientProvider authorizedClientProvider : this.authorizedClientProviders) {
        OAuth2AuthorizedClient oauth2AuthorizedClient = authorizedClientProvider.authorize(context);
        if (oauth2AuthorizedClient != null) {
            return oauth2AuthorizedClient;
        }
    }
    return null;
}
```

### Resource Owner Flow

![resource_owner_flow](/assets/images/jsf/Spring_Security/oauth2/resource_owner_flow.png)

```java
@Override
@Nullable
public OAuth2AuthorizedClient authorize(OAuth2AuthorizationContext context) {
    Assert.notNull(context, "context cannot be null");
    ClientRegistration clientRegistration = context.getClientRegistration();
    OAuth2AuthorizedClient authorizedClient = context.getAuthorizedClient();
    if (!AuthorizationGrantType.PASSWORD.equals(clientRegistration.getAuthorizationGrantType())) {
        return null;
    }
    String username = context.getAttribute(OAuth2AuthorizationContext.USERNAME_ATTRIBUTE_NAME);
    String password = context.getAttribute(OAuth2AuthorizationContext.PASSWORD_ATTRIBUTE_NAME);
    if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
        return null;
    }
    if (authorizedClient != null && !hasTokenExpired(authorizedClient.getAccessToken())) {
        // If client is already authorized and access token is NOT expired than no
        // need for re-authorization
        return null;
    }
    if (authorizedClient != null && hasTokenExpired(authorizedClient.getAccessToken())
            && authorizedClient.getRefreshToken() != null) {
        // If client is already authorized and access token is expired and a refresh
        // token is available, than return and allow
        // RefreshTokenOAuth2AuthorizedClientProvider to handle the refresh
        return null;
    }
    OAuth2PasswordGrantRequest passwordGrantRequest = new OAuth2PasswordGrantRequest(clientRegistration, username,
            password);
    OAuth2AccessTokenResponse tokenResponse = getTokenResponse(clientRegistration, passwordGrantRequest);
    return new OAuth2AuthorizedClient(clientRegistration, context.getPrincipal().getName(),
            tokenResponse.getAccessToken(), tokenResponse.getRefreshToken());
}
```

Password 방식의 경우 Attribute에 username, password을 담아서 전달해야 한다. 이 과정은 ClientManager을 초기화하는 과정에서 AttributeMapper을 등록하는 작업을 통해 이루어진다.

```java
DefaultOAuth2AuthorizedClientManager oAuth2AuthorizedClientManager  = new DefaultOAuth2AuthorizedClientManager(clientRegistrationRepository,oAuth2AuthorizedClientRepository);
oAuth2AuthorizedClientManager.setContextAttributesMapper(contextAttributesMapper());

private Function<OAuth2AuthorizeRequest, Map<String, Object>> contextAttributesMapper() {
    return oAuth2AuthorizeRequest -> {
        Map<String, Object> contextAttributes = new HashMap<>();
        HttpServletRequest request = oAuth2AuthorizeRequest.getAttribute(HttpServletRequest.class.getName());

        String username = request.getParameter(OAuth2ParameterNames.USERNAME);
        String password = request.getParameter(OAuth2ParameterNames.PASSWORD);

        if (StringUtils.hasText(username) && StringUtils.hasText(password)) {
            contextAttributes.put(OAuth2AuthorizationContext.USERNAME_ATTRIBUTE_NAME, username);
            contextAttributes.put(OAuth2AuthorizationContext.PASSWORD_ATTRIBUTE_NAME, password);
        }
        return contextAttributes;
    };
}
```

### Client Credentials

![client_credential_flow](/assets/images/jsf/Spring_Security/oauth2/client_credential_flow.png)

client credentials 방식도 마찬가지로, ClientCredentialsOAuth2AuthroizedClientProvider가 동작한다.

```java
@Override
@Nullable
public OAuth2AuthorizedClient authorize(OAuth2AuthorizationContext context) {
    Assert.notNull(context, "context cannot be null");
    ClientRegistration clientRegistration = context.getClientRegistration();
    if (!AuthorizationGrantType.CLIENT_CREDENTIALS.equals(clientRegistration.getAuthorizationGrantType())) {
        return null;
    }
    OAuth2AuthorizedClient authorizedClient = context.getAuthorizedClient();
    if (authorizedClient != null && !hasTokenExpired(authorizedClient.getAccessToken())) {
        // If client is already authorized but access token is NOT expired than no
        // need for re-authorization
        return null;
    }
    // As per spec, in section 4.4.3 Access Token Response
    // https://tools.ietf.org/html/rfc6749#section-4.4.3
    // A refresh token SHOULD NOT be included.
    //
    // Therefore, renewing an expired access token (re-authorization)
    // is the same as acquiring a new access token (authorization).
    OAuth2ClientCredentialsGrantRequest clientCredentialsGrantRequest = new OAuth2ClientCredentialsGrantRequest(
            clientRegistration);
    OAuth2AccessTokenResponse tokenResponse = getTokenResponse(clientRegistration, clientCredentialsGrantRequest);
    return new OAuth2AuthorizedClient(clientRegistration, context.getPrincipal().getName(),
            tokenResponse.getAccessToken());
}
```

### Refresh Token 

![refresh_token_flow](/assets/images/jsf/Spring_Security/oauth2/refresh_token_flow.png)

모든 권한 부여흐름을 보면 아래와 같이 Access Token이 유효한지 검증하는 로직이 포함되어있다. 만일 Access Token이 만료되었고 Refresh Token이 유효한 경우에는 Refresh Token을 활용하여 Access Token을 재발급하는 과정이 동작하게 된다.

```java
if (authorizedClient != null && !hasTokenExpired(authorizedClient.getAccessToken())) {
    // If client is already authorized and access token is NOT expired than no
    // need for re-authorization
    return null;
}
if (authorizedClient != null && hasTokenExpired(authorizedClient.getAccessToken())
        && authorizedClient.getRefreshToken() != null) {
    // If client is already authorized and access token is expired and a refresh
    // token is available, than return and allow
    // RefreshTokenOAuth2AuthorizedClientProvider to handle the refresh
    return null;
}
```

```java
@Override
@Nullable
public OAuth2AuthorizedClient authorize(OAuth2AuthorizationContext context) {
    Assert.notNull(context, "context cannot be null");
    OAuth2AuthorizedClient authorizedClient = context.getAuthorizedClient();
    if (authorizedClient == null || authorizedClient.getRefreshToken() == null
            || !hasTokenExpired(authorizedClient.getAccessToken())) {
        return null;
    }
    Object requestScope = context.getAttribute(OAuth2AuthorizationContext.REQUEST_SCOPE_ATTRIBUTE_NAME);
    Set<String> scopes = Collections.emptySet();
    if (requestScope != null) {
        Assert.isInstanceOf(String[].class, requestScope, "The context attribute must be of type String[] '"
                + OAuth2AuthorizationContext.REQUEST_SCOPE_ATTRIBUTE_NAME + "'");
        scopes = new HashSet<>(Arrays.asList((String[]) requestScope));
    }
    OAuth2RefreshTokenGrantRequest refreshTokenGrantRequest = new OAuth2RefreshTokenGrantRequest(
            authorizedClient.getClientRegistration(), authorizedClient.getAccessToken(),
            authorizedClient.getRefreshToken(), scopes);
    OAuth2AccessTokenResponse tokenResponse = getTokenResponse(authorizedClient, refreshTokenGrantRequest);
    return new OAuth2AuthorizedClient(context.getAuthorizedClient().getClientRegistration(),
            context.getPrincipal().getName(), tokenResponse.getAccessToken(), tokenResponse.getRefreshToken());
}
```

## CustomOAuth2LoginAuthenticationFilter

기존에는 위와 같이 OAuth2ClientManager을 통해 OAuth2AuthorizedClient을 얻어내고, OAuth2AuthorizedClient을 이용해서 최종 사용자 인증을 거치고 OAuthUser을 생성하여 인증 객체를 저장한다.

```java
@GetMapping("/oauth2Login")
public String oauth2Login(Model model, HttpServletRequest request, HttpServletResponse response) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    OAuth2AuthorizeRequest oAuth2AuthorizeRequest = OAuth2AuthorizeRequest.withClientRegistrationId("keycloak")
            .principal(authentication)
            .attribute(HttpServletRequest.class.getName(), request)
            .attribute(HttpServletResponse.class.getName(), response)
            .build();

    OAuth2AuthorizedClient authorizedClient = oAuth2AuthorizedClientManager.authorize(oAuth2AuthorizeRequest);

    if (authorizedClient != null) {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> oAuth2UserService = new DefaultOAuth2UserService();
        ClientRegistration clientRegistration = authorizedClient.getClientRegistration();
        OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
        OAuth2UserRequest oAuth2UserRequest = new OAuth2UserRequest(clientRegistration,accessToken);
        OAuth2User oAuth2User = oAuth2UserService.loadUser(oAuth2UserRequest);

        //등록된 권한에 대해 추가 설정 작업
        SimpleAuthorityMapper simpleAuthorityMapper = new SimpleAuthorityMapper();
        simpleAuthorityMapper.setPrefix("SYSTEM_");
        Set<GrantedAuthority> grantedAuthorities = simpleAuthorityMapper.mapAuthorities(oAuth2User.getAuthorities());

        OAuth2AuthenticationToken oAuth2AuthenticationToken = new OAuth2AuthenticationToken(
                oAuth2User,grantedAuthorities,clientRegistration.getRegistrationId()
        );

        SecurityContextHolder.getContext().setAuthentication(oAuth2AuthenticationToken);

        model.addAttribute("oAuth2AuthenticationToken", oAuth2AuthenticationToken);
    }

    model.addAttribute("authorizedClient", authorizedClient.getAccessToken().getTokenValue());
    return "home";
}
```

하지만, 이 과정은 Servlet 내부로 들어와 Controller의 실행을 처리하게 되는데, 이를 Filter로 구성하여 Filter level에서 인증을 처리할 수 있도록 한다.

> CustomOAuth2LoginAuthenticationFilter

/oauth2Login으로 요청에 대해 Filter가 동작하도록 하여, 필요한 작업을 처리할 수 있도록 한다.

```java
public class CustomOAuth2LoginAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    public static final String DEFAULT_FILTER_PROCESSES_URI = "/oauth2Login/**";
    private OAuth2AuthorizedClientRepository authorizedClientRepository;
    private DefaultOAuth2AuthorizedClientManager oAuth2AuthorizedClientManager;
    private OAuth2AuthorizationSuccessHandler authorizationSuccessHandler;

    private OAuth2AuthorizationFailureHandler authorizationFailureHandler;

    private Duration clockSkew = Duration.ofSeconds(3600);

    private Clock clock = Clock.systemUTC();

    public CustomOAuth2LoginAuthenticationFilter(DefaultOAuth2AuthorizedClientManager oAuth2AuthorizedClientManager, OAuth2AuthorizedClientRepository oAuth2AuthorizedClientRepository) {
        super(DEFAULT_FILTER_PROCESSES_URI);
        this.oAuth2AuthorizedClientManager = oAuth2AuthorizedClientManager;
        this.authorizedClientRepository = oAuth2AuthorizedClientRepository;

        this.authorizationSuccessHandler = (authorizedClient, authentication, attributes) ->
                authorizedClientRepository
                        .saveAuthorizedClient(authorizedClient, authentication,
                                (HttpServletRequest) attributes.get(HttpServletRequest.class.getName()),
                                (HttpServletResponse) attributes.get(HttpServletResponse.class.getName()));
        this.oAuth2AuthorizedClientManager.setAuthorizationSuccessHandler(authorizationSuccessHandler);
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException, ServletException {

        Authentication principal = SecurityContextHolder.getContext().getAuthentication();

        if (principal == null) {
            principal = new AnonymousAuthenticationToken("anonymous","anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"));
        }

        OAuth2AuthorizeRequest authorizeRequest = OAuth2AuthorizeRequest
                .withClientRegistrationId("keycloak")
                .principal(principal)
                .attribute(HttpServletRequest.class.getName(), request)
                .attribute(HttpServletResponse.class.getName(), response)
                .build();

        OAuth2AuthorizedClient oAuth2AuthorizedClient = oAuth2AuthorizedClientManager.authorize(authorizeRequest);

        /*if (oAuth2AuthorizedClient != null && hasTokenExpired(oAuth2AuthorizedClient.getAccessToken())
                && oAuth2AuthorizedClient.getRefreshToken() != null) {
            ClientRegistration.withClientRegistration(oAuth2AuthorizedClient.getClientRegistration()).authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN);
            oAuth2AuthorizedClient = oAuth2AuthorizedClientManager.authorize(authorizeRequest);
        }*/

        if(oAuth2AuthorizedClient != null) {
            ClientRegistration clientRegistration = oAuth2AuthorizedClient.getClientRegistration();
            OAuth2AccessToken accessToken = oAuth2AuthorizedClient.getAccessToken();
            OAuth2RefreshToken refreshToken = oAuth2AuthorizedClient.getRefreshToken();

            OAuth2UserService oAuth2UserService = new DefaultOAuth2UserService();
            OAuth2User oauth2User = oAuth2UserService.loadUser(new OAuth2UserRequest(
                    oAuth2AuthorizedClient.getClientRegistration(), accessToken));

            SimpleAuthorityMapper simpleAuthorityMapper = new SimpleAuthorityMapper();
            Collection<? extends GrantedAuthority> authorities = simpleAuthorityMapper.mapAuthorities(oauth2User.getAuthorities());
            OAuth2AuthenticationToken oAuth2AuthenticationToken = new OAuth2AuthenticationToken(oauth2User, authorities, clientRegistration.getRegistrationId());

            authorizationSuccessHandler.onAuthorizationSuccess(oAuth2AuthorizedClient, oAuth2AuthenticationToken, createAttributes(request, response));

            return oAuth2AuthenticationToken;
        }

        return null;

    }

    private static Map<String, Object> createAttributes(HttpServletRequest servletRequest, HttpServletResponse servletResponse) {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put(HttpServletRequest.class.getName(), servletRequest);
        attributes.put(HttpServletResponse.class.getName(), servletResponse);
        return attributes;
    }

    private boolean hasTokenExpired(OAuth2Token token) {
        return this.clock.instant().isAfter(token.getExpiresAt().minus(this.clockSkew));
    }
}
```

> Security Config

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
    httpSecurity.authorizeHttpRequests()
            .requestMatchers("/","/oauth2Login","/v2/oauth2Login","/logout").permitAll()
            .anyRequest().authenticated();
    httpSecurity.oauth2Client();
    httpSecurity.addFilterBefore(customOAuth2LoginAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    httpSecurity.sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.ALWAYS);
    return httpSecurity.build();
}

private CustomOAuth2LoginAuthenticationFilter customOAuth2LoginAuthenticationFilter() {
    CustomOAuth2LoginAuthenticationFilter customOAuth2LoginAuthenticationFilter = new CustomOAuth2LoginAuthenticationFilter(defaultOAuth2AuthorizedClientManager,oAuth2AuthorizedClientRepository);
    customOAuth2LoginAuthenticationFilter.setAuthenticationSuccessHandler((request, response, authentication) -> {
        response.sendRedirect("/home");
    });
    return customOAuth2LoginAuthenticationFilter;
}
```

## @RegisteredOAuth2AuthorizedClient

해당 Annotation을 활용하면, ClientManager을 통해 AuthorizedClient을 반환 받는 과정을 생략할 수 있다. 이는 ArgumentResolver의 일종인 OAuth2AuthorizedClientArgumentResolver을 통해 이루어지게 된다.

![registeredoauth2authorizedclient](/assets/images/jsf/Spring_Security/oauth2/registeredoauth2authorizedclient.png)

```java
@GetMapping("/oauth2Login")
public String oauth2Login(Model model, HttpServletRequest request, HttpServletResponse response) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    OAuth2AuthorizeRequest oAuth2AuthorizeRequest = OAuth2AuthorizeRequest.withClientRegistrationId("keycloak")
            .principal(authentication)
            .attribute(HttpServletRequest.class.getName(), request)
            .attribute(HttpServletResponse.class.getName(), response)
            .build();

    OAuth2AuthorizedClient authorizedClient = oAuth2AuthorizedClientManager.authorize(oAuth2AuthorizeRequest);

```

위의 과정을 아래와 같이 단순화시킬 수 있다.

```java
@GetMapping("/v2/oauth2Login")
public String oauth2LoginV2(@RegisteredOAuth2AuthorizedClient("keycloak") OAuth2AuthorizedClient authorizedClient, Model model) {

```


## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



