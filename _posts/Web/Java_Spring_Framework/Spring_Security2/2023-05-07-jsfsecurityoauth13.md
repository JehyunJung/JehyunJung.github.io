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
    ...
}
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
        if (authenticationResult instanceof OAuth2AuthorizationConsentAuthenticationToken) {
            if (this.logger.isTraceEnabled()) {
                this.logger.trace("Authorization consent is required");
            }
            sendAuthorizationConsent(request, response,
                    (OAuth2AuthorizationCodeRequestAuthenticationToken) authentication,
                    (OAuth2AuthorizationConsentAuthenticationToken) authenticationResult);
            return;
        }

        this.authenticationSuccessHandler.onAuthenticationSuccess(
                request, response, authenticationResult);

    } catch (OAuth2AuthenticationException ex) {
        if (this.logger.isTraceEnabled()) {
            this.logger.trace(LogMessage.format("Authorization request failed: %s", ex.getError()), ex);
        }
        this.authenticationFailureHandler.onAuthenticationFailure(request, response, ex);
    }
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

## Token Endpoint

OAuth2 token 관련 처리를 수행하는 것으로, 각각의 권한 부여 유형에 따른 converter, provider을 이용해서 인증 토큰을 처리한다.

> OAuth2TokenEndpointConfigurer

```java
@Override
RequestMatcher getRequestMatcher() {
    return this.requestMatcher;
}

private static List<AuthenticationConverter> createDefaultAuthenticationConverters() {
    List<AuthenticationConverter> authenticationConverters = new ArrayList<>();

    authenticationConverters.add(new OAuth2AuthorizationCodeAuthenticationConverter());
    authenticationConverters.add(new OAuth2RefreshTokenAuthenticationConverter());
    authenticationConverters.add(new OAuth2ClientCredentialsAuthenticationConverter());

    return authenticationConverters;
}

private static List<AuthenticationProvider> createDefaultAuthenticationProviders(HttpSecurity httpSecurity) {
    List<AuthenticationProvider> authenticationProviders = new ArrayList<>();

    OAuth2AuthorizationService authorizationService = OAuth2ConfigurerUtils.getAuthorizationService(httpSecurity);
    OAuth2TokenGenerator<? extends OAuth2Token> tokenGenerator = OAuth2ConfigurerUtils.getTokenGenerator(httpSecurity);

    OAuth2AuthorizationCodeAuthenticationProvider authorizationCodeAuthenticationProvider =
            new OAuth2AuthorizationCodeAuthenticationProvider(authorizationService, tokenGenerator);
    authenticationProviders.add(authorizationCodeAuthenticationProvider);

    OAuth2RefreshTokenAuthenticationProvider refreshTokenAuthenticationProvider =
            new OAuth2RefreshTokenAuthenticationProvider(authorizationService, tokenGenerator);
    authenticationProviders.add(refreshTokenAuthenticationProvider);

    OAuth2ClientCredentialsAuthenticationProvider clientCredentialsAuthenticationProvider =
            new OAuth2ClientCredentialsAuthenticationProvider(authorizationService, tokenGenerator);
    authenticationProviders.add(clientCredentialsAuthenticationProvider);

    return authenticationProviders;
}
```

### Client Authentication

항상, token, userinfo 등 OAuth2 기반의 filter 수행을 위해서는 Client Authentication 즉 클라이언트 인증이 먼저 이루어져야한다. 아래의 Filter 목록을 확인해보면 OAuth2ClientAuthenticationFilter가 먼저 동작하기 때문에 해당 filter에 인증 받지 못하면 그 다음에 있는 OAuth2 기반의 Filter들은 동작하지 않는다.

![client_authentication_filter](/assets/images/jsf/Spring_Security/oauth2/client_authentication_filter.jpg)

Client 인증 방식에는 ClientSecretPost, ClientSecretBasic, JwtClientAssertion, PublicClient와 같이 크게 4가지 방식이 있으며, 각각의 인증 방식 처리를 위해 converter, provider가 존재한다.

#### Flow

Client Secret Post 방식의 경우 아래와 같이 동작하게 된다.

![client_secret_post_authentication](/assets/images/jsf/Spring_Security/oauth2/client_secret_post_authentication.png)

1. ClientSecretPostAuthenticationConverter

converter을 통해 client_id, client_post을 추출한다.

```java
@Nullable
@Override
public Authentication convert(HttpServletRequest request) {
    MultiValueMap<String, String> parameters = OAuth2EndpointUtils.getParameters(request);

    // client_id (REQUIRED)
    String clientId = parameters.getFirst(OAuth2ParameterNames.CLIENT_ID);
    if (!StringUtils.hasText(clientId)) {
        return null;
    }

    if (parameters.get(OAuth2ParameterNames.CLIENT_ID).size() != 1) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_REQUEST);
    }

    // client_secret (REQUIRED)
    String clientSecret = parameters.getFirst(OAuth2ParameterNames.CLIENT_SECRET);
    if (!StringUtils.hasText(clientSecret)) {
        return null;
    }

    if (parameters.get(OAuth2ParameterNames.CLIENT_SECRET).size() != 1) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_REQUEST);
    }

    Map<String, Object> additionalParameters = OAuth2EndpointUtils.getParametersIfMatchesAuthorizationCodeGrantRequest(request,
            OAuth2ParameterNames.CLIENT_ID,
            OAuth2ParameterNames.CLIENT_SECRET);

    return new OAuth2ClientAuthenticationToken(clientId, ClientAuthenticationMethod.CLIENT_SECRET_POST, clientSecret,
            additionalParameters);
}
```

2. 이후, ClientSecretAuthenticationProvider을 통해 client에 대한 인증을 수행한다.
RegisteredClient을 활용하여 해당 클라이언트 인증방식을 처리할 수 있는지, client_id, client_secret은 맞는지 판단한다.

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2ClientAuthenticationToken clientAuthentication =
            (OAuth2ClientAuthenticationToken) authentication;

    if (!ClientAuthenticationMethod.CLIENT_SECRET_BASIC.equals(clientAuthentication.getClientAuthenticationMethod()) &&
            !ClientAuthenticationMethod.CLIENT_SECRET_POST.equals(clientAuthentication.getClientAuthenticationMethod())) {
        return null;
    }

    String clientId = clientAuthentication.getPrincipal().toString();
    RegisteredClient registeredClient = this.registeredClientRepository.findByClientId(clientId);
    if (registeredClient == null) {
        throwInvalidClient(OAuth2ParameterNames.CLIENT_ID);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved registered client");
    }

    if (!registeredClient.getClientAuthenticationMethods().contains(
            clientAuthentication.getClientAuthenticationMethod())) {
        throwInvalidClient("authentication_method");
    }

    if (clientAuthentication.getCredentials() == null) {
        throwInvalidClient("credentials");
    }

    String clientSecret = clientAuthentication.getCredentials().toString();
    if (!this.passwordEncoder.matches(clientSecret, registeredClient.getClientSecret())) {
        throwInvalidClient(OAuth2ParameterNames.CLIENT_SECRET);
    }

    if (registeredClient.getClientSecretExpiresAt() != null &&
            Instant.now().isAfter(registeredClient.getClientSecretExpiresAt())) {
        throwInvalidClient("client_secret_expires_at");
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Validated client authentication parameters");
    }

    // Validate the "code_verifier" parameter for the confidential client, if available
    this.codeVerifierAuthenticator.authenticateIfAvailable(clientAuthentication, registeredClient);

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Authenticated client secret");
    }

    return new OAuth2ClientAuthenticationToken(registeredClient,
            clientAuthentication.getClientAuthenticationMethod(), clientAuthentication.getCredentials());
}
```

### Authorization Code

Token 발급하는 대표적인 유형인 Authorization Code 유형의 토큰 발급 과정을 살펴보자

![authorization_code_authentication](/assets/images/jsf/Spring_Security/oauth2/authorization_code_authentication.png)

1. Converter을 통해 grant_type, redirect_uri, code와 같은 parameter가 전달되는지 확인하고 Token 형태로 추출한다.

```java
@Nullable
@Override
public Authentication convert(HttpServletRequest request) {
    // grant_type (REQUIRED)
    String grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE);
    if (!AuthorizationGrantType.AUTHORIZATION_CODE.getValue().equals(grantType)) {
        return null;
    }

    Authentication clientPrincipal = SecurityContextHolder.getContext().getAuthentication();

    MultiValueMap<String, String> parameters = OAuth2EndpointUtils.getParameters(request);

    // code (REQUIRED)
    String code = parameters.getFirst(OAuth2ParameterNames.CODE);
    if (!StringUtils.hasText(code) ||
            parameters.get(OAuth2ParameterNames.CODE).size() != 1) {
        OAuth2EndpointUtils.throwError(
                OAuth2ErrorCodes.INVALID_REQUEST,
                OAuth2ParameterNames.CODE,
                OAuth2EndpointUtils.ACCESS_TOKEN_REQUEST_ERROR_URI);
    }

    // redirect_uri (REQUIRED)
    // Required only if the "redirect_uri" parameter was included in the authorization request
    String redirectUri = parameters.getFirst(OAuth2ParameterNames.REDIRECT_URI);
    if (StringUtils.hasText(redirectUri) &&
            parameters.get(OAuth2ParameterNames.REDIRECT_URI).size() != 1) {
        OAuth2EndpointUtils.throwError(
                OAuth2ErrorCodes.INVALID_REQUEST,
                OAuth2ParameterNames.REDIRECT_URI,
                OAuth2EndpointUtils.ACCESS_TOKEN_REQUEST_ERROR_URI);
    }

    Map<String, Object> additionalParameters = new HashMap<>();
    parameters.forEach((key, value) -> {
        if (!key.equals(OAuth2ParameterNames.GRANT_TYPE) &&
                !key.equals(OAuth2ParameterNames.CLIENT_ID) &&
                !key.equals(OAuth2ParameterNames.CODE) &&
                !key.equals(OAuth2ParameterNames.REDIRECT_URI)) {
            additionalParameters.put(key, value.get(0));
        }
    });

    return new OAuth2AuthorizationCodeAuthenticationToken(
            code, clientPrincipal, redirectUri, additionalParameters);
}
```

2. OAuth2AuthorizationCodeAuthenticationProvider을 활용하여 OAuth2Authorization에 저장되어 있는 AuthorizationCode와 전달된 Authorization Code을 비교한다.

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2AuthorizationCodeAuthenticationToken authorizationCodeAuthentication =
            (OAuth2AuthorizationCodeAuthenticationToken) authentication;

    OAuth2ClientAuthenticationToken clientPrincipal =
            getAuthenticatedClientElseThrowInvalidClient(authorizationCodeAuthentication);
    RegisteredClient registeredClient = clientPrincipal.getRegisteredClient();

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved registered client");
    }

    OAuth2Authorization authorization = this.authorizationService.findByToken(
            authorizationCodeAuthentication.getCode(), AUTHORIZATION_CODE_TOKEN_TYPE);
    if (authorization == null) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_GRANT);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved authorization with authorization code");
    }

    OAuth2Authorization.Token<OAuth2AuthorizationCode> authorizationCode =
            authorization.getToken(OAuth2AuthorizationCode.class);

    OAuth2AuthorizationRequest authorizationRequest = authorization.getAttribute(
            OAuth2AuthorizationRequest.class.getName());

    if (!registeredClient.getClientId().equals(authorizationRequest.getClientId())) {
        if (!authorizationCode.isInvalidated()) {
            // Invalidate the authorization code given that a different client is attempting to use it
            authorization = OAuth2AuthenticationProviderUtils.invalidate(authorization, authorizationCode.getToken());
            this.authorizationService.save(authorization);
            if (this.logger.isWarnEnabled()) {
                this.logger.warn(LogMessage.format("Invalidated authorization code used by registered client '%s'", registeredClient.getId()));
            }
        }
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_GRANT);
    }

    if (StringUtils.hasText(authorizationRequest.getRedirectUri()) &&
            !authorizationRequest.getRedirectUri().equals(authorizationCodeAuthentication.getRedirectUri())) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_GRANT);
    }

    if (!authorizationCode.isActive()) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_GRANT);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Validated token request parameters");
    }
```

3. Authorization Code가 일치한다면, Access Token, Refresh Token, Id-Token을 생성한다. 

```java
// @formatter:off
DefaultOAuth2TokenContext.Builder tokenContextBuilder = DefaultOAuth2TokenContext.builder()
        .registeredClient(registeredClient)
        .principal(authorization.getAttribute(Principal.class.getName()))
        .authorizationServerContext(AuthorizationServerContextHolder.getContext())
        .authorization(authorization)
        .authorizedScopes(authorization.getAuthorizedScopes())
        .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
        .authorizationGrant(authorizationCodeAuthentication);
// @formatter:on

OAuth2Authorization.Builder authorizationBuilder = OAuth2Authorization.from(authorization);

// ----- Access token -----
OAuth2TokenContext tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.ACCESS_TOKEN).build();
OAuth2Token generatedAccessToken = this.tokenGenerator.generate(tokenContext);
if (generatedAccessToken == null) {
    OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
            "The token generator failed to generate the access token.", ERROR_URI);
    throw new OAuth2AuthenticationException(error);
}

if (this.logger.isTraceEnabled()) {
    this.logger.trace("Generated access token");
}

OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,
        generatedAccessToken.getTokenValue(), generatedAccessToken.getIssuedAt(),
        generatedAccessToken.getExpiresAt(), tokenContext.getAuthorizedScopes());
if (generatedAccessToken instanceof ClaimAccessor) {
    authorizationBuilder.token(accessToken, (metadata) ->
            metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, ((ClaimAccessor) generatedAccessToken).getClaims()));
} else {
    authorizationBuilder.accessToken(accessToken);
}

// ----- Refresh token -----
OAuth2RefreshToken refreshToken = null;
if (registeredClient.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN) &&
        // Do not issue refresh token to public client
        !clientPrincipal.getClientAuthenticationMethod().equals(ClientAuthenticationMethod.NONE)) {

    tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.REFRESH_TOKEN).build();
    OAuth2Token generatedRefreshToken = this.tokenGenerator.generate(tokenContext);
    if (!(generatedRefreshToken instanceof OAuth2RefreshToken)) {
        OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                "The token generator failed to generate the refresh token.", ERROR_URI);
        throw new OAuth2AuthenticationException(error);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Generated refresh token");
    }

    refreshToken = (OAuth2RefreshToken) generatedRefreshToken;
    authorizationBuilder.refreshToken(refreshToken);
}

// ----- ID token -----
OidcIdToken idToken;
if (authorizationRequest.getScopes().contains(OidcScopes.OPENID)) {
    // @formatter:off
    tokenContext = tokenContextBuilder
            .tokenType(ID_TOKEN_TOKEN_TYPE)
            .authorization(authorizationBuilder.build())	// ID token customizer may need access to the access token and/or refresh token
            .build();
    // @formatter:on
    OAuth2Token generatedIdToken = this.tokenGenerator.generate(tokenContext);
    if (!(generatedIdToken instanceof Jwt)) {
        OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                "The token generator failed to generate the ID token.", ERROR_URI);
        throw new OAuth2AuthenticationException(error);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Generated id token");
    }

    idToken = new OidcIdToken(generatedIdToken.getTokenValue(), generatedIdToken.getIssuedAt(),
            generatedIdToken.getExpiresAt(), ((Jwt) generatedIdToken).getClaims());
    authorizationBuilder.token(idToken, (metadata) ->
            metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, idToken.getClaims()));
} else {
    idToken = null;
}

authorization = authorizationBuilder.build();

// Invalidate the authorization code as it can only be used once
authorization = OAuth2AuthenticationProviderUtils.invalidate(authorization, authorizationCode.getToken());

this.authorizationService.save(authorization);

if (this.logger.isTraceEnabled()) {
    this.logger.trace("Saved authorization");
}

Map<String, Object> additionalParameters = Collections.emptyMap();
if (idToken != null) {
    additionalParameters = new HashMap<>();
    additionalParameters.put(OidcParameterNames.ID_TOKEN, idToken.getTokenValue());
}

if (this.logger.isTraceEnabled()) {
    this.logger.trace("Authenticated token request");
}

return new OAuth2AccessTokenAuthenticationToken(
        registeredClient, clientPrincipal, accessToken, refreshToken, additionalParameters);
}
```

4. Token을 생성할 때, JwtGenerator, JwtEncoder가 활용된다.

> JwtGenerator

JwtGenerator을 통해 header, 각종 claim을 구성한다.

```java
@Nullable
@Override
public Jwt generate(OAuth2TokenContext context) {
    if (context.getTokenType() == null ||
            (!OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType()) &&
                    !OidcParameterNames.ID_TOKEN.equals(context.getTokenType().getValue()))) {
        return null;
    }
    if (OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType()) &&
            !OAuth2TokenFormat.SELF_CONTAINED.equals(context.getRegisteredClient().getTokenSettings().getAccessTokenFormat())) {
        return null;
    }

    String issuer = null;
    if (context.getAuthorizationServerContext() != null) {
        issuer = context.getAuthorizationServerContext().getIssuer();
    }
    RegisteredClient registeredClient = context.getRegisteredClient();

    Instant issuedAt = Instant.now();
    Instant expiresAt;
    JwsAlgorithm jwsAlgorithm = SignatureAlgorithm.RS256;
    if (OidcParameterNames.ID_TOKEN.equals(context.getTokenType().getValue())) {
        // TODO Allow configuration for ID Token time-to-live
        expiresAt = issuedAt.plus(30, ChronoUnit.MINUTES);
        if (registeredClient.getTokenSettings().getIdTokenSignatureAlgorithm() != null) {
            jwsAlgorithm = registeredClient.getTokenSettings().getIdTokenSignatureAlgorithm();
        }
    } else {
        expiresAt = issuedAt.plus(registeredClient.getTokenSettings().getAccessTokenTimeToLive());
    }

    // @formatter:off
    JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder();
    if (StringUtils.hasText(issuer)) {
        claimsBuilder.issuer(issuer);
    }
    claimsBuilder
            .subject(context.getPrincipal().getName())
            .audience(Collections.singletonList(registeredClient.getClientId()))
            .issuedAt(issuedAt)
            .expiresAt(expiresAt);
    if (OAuth2TokenType.ACCESS_TOKEN.equals(context.getTokenType())) {
        claimsBuilder.notBefore(issuedAt);
        if (!CollectionUtils.isEmpty(context.getAuthorizedScopes())) {
            claimsBuilder.claim(OAuth2ParameterNames.SCOPE, context.getAuthorizedScopes());
        }
    } else if (OidcParameterNames.ID_TOKEN.equals(context.getTokenType().getValue())) {
        claimsBuilder.claim(IdTokenClaimNames.AZP, registeredClient.getClientId());
        if (AuthorizationGrantType.AUTHORIZATION_CODE.equals(context.getAuthorizationGrantType())) {
            OAuth2AuthorizationRequest authorizationRequest = context.getAuthorization().getAttribute(
                    OAuth2AuthorizationRequest.class.getName());
            String nonce = (String) authorizationRequest.getAdditionalParameters().get(OidcParameterNames.NONCE);
            if (StringUtils.hasText(nonce)) {
                claimsBuilder.claim(IdTokenClaimNames.NONCE, nonce);
            }
        }
        // TODO Add 'auth_time' claim
    }
    // @formatter:on

    JwsHeader.Builder jwsHeaderBuilder = JwsHeader.with(jwsAlgorithm);

    if (this.jwtCustomizer != null) {
        // @formatter:off
        JwtEncodingContext.Builder jwtContextBuilder = JwtEncodingContext.with(jwsHeaderBuilder, claimsBuilder)
                .registeredClient(context.getRegisteredClient())
                .principal(context.getPrincipal())
                .authorizationServerContext(context.getAuthorizationServerContext())
                .authorizedScopes(context.getAuthorizedScopes())
                .tokenType(context.getTokenType())
                .authorizationGrantType(context.getAuthorizationGrantType());
        if (context.getAuthorization() != null) {
            jwtContextBuilder.authorization(context.getAuthorization());
        }
        if (context.getAuthorizationGrant() != null) {
            jwtContextBuilder.authorizationGrant(context.getAuthorizationGrant());
        }
        // @formatter:on

        JwtEncodingContext jwtContext = jwtContextBuilder.build();
        this.jwtCustomizer.customize(jwtContext);
    }

    JwsHeader jwsHeader = jwsHeaderBuilder.build();
    JwtClaimsSet claims = claimsBuilder.build();

    Jwt jwt = this.jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims));

    return jwt;
}
```

> JwtEncoder

JwtEncoder을 활용해서 Token Signature을 생성한다. 즉, 토큰에 대한 서명을 추가한다. encoding 과정은 decoding 과정과 매우 유사하게 동작한다. jwk-set-uri을 통해 jwk을 받아서 토큰을 서명하게 된다.

```java
@Override
public Jwt encode(JwtEncoderParameters parameters) throws JwtEncodingException {
    Assert.notNull(parameters, "parameters cannot be null");

    JwsHeader headers = parameters.getJwsHeader();
    if (headers == null) {
        headers = DEFAULT_JWS_HEADER;
    }
    JwtClaimsSet claims = parameters.getClaims();

    JWK jwk = selectJwk(headers);
    headers = addKeyIdentifierHeadersIfNecessary(headers, jwk);

    String jws = serialize(headers, claims, jwk);

    return new Jwt(jws, claims.getIssuedAt(), claims.getExpiresAt(), headers.getHeaders(), claims.getClaims());
}
```

### Client Credentials

client credentials 방식은 client_id, client_secret 만으로 access token을 발급하는 방식이다. 

![client_credentials_authentication](/assets/images/jsf/Spring_Security/oauth2/client_credentials_authentication.png)

authorization code 방식과 유사하게 해당 인증 방식을 처리할 수 있는 converter, provider가 동작하여 인증을 처리한다.

1. ClientCredentialsAuthenticationConverter

grant_type,scope parameter가 있는 확인하고 token 형태로 추출한다.

```java
@Nullable
@Override
public Authentication convert(HttpServletRequest request) {
    // grant_type (REQUIRED)
    String grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE);
    if (!AuthorizationGrantType.CLIENT_CREDENTIALS.getValue().equals(grantType)) {
        return null;
    }

    Authentication clientPrincipal = SecurityContextHolder.getContext().getAuthentication();

    MultiValueMap<String, String> parameters = OAuth2EndpointUtils.getParameters(request);

    // scope (OPTIONAL)
    String scope = parameters.getFirst(OAuth2ParameterNames.SCOPE);
    if (StringUtils.hasText(scope) &&
            parameters.get(OAuth2ParameterNames.SCOPE).size() != 1) {
        OAuth2EndpointUtils.throwError(
                OAuth2ErrorCodes.INVALID_REQUEST,
                OAuth2ParameterNames.SCOPE,
                OAuth2EndpointUtils.ACCESS_TOKEN_REQUEST_ERROR_URI);
    }
    Set<String> requestedScopes = null;
    if (StringUtils.hasText(scope)) {
        requestedScopes = new HashSet<>(
                Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
    }

    Map<String, Object> additionalParameters = new HashMap<>();
    parameters.forEach((key, value) -> {
        if (!key.equals(OAuth2ParameterNames.GRANT_TYPE) &&
                !key.equals(OAuth2ParameterNames.SCOPE)) {
            additionalParameters.put(key, value.get(0));
        }
    });

    return new OAuth2ClientCredentialsAuthenticationToken(
            clientPrincipal, requestedScopes, additionalParameters);
}
```

2. ClientCredentialsAuthenticationProvider

해당 provider에서는 grant_type, scope가 적합한지만 판단하고, Access Token을 발급한다. 다른 인증 방식과 달리 과정이 간단하지만 그 만큼 보안에 취약하다

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2ClientCredentialsAuthenticationToken clientCredentialsAuthentication =
            (OAuth2ClientCredentialsAuthenticationToken) authentication;

    OAuth2ClientAuthenticationToken clientPrincipal =
            getAuthenticatedClientElseThrowInvalidClient(clientCredentialsAuthentication);
    RegisteredClient registeredClient = clientPrincipal.getRegisteredClient();

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved registered client");
    }

    if (!registeredClient.getAuthorizationGrantTypes().contains(AuthorizationGrantType.CLIENT_CREDENTIALS)) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.UNAUTHORIZED_CLIENT);
    }

    Set<String> authorizedScopes = Collections.emptySet();
    if (!CollectionUtils.isEmpty(clientCredentialsAuthentication.getScopes())) {
        for (String requestedScope : clientCredentialsAuthentication.getScopes()) {
            if (!registeredClient.getScopes().contains(requestedScope)) {
                throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_SCOPE);
            }
        }
        authorizedScopes = new LinkedHashSet<>(clientCredentialsAuthentication.getScopes());
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Validated token request parameters");
    }

    // @formatter:off
    OAuth2TokenContext tokenContext = DefaultOAuth2TokenContext.builder()
            .registeredClient(registeredClient)
            .principal(clientPrincipal)
            .authorizationServerContext(AuthorizationServerContextHolder.getContext())
            .authorizedScopes(authorizedScopes)
            .tokenType(OAuth2TokenType.ACCESS_TOKEN)
            .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
            .authorizationGrant(clientCredentialsAuthentication)
            .build();
    // @formatter:on

    OAuth2Token generatedAccessToken = this.tokenGenerator.generate(tokenContext);
    if (generatedAccessToken == null) {
        OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                "The token generator failed to generate the access token.", ERROR_URI);
        throw new OAuth2AuthenticationException(error);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Generated access token");
    }

    OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,
            generatedAccessToken.getTokenValue(), generatedAccessToken.getIssuedAt(),
            generatedAccessToken.getExpiresAt(), tokenContext.getAuthorizedScopes());

    // @formatter:off
    OAuth2Authorization.Builder authorizationBuilder = OAuth2Authorization.withRegisteredClient(registeredClient)
            .principalName(clientPrincipal.getName())
            .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
            .authorizedScopes(authorizedScopes);
    // @formatter:on
    if (generatedAccessToken instanceof ClaimAccessor) {
        authorizationBuilder.token(accessToken, (metadata) ->
                metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, ((ClaimAccessor) generatedAccessToken).getClaims()));
    } else {
        authorizationBuilder.accessToken(accessToken);
    }

    OAuth2Authorization authorization = authorizationBuilder.build();

    this.authorizationService.save(authorization);

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Saved authorization");
        // This log is kept separate for consistency with other providers
        this.logger.trace("Authenticated token request");
    }

    return new OAuth2AccessTokenAuthenticationToken(registeredClient, clientPrincipal, accessToken);
}
```

### RefreshToken

Refresh Token을 전달하여 Access Token을 발급받는 인증 방식으로, 앞서 살핀 인증 방식과 마찬가지로, converter, provider가 동작한다.

1. OAuth2RefreshTokenAuthenticationConverter

grant_type, refresh_token, scope 값을 추출한다.

```java
@Nullable
@Override
public Authentication convert(HttpServletRequest request) {
    // grant_type (REQUIRED)
    String grantType = request.getParameter(OAuth2ParameterNames.GRANT_TYPE);
    if (!AuthorizationGrantType.REFRESH_TOKEN.getValue().equals(grantType)) {
        return null;
    }

    Authentication clientPrincipal = SecurityContextHolder.getContext().getAuthentication();

    MultiValueMap<String, String> parameters = OAuth2EndpointUtils.getParameters(request);

    // refresh_token (REQUIRED)
    String refreshToken = parameters.getFirst(OAuth2ParameterNames.REFRESH_TOKEN);
    if (!StringUtils.hasText(refreshToken) ||
            parameters.get(OAuth2ParameterNames.REFRESH_TOKEN).size() != 1) {
        OAuth2EndpointUtils.throwError(
                OAuth2ErrorCodes.INVALID_REQUEST,
                OAuth2ParameterNames.REFRESH_TOKEN,
                OAuth2EndpointUtils.ACCESS_TOKEN_REQUEST_ERROR_URI);
    }

    // scope (OPTIONAL)
    String scope = parameters.getFirst(OAuth2ParameterNames.SCOPE);
    if (StringUtils.hasText(scope) &&
            parameters.get(OAuth2ParameterNames.SCOPE).size() != 1) {
        OAuth2EndpointUtils.throwError(
                OAuth2ErrorCodes.INVALID_REQUEST,
                OAuth2ParameterNames.SCOPE,
                OAuth2EndpointUtils.ACCESS_TOKEN_REQUEST_ERROR_URI);
    }
    Set<String> requestedScopes = null;
    if (StringUtils.hasText(scope)) {
        requestedScopes = new HashSet<>(
                Arrays.asList(StringUtils.delimitedListToStringArray(scope, " ")));
    }

    Map<String, Object> additionalParameters = new HashMap<>();
    parameters.forEach((key, value) -> {
        if (!key.equals(OAuth2ParameterNames.GRANT_TYPE) &&
                !key.equals(OAuth2ParameterNames.REFRESH_TOKEN) &&
                !key.equals(OAuth2ParameterNames.SCOPE)) {
            additionalParameters.put(key, value.get(0));
        }
    });

    return new OAuth2RefreshTokenAuthenticationToken(
            refreshToken, clientPrincipal, requestedScopes, additionalParameters);
}
```

2. OAuth2RefreshTokenAuthenticationProvider

grant_type, refresh_token, scope에 대한 검증을 수행하고 Access Token, Refresh Token(재사용 설정이 되어 있는 경우 재사용한다.), Id Token을 발급한다.

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2RefreshTokenAuthenticationToken refreshTokenAuthentication =
            (OAuth2RefreshTokenAuthenticationToken) authentication;

    OAuth2ClientAuthenticationToken clientPrincipal =
            getAuthenticatedClientElseThrowInvalidClient(refreshTokenAuthentication);
    RegisteredClient registeredClient = clientPrincipal.getRegisteredClient();

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved registered client");
    }

    OAuth2Authorization authorization = this.authorizationService.findByToken(
            refreshTokenAuthentication.getRefreshToken(), OAuth2TokenType.REFRESH_TOKEN);
    if (authorization == null) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_GRANT);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved authorization with refresh token");
    }

    if (!registeredClient.getId().equals(authorization.getRegisteredClientId())) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_GRANT);
    }

    if (!registeredClient.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN)) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.UNAUTHORIZED_CLIENT);
    }

    OAuth2Authorization.Token<OAuth2RefreshToken> refreshToken = authorization.getRefreshToken();
    if (!refreshToken.isActive()) {
        // As per https://tools.ietf.org/html/rfc6749#section-5.2
        // invalid_grant: The provided authorization grant (e.g., authorization code,
        // resource owner credentials) or refresh token is invalid, expired, revoked [...].
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_GRANT);
    }

    // As per https://tools.ietf.org/html/rfc6749#section-6
    // The requested scope MUST NOT include any scope not originally granted by the resource owner,
    // and if omitted is treated as equal to the scope originally granted by the resource owner.
    Set<String> scopes = refreshTokenAuthentication.getScopes();
    Set<String> authorizedScopes = authorization.getAuthorizedScopes();
    if (!authorizedScopes.containsAll(scopes)) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_SCOPE);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Validated token request parameters");
    }

    if (scopes.isEmpty()) {
        scopes = authorizedScopes;
    }

    // @formatter:off
    DefaultOAuth2TokenContext.Builder tokenContextBuilder = DefaultOAuth2TokenContext.builder()
            .registeredClient(registeredClient)
            .principal(authorization.getAttribute(Principal.class.getName()))
            .authorizationServerContext(AuthorizationServerContextHolder.getContext())
            .authorization(authorization)
            .authorizedScopes(scopes)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .authorizationGrant(refreshTokenAuthentication);
    // @formatter:on

    OAuth2Authorization.Builder authorizationBuilder = OAuth2Authorization.from(authorization);

    // ----- Access token -----
    OAuth2TokenContext tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.ACCESS_TOKEN).build();
    OAuth2Token generatedAccessToken = this.tokenGenerator.generate(tokenContext);
    if (generatedAccessToken == null) {
        OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                "The token generator failed to generate the access token.", ERROR_URI);
        throw new OAuth2AuthenticationException(error);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Generated access token");
    }

    OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,
            generatedAccessToken.getTokenValue(), generatedAccessToken.getIssuedAt(),
            generatedAccessToken.getExpiresAt(), tokenContext.getAuthorizedScopes());
    if (generatedAccessToken instanceof ClaimAccessor) {
        authorizationBuilder.token(accessToken, (metadata) -> {
            metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, ((ClaimAccessor) generatedAccessToken).getClaims());
            metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, false);
        });
    } else {
        authorizationBuilder.accessToken(accessToken);
    }

    // ----- Refresh token -----
    OAuth2RefreshToken currentRefreshToken = refreshToken.getToken();
    if (!registeredClient.getTokenSettings().isReuseRefreshTokens()) {
        tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.REFRESH_TOKEN).build();
        OAuth2Token generatedRefreshToken = this.tokenGenerator.generate(tokenContext);
        if (!(generatedRefreshToken instanceof OAuth2RefreshToken)) {
            OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                    "The token generator failed to generate the refresh token.", ERROR_URI);
            throw new OAuth2AuthenticationException(error);
        }

        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Generated refresh token");
        }

        currentRefreshToken = (OAuth2RefreshToken) generatedRefreshToken;
        authorizationBuilder.refreshToken(currentRefreshToken);
    }

    // ----- ID token -----
    OidcIdToken idToken;
    if (authorizedScopes.contains(OidcScopes.OPENID)) {
        // @formatter:off
        tokenContext = tokenContextBuilder
                .tokenType(ID_TOKEN_TOKEN_TYPE)
                .authorization(authorizationBuilder.build())	// ID token customizer may need access to the access token and/or refresh token
                .build();
        // @formatter:on
        OAuth2Token generatedIdToken = this.tokenGenerator.generate(tokenContext);
        if (!(generatedIdToken instanceof Jwt)) {
            OAuth2Error error = new OAuth2Error(OAuth2ErrorCodes.SERVER_ERROR,
                    "The token generator failed to generate the ID token.", ERROR_URI);
            throw new OAuth2AuthenticationException(error);
        }

        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Generated id token");
        }

        idToken = new OidcIdToken(generatedIdToken.getTokenValue(), generatedIdToken.getIssuedAt(),
                generatedIdToken.getExpiresAt(), ((Jwt) generatedIdToken).getClaims());
        authorizationBuilder.token(idToken, (metadata) ->
                metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, idToken.getClaims()));
    } else {
        idToken = null;
    }

    authorization = authorizationBuilder.build();

    this.authorizationService.save(authorization);

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Saved authorization");
    }

    Map<String, Object> additionalParameters = Collections.emptyMap();
    if (idToken != null) {
        additionalParameters = new HashMap<>();
        additionalParameters.put(OidcParameterNames.ID_TOKEN, idToken.getTokenValue());
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Authenticated token request");
    }

    return new OAuth2AccessTokenAuthenticationToken(
            registeredClient, clientPrincipal, accessToken, currentRefreshToken, additionalParameters);
}
```

### Authorization Code + PKCE

Authorization Code, Public Client 방식에서 PKCE 인증을 추가하여 보안을 강화할 수 있다. Authorization Code을 요청할 때, Code Challenge, Code Challenge Method을 전달한다.

1. OAuth2AuthorizationCodeRequestAuthenticationConverter을 통해 code_challenge, code_challenge_method가 추출된다.

```java
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
```

![authorization_code_pkce_authentication](/assets/images/jsf/Spring_Security/oauth2/authorization_code_pkce_authentication.png)

2. client 인증 과정에서 code challenge에 대한 검증이 이루어진다.

ClientSecret, Public Client 방식에서 PKCE 인증 방식을 처리할 수 있다. client 검증, PKCE 검증이 모두 통과해야 client에 대한 인증이 정상적으로 처리된다.

```java
// Validate the "code_verifier" parameter for the confidential client, if available
this.codeVerifierAuthenticator.authenticateIfAvailable(clientAuthentication, registeredClient);

void authenticateIfAvailable(OAuth2ClientAuthenticationToken clientAuthentication,
        RegisteredClient registeredClient) {
    authenticate(clientAuthentication, registeredClient);
}
private boolean authenticate(OAuth2ClientAuthenticationToken clientAuthentication,
        RegisteredClient registeredClient) {

    Map<String, Object> parameters = clientAuthentication.getAdditionalParameters();
    if (!authorizationCodeGrant(parameters)) {
        return false;
    }

    OAuth2Authorization authorization = this.authorizationService.findByToken(
            (String) parameters.get(OAuth2ParameterNames.CODE),
            AUTHORIZATION_CODE_TOKEN_TYPE);
    if (authorization == null) {
        throwInvalidGrant(OAuth2ParameterNames.CODE);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved authorization with authorization code");
    }
    //처음 요청 시 전달된 code-challenge, code-challenge-method 추출
    OAuth2AuthorizationRequest authorizationRequest = authorization.getAttribute(
            OAuth2AuthorizationRequest.class.getName());

    String codeChallenge = (String) authorizationRequest.getAdditionalParameters()
            .get(PkceParameterNames.CODE_CHALLENGE);
    if (!StringUtils.hasText(codeChallenge)) {
        if (registeredClient.getClientSettings().isRequireProofKey()) {
            throwInvalidGrant(PkceParameterNames.CODE_CHALLENGE);
        } else {
            if (this.logger.isTraceEnabled()) {
                this.logger.trace("Did not authenticate code verifier since requireProofKey=false");
            }
            return false;
        }
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Validated code verifier parameters");
    }

    String codeChallengeMethod = (String) authorizationRequest.getAdditionalParameters()
            .get(PkceParameterNames.CODE_CHALLENGE_METHOD);
    //token 요청 과정에서 전달된 code-verifier
    String codeVerifier = (String) parameters.get(PkceParameterNames.CODE_VERIFIER);
    if (!codeVerifierValid(codeVerifier, codeChallenge, codeChallengeMethod)) {
        throwInvalidGrant(PkceParameterNames.CODE_VERIFIER);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Authenticated code verifier");
    }

    return true;
}

private static boolean codeVerifierValid(String codeVerifier, String codeChallenge, String codeChallengeMethod) {
    if (!StringUtils.hasText(codeVerifier)) {
        return false;
    } else if ("S256".equals(codeChallengeMethod)) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            String encodedVerifier = Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
            return encodedVerifier.equals(codeChallenge);
        } catch (NoSuchAlgorithmException ex) {
            // It is unlikely that SHA-256 is not available on the server. If it is not available,
            // there will likely be bigger issues as well. We default to SERVER_ERROR.
            throw new OAuth2AuthenticationException(OAuth2ErrorCodes.SERVER_ERROR);
        }
    }
    return false;
}
```

### Responses

Token Endpoint에 대한 응답이 성공적으로 이루어지면 아래와 같이 각종 token 값과 scope, expires 등의 정보를 반환하게 된다.

> Success Response

```json
{
    "access_token": "eyJraWQiOiI2NDczMDUxOC1kNzE5LTQ4NWEtYmY2YS0zYzRjYmM1NjRiZTIiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiYXVkIjoib2F1dGgyLWNsaWVudC1hcHAxIiwibmJmIjoxNjgzNTA5ODQxLCJzY29wZSI6WyJyZWFkIiwib3BlbmlkIiwid3JpdGUiXSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo5MDAwIiwiZXhwIjoxNjgzNTEwMTQxLCJpYXQiOjE2ODM1MDk4NDF9.kp2Lcb9DbzJqQIENOK2LxVQ3jqA1Gok0rxazmuHwSMCnNZ9ieh9Jv13TA15mN5og7muft3MiOqxOOYfbH-35smrsNHnMLGFrF3OtiYVWTq3xhe5WYc_XUu9HFmMXgILtJzlMgIRIwUXvArSpxaMLNBcXvL08FiDFGox2G8cb3WpG7CHWLBkazwZyuWHBBGxz1ZY_FmnGUetmNV0volV0Z8nCQ2_stWksWe5UgYxOiiLS9dSl27xcHi31MBxup1fzqLYA3LeOIKh3A8xG2W7mtzpwA-bwzq0qMj0LUwHs61KvHJycKPm0Xj3qvIRD3GP2e6AsJIbiGoArvmaYkC8NkQ",
    "refresh_token": "6OUz2k1_hVB66edPUjz362qOEgbVIShT-5ysnetm0UGyfJLoTe7B5HsLnAuL7bg5h8p9D9VW_MzwcpCw_5MgBVx82mXmuvlftbjbRZKSylZInmhdUxDkUqwqy5483z_L",
    "scope": "read openid write",
    "id_token": "eyJraWQiOiI2NDczMDUxOC1kNzE5LTQ4NWEtYmY2YS0zYzRjYmM1NjRiZTIiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyIiwiYXVkIjoib2F1dGgyLWNsaWVudC1hcHAxIiwiYXpwIjoib2F1dGgyLWNsaWVudC1hcHAxIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo5MDAwIiwiZXhwIjoxNjgzNTExNjQxLCJpYXQiOjE2ODM1MDk4NDF9.kSfHpOVdCXA7HauBbavddcjZCKyPy4f_TUo2UlWx-qDmOaVuXb6W358gJAcUCwBzWCGJVSgPxCkUFBXx43VkUM4EEHnEJu_qK_YZO5cWcYZzjWQu9ftABCNYc1L2YYclLFbykcY_Z33mZhuV8iawiHFllkQuOPTohavF1aLhmTV8hweMVvMNIP6oVxDRPQ2i3YNgTLZr8HbPbcVetNEQE3P0BWci0Mh-wQ8aG3e14ZOKEqvMY9yb6ZIvK1RDErlUPJ56FKRHhnvBk2q87ktXnBFWSZrf7seXHQFxI1Vg-JWQAZWZn53Do_S3SXvrxPGwyrrpV_7X0L0Q92BgpM3hXA",
    "token_type": "Bearer",
    "expires_in": 300
}
```

> Fail Response

만일 실패하게 되면, 에러와 에러 코드를 함께 반환하게 되는데, 에러 코드의 종류를 통해 어디서 문제가 발생했는지 판단할 수 있다.

|Error Type|Description|
|--|--|
|invalid_request|요청 과정에서 매개변수가 생략되었거나, 지원하지 않는 매개변수를 활용하는 경우|
|invalid_client|client 인증이 실패하는 경우, client_id,client_secret이 잘못된 경우|
|invalid_grant|Authorization Code가 만료, 이미 사용, 틀린 경우 혹은 redirect_uri이 처음 요청과 다른 경우|
|invalid_scope|유효하지 않은 scope을 전달하는 경우|
|unauthorized_client|등록된 클라이언트에서 지원하지 않는 권한 부여 유형인 경우|
|unsupported_grant_type|인가 서버에서 지원하지 않는 권한 부여 유형인 경우|

## Token Introspection Endpoint

Resource Server 로부터 토큰 검증 요청할 때, 토큰에 대한 검증을 수행한다. Opaque Token에 대해 Authorization Server 내부에서 token에대한 활성화여부를 판단한다.

![token_introspection_authentication](/assets/images/jsf/Spring_Security/oauth2/token_introspection_authentication.png)

1. OAuth2TokenIntrospectionAuthenticationConverter를 통해 access token, token_type_hint와 같은 매개변수를 추출한다.

```java
@Override
public Authentication convert(HttpServletRequest request) {
    Authentication clientPrincipal = SecurityContextHolder.getContext().getAuthentication();

    MultiValueMap<String, String> parameters = OAuth2EndpointUtils.getParameters(request);

    // token (REQUIRED)
    String token = parameters.getFirst(OAuth2ParameterNames.TOKEN);
    if (!StringUtils.hasText(token) ||
            parameters.get(OAuth2ParameterNames.TOKEN).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.TOKEN);
    }

    // token_type_hint (OPTIONAL)
    String tokenTypeHint = parameters.getFirst(OAuth2ParameterNames.TOKEN_TYPE_HINT);
    if (StringUtils.hasText(tokenTypeHint) &&
            parameters.get(OAuth2ParameterNames.TOKEN_TYPE_HINT).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.TOKEN_TYPE_HINT);
    }

    Map<String, Object> additionalParameters = new HashMap<>();
    parameters.forEach((key, value) -> {
        if (!key.equals(OAuth2ParameterNames.TOKEN) &&
                !key.equals(OAuth2ParameterNames.TOKEN_TYPE_HINT)) {
            additionalParameters.put(key, value.get(0));
        }
    });

    return new OAuth2TokenIntrospectionAuthenticationToken(
            token, clientPrincipal, tokenTypeHint, additionalParameters);
}
```

2. OAuth2TokenIntrospectionAuthenticationProvider을 통해 해당 토큰이 활성화된 상태인지 판단한다. OAuth2Authorization에 저장된 Access Token을 통해 token의 활성화여부를 판단한다. 만료 여부, 비활성화 여부, nbf 여부에 따라서 활성화 상태가 결정된다.

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2TokenIntrospectionAuthenticationToken tokenIntrospectionAuthentication =
            (OAuth2TokenIntrospectionAuthenticationToken) authentication;

    OAuth2ClientAuthenticationToken clientPrincipal =
            getAuthenticatedClientElseThrowInvalidClient(tokenIntrospectionAuthentication);

    OAuth2Authorization authorization = this.authorizationService.findByToken(
            tokenIntrospectionAuthentication.getToken(), null);
    if (authorization == null) {
        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Did not authenticate token introspection request since token was not found");
        }
        // Return the authentication request when token not found
        return tokenIntrospectionAuthentication;
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved authorization with token");
    }

    OAuth2Authorization.Token<OAuth2Token> authorizedToken =
            authorization.getToken(tokenIntrospectionAuthentication.getToken());
    if (!authorizedToken.isActive()) {
        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Did not introspect token since not active");
        }
        return new OAuth2TokenIntrospectionAuthenticationToken(tokenIntrospectionAuthentication.getToken(),
                clientPrincipal, OAuth2TokenIntrospection.builder().build());
    }

    RegisteredClient authorizedClient = this.registeredClientRepository.findById(authorization.getRegisteredClientId());
    OAuth2TokenIntrospection tokenClaims = withActiveTokenClaims(authorizedToken, authorizedClient);

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Authenticated token introspection request");
    }

    return new OAuth2TokenIntrospectionAuthenticationToken(authorizedToken.getToken().getTokenValue(),
            clientPrincipal, tokenClaims);
}
```

## Token Revocation Endpoint

Access Token을 비활성화 작업을 처리하는 엔드포인트로, 해당 경로로 요청하게 되면 token을 비활성화시켜서 더 이상 사용할 수 없도록 한다.

![token_revocation](/assets/images/jsf/Spring_Security/oauth2/token_revocation.png)

1. OAuth2TokenRevocationAuthenticationConverter을 통해 token 값을 추출한다.

```java
@Override
public Authentication convert(HttpServletRequest request) {
    Authentication clientPrincipal = SecurityContextHolder.getContext().getAuthentication();

    MultiValueMap<String, String> parameters = OAuth2EndpointUtils.getParameters(request);

    // token (REQUIRED)
    String token = parameters.getFirst(OAuth2ParameterNames.TOKEN);
    if (!StringUtils.hasText(token) ||
            parameters.get(OAuth2ParameterNames.TOKEN).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.TOKEN);
    }

    // token_type_hint (OPTIONAL)
    String tokenTypeHint = parameters.getFirst(OAuth2ParameterNames.TOKEN_TYPE_HINT);
    if (StringUtils.hasText(tokenTypeHint) &&
            parameters.get(OAuth2ParameterNames.TOKEN_TYPE_HINT).size() != 1) {
        throwError(OAuth2ErrorCodes.INVALID_REQUEST, OAuth2ParameterNames.TOKEN_TYPE_HINT);
    }

    return new OAuth2TokenRevocationAuthenticationToken(token, clientPrincipal, tokenTypeHint);
}
```

2. OAuth2TokenRevocationAuthenticationProvider은 request으로 전달된 token값을 이용해서 OAuth2Authorization 내부의 Access Token 객체를 찾아서 해당 token에 대해 비활성화를 진행한다.

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OAuth2TokenRevocationAuthenticationToken tokenRevocationAuthentication =
            (OAuth2TokenRevocationAuthenticationToken) authentication;

    OAuth2ClientAuthenticationToken clientPrincipal =
            getAuthenticatedClientElseThrowInvalidClient(tokenRevocationAuthentication);
    RegisteredClient registeredClient = clientPrincipal.getRegisteredClient();

    OAuth2Authorization authorization = this.authorizationService.findByToken(
            tokenRevocationAuthentication.getToken(), null);
    if (authorization == null) {
        if (this.logger.isTraceEnabled()) {
            this.logger.trace("Did not authenticate token revocation request since token was not found");
        }
        // Return the authentication request when token not found
        return tokenRevocationAuthentication;
    }

    if (!registeredClient.getId().equals(authorization.getRegisteredClientId())) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_CLIENT);
    }

    OAuth2Authorization.Token<OAuth2Token> token = authorization.getToken(tokenRevocationAuthentication.getToken());
    authorization = OAuth2AuthenticationProviderUtils.invalidate(authorization, token.getToken());
    this.authorizationService.save(authorization);

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Saved authorization with revoked token");
        // This log is kept separate for consistency with other providers
        this.logger.trace("Authenticated token revocation request");
    }

    return new OAuth2TokenRevocationAuthenticationToken(token.getToken(), clientPrincipal);
}
```

## Authorization Server Metadata Endpoint

authorization server 에 대한 각종 메타 데이터를 반환하기 위해 존재하는 엔드포인트로, 각종 엔드포인트, 권한 부여 유형, 등 다양한 정보를 출력한다.

```/.well-known/oauth-authorization-server```에 대한 접근을 요청하게 되면 아래의 OAuth2AuthorizationServerMetadataEndpointFilter가 동작하게 되며, 내부에서 각종 정보를 설정한다.

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

    if (!this.requestMatcher.matches(request)) {
        filterChain.doFilter(request, response);
        return;
    }

    AuthorizationServerContext authorizationServerContext = AuthorizationServerContextHolder.getContext();
    String issuer = authorizationServerContext.getIssuer();
    AuthorizationServerSettings authorizationServerSettings = authorizationServerContext.getAuthorizationServerSettings();

    OAuth2AuthorizationServerMetadata.Builder authorizationServerMetadata = OAuth2AuthorizationServerMetadata.builder()
            .issuer(issuer)
            .authorizationEndpoint(asUrl(issuer, authorizationServerSettings.getAuthorizationEndpoint()))
            .tokenEndpoint(asUrl(issuer, authorizationServerSettings.getTokenEndpoint()))
            .tokenEndpointAuthenticationMethods(clientAuthenticationMethods())
            .jwkSetUrl(asUrl(issuer, authorizationServerSettings.getJwkSetEndpoint()))
            .responseType(OAuth2AuthorizationResponseType.CODE.getValue())
            .grantType(AuthorizationGrantType.AUTHORIZATION_CODE.getValue())
            .grantType(AuthorizationGrantType.CLIENT_CREDENTIALS.getValue())
            .grantType(AuthorizationGrantType.REFRESH_TOKEN.getValue())
            .tokenRevocationEndpoint(asUrl(issuer, authorizationServerSettings.getTokenRevocationEndpoint()))
            .tokenRevocationEndpointAuthenticationMethods(clientAuthenticationMethods())
            .tokenIntrospectionEndpoint(asUrl(issuer, authorizationServerSettings.getTokenIntrospectionEndpoint()))
            .tokenIntrospectionEndpointAuthenticationMethods(clientAuthenticationMethods())
            .codeChallengeMethod("S256");

    this.authorizationServerMetadataCustomizer.accept(authorizationServerMetadata);

    ServletServerHttpResponse httpResponse = new ServletServerHttpResponse(response);
    this.authorizationServerMetadataHttpMessageConverter.write(
            authorizationServerMetadata.build(), MediaType.APPLICATION_JSON, httpResponse);
}
```

## JWK Set Endpoint

JWK Set을 반환하는 엔드포인트로, Resource Server에서 JWT token에 대한 검증을 수행하는 과정에서 인가서버의 JWK Set Endpoint으로 JWK Set을 요청하게 된다.

```/oauth2/jwks```에 대한 요청으로 NimbusJwkSetEndpointFilter가 동작하여 JWK Set을 반환한다.

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

    if (!this.requestMatcher.matches(request)) {
        filterChain.doFilter(request, response);
        return;
    }

    JWKSet jwkSet;
    try {
        jwkSet = new JWKSet(this.jwkSource.get(this.jwkSelector, null));
    }
    catch (Exception ex) {
        throw new IllegalStateException("Failed to select the JWK(s) -> " + ex.getMessage(), ex);
    }

    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    try (Writer writer = response.getWriter()) {
        writer.write(jwkSet.toString());	// toString() excludes private keys
    }
}
```

## OpenID Connect 1.0 Endpoint

OidcConfigurer을 통해 OpenID 기반의 엔드포인트를 원한다.

```/userinfo``` 요청에 대해서 oicd 기반의 claim을 구성하여 사용자의 정보를 반환한다.

![oidc_authentication](/assets/images/jsf/Spring_Security/oauth2/oidc_authentication.png)

1. OidcUserInfoEndpointFilter의 경우 AuthorizationFilter 이후에 존재하기 때문에, 인증 절차를 거쳐야한다. 따라서, 아래의 설정을 추가하여 JWT 기반의 인증이 수행될 수 있도록 한다.

BearerAuthenticationFilter에 의해 인증 처리가 이루어진다.

```java
httpSecurity.oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);
```

2. 이후, OidcUserInfoEndpointFilter을 통해 access_token, openid scope를 판단하여 유저 정보를 반환하게 된다.

```java
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    OidcUserInfoAuthenticationToken userInfoAuthentication =
            (OidcUserInfoAuthenticationToken) authentication;

    AbstractOAuth2TokenAuthenticationToken<?> accessTokenAuthentication = null;
    if (AbstractOAuth2TokenAuthenticationToken.class.isAssignableFrom(userInfoAuthentication.getPrincipal().getClass())) {
        accessTokenAuthentication = (AbstractOAuth2TokenAuthenticationToken<?>) userInfoAuthentication.getPrincipal();
    }
    if (accessTokenAuthentication == null || !accessTokenAuthentication.isAuthenticated()) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_TOKEN);
    }

    String accessTokenValue = accessTokenAuthentication.getToken().getTokenValue();

    OAuth2Authorization authorization = this.authorizationService.findByToken(
            accessTokenValue, OAuth2TokenType.ACCESS_TOKEN);
    if (authorization == null) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_TOKEN);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Retrieved authorization with access token");
    }

    OAuth2Authorization.Token<OAuth2AccessToken> authorizedAccessToken = authorization.getAccessToken();
    if (!authorizedAccessToken.isActive()) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_TOKEN);
    }

    if (!authorizedAccessToken.getToken().getScopes().contains(OidcScopes.OPENID)) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INSUFFICIENT_SCOPE);
    }

    OAuth2Authorization.Token<OidcIdToken> idToken = authorization.getToken(OidcIdToken.class);
    if (idToken == null) {
        throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_TOKEN);
    }

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Validated user info request");
    }

    OidcUserInfoAuthenticationContext authenticationContext =
            OidcUserInfoAuthenticationContext.with(userInfoAuthentication)
                    .accessToken(authorizedAccessToken.getToken())
                    .authorization(authorization)
                    .build();
    OidcUserInfo userInfo = this.userInfoMapper.apply(authenticationContext);

    if (this.logger.isTraceEnabled()) {
        this.logger.trace("Authenticated user info request");
    }

    return new OidcUserInfoAuthenticationToken(accessTokenAuthentication, userInfo);
}
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



