---
title: "Spring Security Oauth2 Part 13"
excerpt: "Spring Authorization Server Endpoint"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# Spring Authorization Server Endpoint

OAuth2AuthorizationServerConfigurer을 통해 다양한 Endpoint을 처리하게 된다. 

```java
private Map<Class<? extends AbstractOAuth2Configurer>, AbstractOAuth2Configurer> createConfigurers() {
    Map<Class<? extends AbstractOAuth2Configurer>, AbstractOAuth2Configurer> configurers = new LinkedHashMap<>();
    configurers.put(OAuth2ClientAuthenticationConfigurer.class, new OAuth2ClientAuthenticationConfigurer(this::postProcess));
    configurers.put(OAuth2AuthorizationServerMetadataEndpointConfigurer.class, new OAuth2AuthorizationServerMetadataEndpointConfigurer(this::postProcess));
    configurers.put(OAuth2AuthorizationEndpointConfigurer.class, new OAuth2AuthorizationEndpointConfigurer(this::postProcess));
    configurers.put(OAuth2TokenEndpointConfigurer.class, new OAuth2TokenEndpointConfigurer(this::postProcess));
    configurers.put(OAuth2TokenIntrospectionEndpointConfigurer.class, new OAuth2TokenIntrospectionEndpointConfigurer(this::postProcess));
    configurers.put(OAuth2TokenRevocationEndpointConfigurer.class, new OAuth2TokenRevocationEndpointConfigurer(this::postProcess));
    return configurers;
}
```

## OAuth2AuthorizationEndpointConfigurer

해당 Endpoint에서는 권한 부여 유형에 따른 처리를 진행하게 된다. Authorzation Code 발급 과정과 Scope에 대한 사용자 동의(Consent)을 처리를 한다. 

/oauth2/authorize에 대한 요청을 처리하며, OAuth2AuthorzationEndpointFilter을 생성하여 해당 과정을 filter 기반으로 처리한다.

### OAuth2AuthorizationConsent

OAuth2 권한 부여 요청의 흐름 과정에서 scope에 대한 사용자가 동의한 항목을 저장하고 있는 것으로, 각 사용자가 동의한 항목에 대한 정보를 저장한다.

```java
public final class OAuth2AuthorizationConsent implements Serializable {
	private static final long serialVersionUID = SpringAuthorizationServerVersion.SERIAL_VERSION_UID;
	private static final String AUTHORITIES_SCOPE_PREFIX = "SCOPE_";

	private final String registeredClientId;
	private final String principalName;
	private final Set<GrantedAuthority> authorities;
```

각 사용자에 대한 Consent 저장을 위해 OAuth2AuthorizationConsentService가 동작하게 되며, In-Memory 방식과 JDBC 방식이 존재한다.

```java
//InMemoryOAuth2AuthorizationConsentService
public final class InMemoryOAuth2AuthorizationConsentService implements OAuth2AuthorizationConsentService {
	private final Map<Integer, OAuth2AuthorizationConsent> authorizationConsents = new ConcurrentHashMap<>();
    ...
}

//JdbcOAuth2AuthorizationConsentService
public class JdbcOAuth2AuthorizationConsentService implements OAuth2AuthorizationConsentService {

	// @formatter:off
	private static final String COLUMN_NAMES = "registered_client_id, "
			+ "principal_name, "
			+ "authorities";
	// @formatter:on

	private static final String TABLE_NAME = "oauth2_authorization_consent";

	private static final String PK_FILTER = "registered_client_id = ? AND principal_name = ?";

	// @formatter:off
	private static final String LOAD_AUTHORIZATION_CONSENT_SQL = "SELECT " + COLUMN_NAMES
			+ " FROM " + TABLE_NAME
			+ " WHERE " + PK_FILTER;
	// @formatter:on

	// @formatter:off
	private static final String SAVE_AUTHORIZATION_CONSENT_SQL = "INSERT INTO " + TABLE_NAME
			+ " (" + COLUMN_NAMES + ") VALUES (?, ?, ?)";
	// @formatter:on

	// @formatter:off
	private static final String UPDATE_AUTHORIZATION_CONSENT_SQL = "UPDATE " + TABLE_NAME
			+ " SET authorities = ?"
			+ " WHERE " + PK_FILTER;
	// @formatter:on

	private static final String REMOVE_AUTHORIZATION_CONSENT_SQL = "DELETE FROM " + TABLE_NAME + " WHERE " + PK_FILTER;

	private final JdbcOperations jdbcOperations;
	private RowMapper<OAuth2AuthorizationConsent> authorizationConsentRowMapper;
	private Function<OAuth2AuthorizationConsent, List<SqlParameterValue>> authorizationConsentParametersMapper;
    ...
}
```


### Flow

#### 인증 전 단계

![oauth2authorizationendpoint_before_authentication](/assets/images/jsf/Spring_Security/oauth2/oauth2authorizationendpoint_before_authentication.png)

1. 사용자는 /oauth2/authorize에 대한 요청을 통해 Authorization Code을 요청한다.

```
http://localhost:9000/oauth2/authorize?response_type=code&client_id=oauth2-client-app1&scope=openid read write&redirect_uri=http://127.0.0.1:8081
```

2. 해당 요청은 OAuth2AuthorizationEndpointFilter에서 처리된다. 처음으로, OAuth2AuthorizationCodeRequestAuthenticationConverter에 의해 OAuth2AuthorizationCodeRequestAuthenticationToken으로 변환된다.

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
    //request를 처리할 수 있는 지 여부 조사 --> 접근 경로 검사
    if (!this.authorizationEndpointMatcher.matches(request)) {
        filterChain.doFilter(request, response);
        return;
    }

    try {
        Authentication authentication = this.authenticationConverter.convert(request);
        if (authentication instanceof AbstractAuthenticationToken) {
            ((AbstractAuthenticationToken) authentication)
                    .setDetails(this.authenticationDetailsSource.buildDetails(request));
        }
```

token 변환 과정에서 아래와 같이 request에 대해서 response_type, client_id, state, redirect_uri,scope 항목에대한 검증을 수행한다.

```java
@Override
public Authentication convert(HttpServletRequest request) {
    if (!"GET".equals(request.getMethod()) && !OIDC_REQUEST_MATCHER.matches(request)) {
        return null;
    }

    MultiValueMap<String, String> parameters = OAuth2EndpointUtils.getParameters(request);

    // response_type (REQUIRED)
    String responseType = request.getParameter(OAuth2ParameterNames.RESPONSE_TYPE);
    if (!StringUtils.hasText(responseType) ||
            parameters.get(OAuth2ParameterNames.RESPONSE_TYPE).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.RESPONSE_TYPE);
    } else if (!responseType.equals(OAuth2AuthorizationResponseType.CODE.getValue())) {
        throwError(OAuth2ErrorCodes.UNSUPPORTED_RESPONSE_TYPE, OAuth2ParameterNames.RESPONSE_TYPE);
    }

    String authorizationUri = request.getRequestURL().toString();

    // client_id (REQUIRED)
    String clientId = parameters.getFirst(OAuth2ParameterNames.CLIENT_ID);
    if (!StringUtils.hasText(clientId) ||
            parameters.get(OAuth2ParameterNames.CLIENT_ID).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.CLIENT_ID);
    }

    Authentication principal = SecurityContextHolder.getContext().getAuthentication();
    if (principal == null) {
        principal = ANONYMOUS_AUTHENTICATION;
    }

    // redirect_uri (OPTIONAL)
    String redirectUri = parameters.getFirst(OAuth2ParameterNames.REDIRECT_URI);
    if (StringUtils.hasText(redirectUri) &&
            parameters.get(OAuth2ParameterNames.REDIRECT_URI).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.REDIRECT_URI);
    }

    // scope (OPTIONAL)
    Set<String> scopes = null;
    String scope = parameters.getFirst(OAuth2ParameterNames.SCOPE);
    if (StringUtils.hasText(scope) &&
            parameters.get(OAuth2ParameterNames.SCOPE).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.SCOPE);
    }
    if (StringUtils.hasText(scope)) {
        scopes = new HashSet<>(
                Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
    }

    // state (RECOMMENDED)
    String state = parameters.getFirst(OAuth2ParameterNames.STATE);
    if (StringUtils.hasText(state) &&
            parameters.get(OAuth2ParameterNames.STATE).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.STATE);
    }

    // code_challenge (REQUIRED for public clients) - RFC 7636 (PKCE)
    String codeChallenge = parameters.getFirst(PkceParameterNames.CODE_CHALLENGE);
    if (StringUtils.hasText(codeChallenge) &&
            parameters.get(PkceParameterNames.CODE_CHALLENGE).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, PkceParameterNames.CODE_CHALLENGE, PKCE_ERROR_URI);
    }

    // code_challenge_method (OPTIONAL for public clients) - RFC 7636 (PKCE)
    String codeChallengeMethod = parameters.getFirst(PkceParameterNames.CODE_CHALLENGE_METHOD);
    if (StringUtils.hasText(codeChallengeMethod) &&
            parameters.get(PkceParameterNames.CODE_CHALLENGE_METHOD).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, PkceParameterNames.CODE_CHALLENGE_METHOD, PKCE_ERROR_URI);
    }

    Map<String, Object> additionalParameters = new HashMap<>();
    parameters.forEach((key, value) -> {
        if (!key.equals(OAuth2ParameterNames.RESPONSE_TYPE) &&
                !key.equals(OAuth2ParameterNames.CLIENT_ID) &&
                !key.equals(OAuth2ParameterNames.REDIRECT_URI) &&
                !key.equals(OAuth2ParameterNames.SCOPE) &&
                !key.equals(OAuth2ParameterNames.STATE)) {
            additionalParameters.put(key, value.get(0));
        }
    });

    return new OAuth2AuthorizationCodeRequestAuthenticationToken(authorizationUri, clientId, principal,
            redirectUri, state, scopes, additionalParameters);
}
```


3. OAuth2AuthorizationCodeRequestAuthenticationProvider에 의해 AuthorizationCode 발급 과정이 처리된다. 해당 과정에서 request에 대한 parameter 검증이 수반되는데, 위의 검증과는 달리 client에 설정되어 있는 parameter와 비교하여 적합성을 판단한다. 아직 해당 token은 인증 과정을 거치지 않았기 때문에, consent 처리 과정을 넘어가지 않고, UsernamePasswordAuthenticationFilter 과정을 통해 인증 과정이 수반된다.

```java
//OAuth2AuthorizationEndpointFilter
Authentication authenticationResult = this.authenticationManager.authenticate(authentication);
if (!authenticationResult.isAuthenticated()) {
    // If the Principal (Resource Owner) is not authenticated then
    // pass through the chain with the expectation that the authentication process
    // will commence via AuthenticationEntryPoint
    filterChain.doFilter(request, response);
    return;
}

//OAuth2AuthorizationCodeRequestAuthenticationProvider
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2AuthorizationCodeRequestAuthenticationToken authorizationCodeRequestAuthentication =
            (OAuth2AuthorizationCodeRequestAuthenticationToken) authentication;

    RegisteredClient registeredClient = this.registeredClientRepository.findByClientId(
            authorizationCodeRequestAuthentication.getClientId());
    if (registeredClient == null) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.CLIENT_ID,
                authorizationCodeRequestAuthentication, null);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved registered client");
    }

    OAuth2AuthorizationCodeRequestAuthenticationContext authenticationContext =
            OAuth2AuthorizationCodeRequestAuthenticationContext.with(authorizationCodeRequestAuthentication)
                    .registeredClient(registeredClient)
                    .build();
    this.authenticationValidator.accept(authenticationContext);

    if (!registeredClient.getAuthorizationGrantTypes().contains(AuthorizationGrantType.AUTHORIZATION_CODE)) {
        throwError(OAuth2ErrorCodes.UNAUTHORIZED_CLIENT, OAuth2ParameterNames.CLIENT_ID,
                authorizationCodeRequestAuthentication, registeredClient);
    }

    // code_challenge (REQUIRED for public clients) - RFC 7636 (PKCE)
    String codeChallenge = (String) authorizationCodeRequestAuthentication.getAdditionalParameters().get(PkceParameterNames.CODE_CHALLENGE);
    if (StringUtils.hasText(codeChallenge)) {
        String codeChallengeMethod = (String) authorizationCodeRequestAuthentication.getAdditionalParameters().get(PkceParameterNames.CODE_CHALLENGE_METHOD);
        if (!StringUtils.hasText(codeChallengeMethod) || !"S256".equals(codeChallengeMethod)) {
            throwError(OAuth2ErrorCodes.INVALID_REQUEST, PkceParameterNames.CODE_CHALLENGE_METHOD, PKCE_ERROR_URI,
                    authorizationCodeRequestAuthentication, registeredClient, null);
        }
    } else if (registeredClient.getClientSettings().isRequireProofKey()) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, PkceParameterNames.CODE_CHALLENGE, PKCE_ERROR_URI,
                authorizationCodeRequestAuthentication, registeredClient, null);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Validated authorization code request parameters");
    }

    // ---------------
    // The request is valid - ensure the resource owner is authenticated
    // ---------------

    Authentication principal = (Authentication) authorizationCodeRequestAuthentication.getPrincipal();
    if (!isPrincipalAuthenticated(principal)) {
        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Did not authenticate authorization code request since principal not authenticated");
        }
        // Return the authorization request as-is where isAuthenticated() is false
        return authorizationCodeRequestAuthentication;
    }
```

#### 동의 페이지 출력 과정

![oauth2authorizationendpoint_before_consent](/assets/images/jsf/Spring_Security/oauth2/oauth2authorizationendpoint_before_consent.png)

UsernamePasswordAuthenticationFilter에 의해 인증이 처리되면 SavedRequest에 저장된 url 정보를 토대로 다시 OAuth2AuthorzationEndpointFilter로 전달된다.

1. 2번째로 전달된 Token의 경우 Form-Login을 통한 인증 처리가 완료되었기 때문에, if문에 걸리지 않고 다음 과정이 처리된다. Consent을 얻기 위해 Consent page을 구성하여 사용자에게 전달한다.

```java
if (!authenticationResult.isAuthenticated()) {
    // If the Principal (Resource Owner) is not authenticated then
    // pass through the chain with the expectation that the authentication process
    // will commence via AuthenticationEntryPoint
    filterChain.doFilter(request, response);
    return;
}
if (authenticationResult instanceof OAuth2AuthorizationConsentAuthenticationToken) {
    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Authorization consent is required");
    }
    sendAuthorizationConsent(request, response,
            (OAuth2AuthorizationCodeRequestAuthenticationToken) authentication,
            (OAuth2AuthorizationConsentAuthenticationToken) authenticationResult);
    return;
}

private void sendAuthorizationConsent(HttpServletRequest request, HttpServletResponse response, OAuth2AuthorizationCodeRequestAuthenticationToken authorizationCodeRequestAuthentication,OAuth2AuthorizationConsentAuthenticationToken authorizationConsentAuthentication) throws IOException {

    String clientId = authorizationConsentAuthentication.getClientId();
    Authentication principal = (Authentication) authorizationConsentAuthentication.getPrincipal();
    Set<String> requestedScopes = authorizationCodeRequestAuthentication.getScopes();
    Set<String> authorizedScopes = authorizationConsentAuthentication.getScopes();
    String state = authorizationConsentAuthentication.getState();

    if (hasConsentUri()) {
        String redirectUri = UriComponentsBuilder.fromUriString(resolveConsentUri(request))
                .queryParam(OAuth2ParameterNames.SCOPE, String.join(" ", requestedScopes))
                .queryParam(OAuth2ParameterNames.CLIENT_ID, clientId)
                .queryParam(OAuth2ParameterNames.STATE, state)
                .toUriString();
        this.redirectStrategy.sendRedirect(request, response, redirectUri);
    } else {
        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Displaying generated consent screen");
        }
        DefaultConsentPage.displayConsent(request, response, clientId, principal, requestedScopes, authorizedScopes, state);
    }
}
```

#### 동의 페이지 출력 과정

![oauth2authorizationendpoint_after_consent](/assets/images/jsf/Spring_Security/oauth2/oauth2authorizationendpoint_after_consent.png)

사용자로 부터 Consent을 받고 나면 다시 OAuth2AuthorizationEndpointFilter로 전달되며, OAuth2AuthorizationConsentAuthenticationProvider에 의해 검증이 처리된다.

1. 처음 request을 통해 요청한 scope와 사용자가 선택한 scope 범위를 비교한다. 처음 request에 대한 정보는 OAuth2Authorization에 저장된 OAuth2AuthorizationRequest에 저장되어 있고, 실제로 사용자가 동의한 항목은 OAuth2AuthorizationConsentAuthenticationToken에 저장되어 있다. 만일, 처음 요청 시 설정한 scope 중에서 사용자가 동의하지 않은 항목이 있으면 에러가 발생한다.

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2AuthorizationConsentAuthenticationToken authorizationConsentAuthentication =
            (OAuth2AuthorizationConsentAuthenticationToken) authentication;

    OAuth2Authorization authorization = this.authorizationService.findByToken(
            authorizationConsentAuthentication.getState(), STATE_TOKEN_TYPE);
    ...
    OAuth2AuthorizationRequest authorizationRequest = authorization.getAttribute(OAuth2AuthorizationRequest.class.getName());
    Set<String> requestedScopes = authorizationRequest.getScopes();
    Set<String> authorizedScopes = new HashSet<>(authorizationConsentAuthentication.getScopes());
    if (!requestedScopes.containsAll(authorizedScopes)) {
        throwError(OAuth2ErrorCodes.INVALID_SCOPE, OAuth2ParameterNames.SCOPE,
                authorizationConsentAuthentication, registeredClient, authorizationRequest);
    }
}
```

2. 전달된 scope에 대해서 Authority을 추가한다. 이때, Authority가 비어있어도 에러가 발생하게 된다.

```java
OAuth2AuthorizationConsent currentAuthorizationConsent = this.authorizationConsentService.findById(
            authorization.getRegisteredClientId(), authorization.getPrincipalName());
    Set<String> currentAuthorizedScopes = currentAuthorizationConsent != null ?
            currentAuthorizationConsent.getScopes() : Collections.emptySet();

    if (!currentAuthorizedScopes.isEmpty()) {
        for (String requestedScope : requestedScopes) {
            if (currentAuthorizedScopes.contains(requestedScope)) {
                authorizedScopes.add(requestedScope);
            }
        }
    }

    if (!authorizedScopes.isEmpty() && requestedScopes.contains(OidcScopes.OPENID)) {
        // 'openid' scope is auto-approved as it does not require consent
        authorizedScopes.add(OidcScopes.OPENID);
    }

    OAuth2AuthorizationConsent.Builder authorizationConsentBuilder;
    if (currentAuthorizationConsent != null) {
        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Retrieved existing authorization consent");
        }
        authorizationConsentBuilder = OAuth2AuthorizationConsent.from(currentAuthorizationConsent);
    } else {
        authorizationConsentBuilder = OAuth2AuthorizationConsent.withId(
                authorization.getRegisteredClientId(), authorization.getPrincipalName());
    }
    authorizedScopes.forEach(authorizationConsentBuilder::scope);
    if (this.authorizationConsentCustomizer != null) {
			// @formatter:off
			OAuth2AuthorizationConsentAuthenticationContext authorizationConsentAuthenticationContext =
					OAuth2AuthorizationConsentAuthenticationContext.with(authorizationConsentAuthentication)
							.authorizationConsent(authorizationConsentBuilder)
							.registeredClient(registeredClient)
							.authorization(authorization)
							.authorizationRequest(authorizationRequest)
							.build();
			// @formatter:on
			this.authorizationConsentCustomizer.accept(authorizationConsentAuthenticationContext);
			if (this.logger.isTraceEnabled()) {
				this.logger.trace("Customized authorization consent");
			}
		}

		Set<GrantedAuthority> authorities = new HashSet<>();
		authorizationConsentBuilder.authorities(authorities::addAll);

		if (authorities.isEmpty()) {
			// Authorization consent denied (or revoked)
			if (currentAuthorizationConsent != null) {
				this.authorizationConsentService.remove(currentAuthorizationConsent);
				if (this.logger.isTraceEnabled()) {
					this.logger.trace("Revoked authorization consent");
				}
			}
			this.authorizationService.remove(authorization);
			if (this.logger.isTraceEnabled()) {
				this.logger.trace("Removed authorization");
			}
			throwError(OAuth2ErrorCodes.ACCESS_DENIED, OAuth2ParameterNames.CLIENT_ID,
					authorizationConsentAuthentication, registeredClient, authorizationRequest);
		}
```

3. 이후, Authorization Code을 생성하고, OAuth2Authorization에 Code을 저장하고 OAuth2AuthorizationCodeRequestAuthenticationToken 형태로 반환한다.

```java
OAuth2AuthorizationConsent authorizationConsent = authorizationConsentBuilder.build();
    if (!authorizationConsent.equals(currentAuthorizationConsent)) {
        this.authorizationConsentService.save(authorizationConsent);
        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Saved authorization consent");
        }
    }

    OAuth2TokenContext tokenContext = createAuthorizationCodeTokenContext(
            authorizationConsentAuthentication, registeredClient, authorization, authorizedScopes);
    OAuth2AuthorizationCode authorizationCode = this.authorizationCodeGenerator.generate(tokenContext);
    if (authorizationCode == null) {
        OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                "The token generator failed to generate the authorization code.", ERROR_URI);
        throw new OAuth2AuthorizationCodeRequestAuthenticationException(error, null);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Generated authorization code");
    }

    OAuth2Authorization updatedAuthorization = OAuth2Authorization.from(authorization)
            .authorizedScopes(authorizedScopes)
            .token(authorizationCode)
            .attributes(attrs -> {
                attrs.remove(OAuth2ParameterNames.STATE);
            })
            .build();
    this.authorizationService.save(updatedAuthorization);

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Saved authorization");
    }

    String redirectUri = authorizationRequest.getRedirectUri();
    if (!StringUtils.hasText(redirectUri)) {
        redirectUri = registeredClient.getRedirectUris().iterator().next();
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Authenticated authorization consent request");
    }

    return new OAuth2AuthorizationCodeRequestAuthenticationToken(
            authorizationRequest.getAuthorizationUri(), registeredClient.getClientId(), principal, authorizationCode,
            redirectUri, authorizationRequest.getState(), authorizedScopes);
}
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



