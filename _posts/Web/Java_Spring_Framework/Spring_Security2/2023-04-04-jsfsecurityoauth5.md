---
title: "Spring Security Oauth2 Part 5"
excerpt: "Oauth2 Login"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# Oauth2 Login

## Oauth2LoginConfigurer

Oauth2 인증 방식도 FormLogin, Basic Login 방식과 같이 Filter 기반으로 동작하게 되는데, 이때 각종 설정을 처리하는 Configurer 클래스가 존재한다.

> init 

init 메소드를 살펴보면 크게 4가지 객체를 초기화하는 과정이 존재한다.

1. OAuth2LoginAuthenticationFilter: access token, Oauth2 Client 생성 등 Oauth2 기반의 인증을 위한 처리를 수행한다. 

```java
public void init(B http) throws Exception {
    OAuth2LoginAuthenticationFilter authenticationFilter = new OAuth2LoginAuthenticationFilter(
            OAuth2ClientConfigurerUtils.getClientRegistrationRepository(this.getBuilder()),
            OAuth2ClientConfigurerUtils.getAuthorizedClientRepository(this.getBuilder()), this.loginProcessingUrl);
    authenticationFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());
    this.setAuthenticationFilter(authenticationFilter);
    super.loginProcessingUrl(this.loginProcessingUrl);
    if (this.loginPage != null) {
        // Set custom login page
        super.loginPage(this.loginPage);
        super.init(http);
    }
    else {
        Map<String, String> loginUrlToClientName = this.getLoginLinks();
        if (loginUrlToClientName.size() == 1) {
            // Setup auto-redirect to provider login page
            // when only 1 client is configured
            this.updateAuthenticationDefaults();
            this.updateAccessDefaults(http);
            String providerLoginPage = loginUrlToClientName.keySet().iterator().next();
            this.registerAuthenticationEntryPoint(http, this.getLoginEntryPoint(http, providerLoginPage));
        }
        else {
            super.init(http);
        }
    }
```

2. Oauth2LoginAuthenticationProvider: Access Token을 요청하여 사용자 인증을 처리하는 provider

```java
OAuth2LoginAuthenticationProvider oauth2LoginAuthenticationProvider = new OAuth2LoginAuthenticationProvider(
            accessTokenResponseClient, oauth2UserService);
    GrantedAuthoritiesMapper userAuthoritiesMapper = this.getGrantedAuthoritiesMapper();
    if (userAuthoritiesMapper != null) {
        oauth2LoginAuthenticationProvider.setAuthoritiesMapper(userAuthoritiesMapper);
    }
    http.authenticationProvider(this.postProcess(oauth2LoginAuthenticationProvider));
```

3. OidcAuthorizationCodeAuthenticationProvider: OIDC 기반으로 ID-Token을 통해 사용자 인증을 처리한다.

```java
if (oidcAuthenticationProviderEnabled) {
        OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService = getOidcUserService();
        OidcAuthorizationCodeAuthenticationProvider oidcAuthorizationCodeAuthenticationProvider = new OidcAuthorizationCodeAuthenticationProvider(
                accessTokenResponseClient, oidcUserService);
        JwtDecoderFactory<ClientRegistration> jwtDecoderFactory = this.getJwtDecoderFactoryBean();
        if (jwtDecoderFactory != null) {
            oidcAuthorizationCodeAuthenticationProvider.setJwtDecoderFactory(jwtDecoderFactory);
        }
        if (userAuthoritiesMapper != null) {
            oidcAuthorizationCodeAuthenticationProvider.setAuthoritiesMapper(userAuthoritiesMapper);
        }
        http.authenticationProvider(this.postProcess(oidcAuthorizationCodeAuthenticationProvider));
    }
    else {
        http.authenticationProvider(new OidcAuthenticationRequestChecker());
    }
```

4. DefaultLoginPageGeneratingFilter: 로그인 페이지를 생성하는 필터

```java
this.initDefaultLoginFilter(http);

private void initDefaultLoginFilter(B http) {
    DefaultLoginPageGeneratingFilter loginPageGeneratingFilter = http
            .getSharedObject(DefaultLoginPageGeneratingFilter.class);
    if (loginPageGeneratingFilter == null || this.isCustomLoginPage()) {
        return;
    }
    loginPageGeneratingFilter.setOauth2LoginEnabled(true);
    loginPageGeneratingFilter.setOauth2AuthenticationUrlToClientName(this.getLoginLinks());
    loginPageGeneratingFilter.setLoginPageUrl(this.getLoginPage());
    loginPageGeneratingFilter.setFailureUrl(this.getFailureUrl());
}
```

> configure

configure 메소드에서는 Oauth2AuthorizationRequestRedirectFilter을 생성하는 작업을 진행한다. 해당 filter은 AuthorizationCode를 요청하는 필터로, Oauth2LoginAuthenticationFilter 전에 동작한다.

```java
OAuth2AuthorizationRequestRedirectFilter authorizationRequestFilter;
if (this.authorizationEndpointConfig.authorizationRequestResolver != null) {
    authorizationRequestFilter = new OAuth2AuthorizationRequestRedirectFilter(
            this.authorizationEndpointConfig.authorizationRequestResolver);
}
else {
    String authorizationRequestBaseUri = this.authorizationEndpointConfig.authorizationRequestBaseUri;
    if (authorizationRequestBaseUri == null) {
        authorizationRequestBaseUri = OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI;
    }
    authorizationRequestFilter = new OAuth2AuthorizationRequestRedirectFilter(
            OAuth2ClientConfigurerUtils.getClientRegistrationRepository(this.getBuilder()),
            authorizationRequestBaseUri);
}
```

그리고 아래의 4가지 Config 객체들이 등록되게 된다.

|Config|Description|
|--|--|
|AuthorizationEndpointConfig|요청 코드 요청 관련 설정|
|TokenEndpointConfig|access token 요청 관련 설정|
|RedirectionEndpointConfig|클라이언트에 대한 리다이렉트 설정|
|UserInfoEndpointConfig|유저 정보 요청 관련 설정|

```java
private final AuthorizationEndpointConfig authorizationEndpointConfig = new AuthorizationEndpointConfig();

private final TokenEndpointConfig tokenEndpointConfig = new TokenEndpointConfig();

private final RedirectionEndpointConfig redirectionEndpointConfig = new RedirectionEndpointConfig();

private final UserInfoEndpointConfig userInfoEndpointConfig = new UserInfoEndpointConfig();
```

## Authorization Code 요청

Authorization Code를 요청하는 과정은 Oauth2AuthorizationRequestRedirectFilter에서 동작한다.

### 주요 클래스

> DefaultOauth2AuthorizationRequestResolver

Authorization Server로 Authorization Code를 요청할 때 활용되는 Oauth2AuthorzationRequest 객체를 생성하는 작업을 진행한다.

```java
@Override
public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
    String registrationId = resolveRegistrationId(request);
    if (registrationId == null) {
        return null;
    }
    String redirectUriAction = getAction(request, "login");
    return resolve(request, registrationId, redirectUriAction);
}

private OAuth2AuthorizationRequest resolve(HttpServletRequest request, String registrationId,
        String redirectUriAction) {
    if (registrationId == null) {
        return null;
    }
    ClientRegistration clientRegistration = this.clientRegistrationRepository.findByRegistrationId(registrationId);
    if (clientRegistration == null) {
        throw new InvalidClientRegistrationIdException("Invalid Client Registration with Id: " + registrationId);
    }
    OAuth2AuthorizationRequest.Builder builder = getBuilder(clientRegistration);

    String redirectUriStr = expandRedirectUri(request, clientRegistration, redirectUriAction);

    // @formatter:off
    builder.clientId(clientRegistration.getClientId())
            .authorizationUri(clientRegistration.getProviderDetails().getAuthorizationUri())
            .redirectUri(redirectUriStr)
            .scopes(clientRegistration.getScopes())
            .state(DEFAULT_STATE_GENERATOR.generateKey());
    // @formatter:on

    this.authorizationRequestCustomizer.accept(builder);

    return builder.build();
}
```

> Oauth2AuthorizationRequest

Authorization Code를 요청하는 과정에서 필요한 매개변수를 저장하고 있으며, 이후, 응답을 검증 할때 활용된다

```java
public final class OAuth2AuthorizationRequest implements Serializable {

	private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

	private String authorizationUri;

	private AuthorizationGrantType authorizationGrantType;

	private OAuth2AuthorizationResponseType responseType;

	private String clientId;

	private String redirectUri;

	private Set<String> scopes;

	private String state;

	private Map<String, Object> additionalParameters;

	private String authorizationRequestUri;

	private Map<String, Object> attributes;
...
}
```

> Oauth2AuthorizationRequestRepository

위의 Oauth2AuthorizationRequest 객체를 저장하고 있는 객체로, 세션 혹은 쿠키에 저장하는 작업을 진행한다.

```java
public interface AuthorizationRequestRepository<T extends OAuth2AuthorizationRequest> {

	T loadAuthorizationRequest(HttpServletRequest request);

	void saveAuthorizationRequest(T authorizationRequest, HttpServletRequest request, HttpServletResponse response);

	T removeAuthorizationRequest(HttpServletRequest request, HttpServletResponse response);
}
```

### 동작 과정

![authorization_code_flow](/assets/images/jsf/Spring_Security/oauth2/authorization_code_flow.png)


1. oauth2/authorization/{registrationId} 요청에 대하며 Oauth2AuthorizationRequestRedirectFilter에서 처리하게 되며, 우선적으로 Oauth2AuthorizationRequestResolver을 통해 Oauth2AuthorizationRequest 객체를 생성한다.

이때, DefaultOauth2AuthorizationRequestResolver 객체가 동작하게 된다.

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
    try {
        OAuth2AuthorizationRequest authorizationRequest = this.authorizationRequestResolver.resolve(request);
        if (authorizationRequest != null) {
            this.sendRedirectForAuthorization(request, response, authorizationRequest);
            return;
        }
    }
```

2. DefaultOauth2AuthorizationRequestResolver을 통해 Oauth2AuthorizationRequest을 만들어낸다.

![oauth2authorizationrequest](/assets/images/jsf/Spring_Security/oauth2/oauth2authorizationrequest.png)

3. Oauth2AuthorizationRequest 객체를 RequestRepository에 저장한다. HttpSessionOAuth2AuthorizationRequestRepository 객체가 실행되면서, Session에 저장하게 된다.

```java
private void sendRedirectForAuthorization(HttpServletRequest request, HttpServletResponse response,
        OAuth2AuthorizationRequest authorizationRequest) throws IOException {
    if (AuthorizationGrantType.AUTHORIZATION_CODE.equals(authorizationRequest.getGrantType())) {
        this.authorizationRequestRepository.saveAuthorizationRequest(authorizationRequest, request, response);
    }
    ...
}
@Override
public void saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, HttpServletRequest request,
        HttpServletResponse response) {
    Assert.notNull(request, "request cannot be null");
    Assert.notNull(response, "response cannot be null");
    if (authorizationRequest == null) {
        removeAuthorizationRequest(request, response);
        return;
    }
    String state = authorizationRequest.getState();
    Assert.hasText(state, "authorizationRequest.state cannot be empty");
    request.getSession().setAttribute(this.sessionAttributeName, authorizationRequest);
}
```

4. sendRedirect 요청으로 Authorization Code를 요청한다.

```java
this.authorizationRedirectStrategy.sendRedirect(request, response,
        authorizationRequest.getAuthorizationRequestUri());
}

@Override
public void sendRedirect(HttpServletRequest request, HttpServletResponse response, String url) throws IOException {
    String redirectUrl = calculateRedirectUrl(request.getContextPath(), url);
    redirectUrl = response.encodeRedirectURL(redirectUrl);
    if (this.logger.isDebugEnabled()) {
        this.logger.debug(LogMessage.format("Redirecting to %s", redirectUrl));
    }
    response.sendRedirect(redirectUrl);
}
```
아래의 url로 redirect 시키는 것을 확인할 수 있다.
```
http://localhost:8080/realms/oauth2/protocol/openid-connect/auth?response_type=code&client_id=oauth2-client-app&state=Lx_TmzkMYqWsDUHZqsYCR8m3RDcvju238MXHBoXio-4%3D&redirect_uri=http://localhost:8081/login/oauth2/code/keycloak
```

5. 인증이 되지 않은 사용자가 만약 다른 경로로 요청을 수행하는 경우 위의 redirect filter을 그냥 통과하게 되면서 이후 authorization filter에 의해 접근이 제한 되게 되면 AuthenticationEntryPoint에 의해 Login Page로 redirect 되게 된다.

![oauth2_entrypoint](/assets/images/jsf/Spring_Security/oauth2/oauth2_entrypoint.png)

## Access Token 요청

Access Token은 Oauth2LoginAuthenticationFilter에서 동작한다. 
해당 필터에서는 access token 요청, Oauth2AuthorizedClient 생성, Security Context에 Authentication 객체를 저장하는 작업으 수행한다.

### 주요 클래스

1. Oauth2AuthenticationProvider

scope에 openid가 포함되어 있으면 OidcAuthorizationCodeAuthenticationProvider을 그렇지 않으면
Oauth2AuthorizationCodeAuthenticationProvider을 호출하여 Token 생성을 위임한다.

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2LoginAuthenticationToken loginAuthenticationToken = (OAuth2LoginAuthenticationToken) authentication;
    // Section 3.1.2.1 Authentication Request -
    // https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest scope
    // REQUIRED. OpenID Connect requests MUST contain the "openid" scope value.
    if (loginAuthenticationToken.getAuthorizationExchange().getAuthorizationRequest().getScopes()
            .contains("openid")) {
        // This is an OpenID Connect Authentication Request so return null
        // and let OidcAuthorizationCodeAuthenticationProvider handle it instead
        return null;
    }
    OAuth2AuthorizationCodeAuthenticationToken authorizationCodeAuthenticationToken;
            try {
                authorizationCodeAuthenticationToken = (OAuth2AuthorizationCodeAuthenticationToken) this.authorizationCodeAuthenticationProvider
                        .authenticate(new OAuth2AuthorizationCodeAuthenticationToken(
                                loginAuthenticationToken.getClientRegistration(),
                                loginAuthenticationToken.getAuthorizationExchange()));
            }
```

2. DefaultAuthorizationCodeTokenResponseClient

실제로 Authorization Server으로 부터 Access Token을 얻기 위해 POST 요청을 수행한다.

```java
@Override
public OAuth2AccessTokenResponse getTokenResponse(
        OAuth2AuthorizationCodeGrantRequest authorizationCodeGrantRequest) {
    Assert.notNull(authorizationCodeGrantRequest, "authorizationCodeGrantRequest cannot be null");
    RequestEntity<?> request = this.requestEntityConverter.convert(authorizationCodeGrantRequest);
    ResponseEntity<OAuth2AccessTokenResponse> response = getResponse(request);
    // As per spec, in Section 5.1 Successful Access Token Response
    // https://tools.ietf.org/html/rfc6749#section-5.1
    // If AccessTokenResponse.scope is empty, then we assume all requested scopes were
    // granted.
    // However, we use the explicit scopes returned in the response (if any).
    return response.getBody();
}

private ResponseEntity<OAuth2AccessTokenResponse> getResponse(RequestEntity<?> request) {
    try {
        return this.restOperations.exchange(request, OAuth2AccessTokenResponse.class);
    }
    catch (RestClientException ex) {
        OAuth2Error oauth2Error = new OAuth2Error(INVALID_TOKEN_RESPONSE_ERROR_CODE,
                "An error occurred while attempting to retrieve the OAuth 2.0 Access Token Response: "
                        + ex.getMessage(),
                null);
        throw new OAuth2AuthorizationException(oauth2Error, ex);
    }
}
```

### 동작 과정

![access_token_flow](/assets/images/jsf/Spring_Security/oauth2/access_token_flow.png)

Authorization Code을 요청하고 난 이후에는 설정한 redirect-uri으로 리다이렉트 되는데, Oauth2LoginAuthenticationFilter 이에 대한 요청을 처리한다. 

1. Oauth2AuthorizationRequest와 Oauth2AuthorizationResponse 객체를 만들어낸다. Oauth2AuthorizationRequest은 세션에 저장되어 있고, Oauth2AuthorizationResponse는 Authorization Server로 부터 응답이다.

```java
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
```

2. 해당 객체들을 Oauth2AuthorizationExchange 객체에 넣어서 Oauth2LoginAuthenticationToken을 만든다.

인증이 완료되고 나면 Oauth2LoginAuthenticationToken에 User principal 과 각종 Token이 저장된다.

```java
OAuth2LoginAuthenticationToken authenticationRequest = new OAuth2LoginAuthenticationToken(clientRegistration,
				new OAuth2AuthorizationExchange(authorizationRequest, authorizationResponse));
		authenticationRequest.setDetails(authenticationDetails);

public class OAuth2LoginAuthenticationToken extends AbstractAuthenticationToken {

	private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

	private OAuth2User principal;

	private ClientRegistration clientRegistration;

	private OAuth2AuthorizationExchange authorizationExchange;

	private OAuth2AccessToken accessToken;

	private OAuth2RefreshToken refreshToken;
    ...
}
```
3. Oauth2LoginAuthenticationToken을 ProviderManager에 전달하고, Oauth2LoginAuthenticationProvider -> Oauth2AuthorizationCodeAuthenticationProvider을 호출한다.

해당 provider 내부에 보면 Oauth2AuthorizationRequest와 Oauth2AuthorizationResponse의 state 값을 비교해서 틀리면, 인증을 요청을 처리하지 않는 로직도 확인할 수 있다.

```java
OAuth2LoginAuthenticationToken authenticationResult = (OAuth2LoginAuthenticationToken) this
				.getAuthenticationManager().authenticate(authenticationRequest);

//Oauth2AuthorizationCodeAuthenticationProvider
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2AuthorizationCodeAuthenticationToken authorizationCodeAuthentication = (OAuth2AuthorizationCodeAuthenticationToken) authentication;
    OAuth2AuthorizationResponse authorizationResponse = authorizationCodeAuthentication.getAuthorizationExchange()
            .getAuthorizationResponse();
    if (authorizationResponse.statusError()) {
        throw new OAuth2AuthorizationException(authorizationResponse.getError());
    }
    OAuth2AuthorizationRequest authorizationRequest = authorizationCodeAuthentication.getAuthorizationExchange()
            .getAuthorizationRequest();
    if (!authorizationResponse.getState().equals(authorizationRequest.getState())) {
        OAuth2Error oauth2Error = new OAuth2Error(INVALID_STATE_PARAMETER_ERROR_CODE);
        throw new OAuth2AuthorizationException(oauth2Error);
    }
    OAuth2AccessTokenResponse accessTokenResponse = this.accessTokenResponseClient.getTokenResponse(
            new OAuth2AuthorizationCodeGrantRequest(authorizationCodeAuthentication.getClientRegistration(),
                    authorizationCodeAuthentication.getAuthorizationExchange()));
    OAuth2AuthorizationCodeAuthenticationToken authenticationResult = new OAuth2AuthorizationCodeAuthenticationToken(
            authorizationCodeAuthentication.getClientRegistration(),
            authorizationCodeAuthentication.getAuthorizationExchange(), accessTokenResponse.getAccessToken(),
            accessTokenResponse.getRefreshToken(), accessTokenResponse.getAdditionalParameters());
    authenticationResult.setDetails(authorizationCodeAuthentication.getDetails());
    return authenticationResult;
}
```

4. DefaultAuthorizationCodeTokenResponseClient 요청으로 실제 Access Token을 요청하는 작업을 진행한다.

```java
OAuth2AccessTokenResponse accessTokenResponse = this.accessTokenResponseClient.getTokenResponse(
				new OAuth2AuthorizationCodeGrantRequest(authorizationCodeAuthentication.getClientRegistration(),
						authorizationCodeAuthentication.getAuthorizationExchange()));


@Override
public OAuth2AccessTokenResponse getTokenResponse(
        OAuth2AuthorizationCodeGrantRequest authorizationCodeGrantRequest) {
    Assert.notNull(authorizationCodeGrantRequest, "authorizationCodeGrantRequest cannot be null");
    RequestEntity<?> request = this.requestEntityConverter.convert(authorizationCodeGrantRequest);
    ResponseEntity<OAuth2AccessTokenResponse> response = getResponse(request);
    // As per spec, in Section 5.1 Successful Access Token Response
    // https://tools.ietf.org/html/rfc6749#section-5.1
    // If AccessTokenResponse.scope is empty, then we assume all requested scopes were
    // granted.
    // However, we use the explicit scopes returned in the response (if any).
    return response.getBody();
}

private ResponseEntity<OAuth2AccessTokenResponse> getResponse(RequestEntity<?> request) {
    try {
        return this.restOperations.exchange(request, OAuth2AccessTokenResponse.class);
    }
    catch (RestClientException ex) {
        OAuth2Error oauth2Error = new OAuth2Error(INVALID_TOKEN_RESPONSE_ERROR_CODE,
                "An error occurred while attempting to retrieve the OAuth 2.0 Access Token Response: "
                        + ex.getMessage(),
                null);
        throw new OAuth2AuthorizationException(oauth2Error, ex);
    }
}
```
위의 로직을 통해 아래의 AccessTokenResponse 객체가 초기화되는 것을 확인할 수 있다.

![oauth2_accesstoken_response](/assets/images/jsf/Spring_Security/oauth2/oauth2_accesstoken_response.png) 

5. 인증이 완료된 이후, OauthAuthorizedClient을 만들어내는 작업을 진행한다. Oauth2AuthorizedClient에는 user principal, 각종 token이 저장되어 Spring Framework 내부에서 언제든지 활용할 수 있다.

```java
OAuth2AuthenticationToken oauth2Authentication = this.authenticationResultConverter
				.convert(authenticationResult);
Assert.notNull(oauth2Authentication, "authentication result cannot be null");
oauth2Authentication.setDetails(authenticationDetails);
OAuth2AuthorizedClient authorizedClient = new OAuth2AuthorizedClient(
        authenticationResult.getClientRegistration(), oauth2Authentication.getName(),
        authenticationResult.getAccessToken(), authenticationResult.getRefreshToken());

this.authorizedClientRepository.saveAuthorizedClient(authorizedClient, oauth2Authentication, request, response);

public class OAuth2AuthorizedClient implements Serializable {

	private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

	private final ClientRegistration clientRegistration;

	private final String principalName;

	private final OAuth2AccessToken accessToken;

	private final OAuth2RefreshToken refreshToken;
    ...
}
```






## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



