---
title: "Spring Security Oauth2 Part 8"
excerpt: "OAuth2 Resource Server"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# OAuth2 Resource Server

OAuth2 프레임워크 중에서 Resource Server 기능을 수행하는 모듈로 Authorization Server와의 통신을 통해 토큰 검증, Resource 접근 제한의 기능을 처리한다.

## Tokens

> JWT

- JwtDecoder, BearerTokenAuthenticationFilter, JwtAutheticationProvider와 같은 클래스를 활용하여 인증 로직을 처리한다. 
- 자체 검증 프로세스를 가지고 있으며 스프링 내부에서 검증을 처리한다.

> Opaque

- 인가 서버의 introspection 엔드 포인트를 통한 토큰 검증을 수행한다.
- JWT Token과 달리 실시간으로 토큰의 활성화 여부를 확인하는 것이 가능하다.

## Configuration

> build.gradle

```java
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
	implementation 'org.springframework.boot:spring-boot-starter-security'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	testImplementation 'org.springframework.security:spring-security-test'
}
```

OAuth2 Resource Server을 사용하기 위해서는 아래와 같이 issuer-uri 혹은 jwk-set-uri 정보가 필수적으로 요구된다. 해당 uri 정보를 토대로 JWT 검증에 사용되는 공개키를 인가 서버로부터 가져오는 작업을 수행한다.

> application.yml

```yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/oauth2
          jwk-set-uri: http://localhost:8080/realms/oauth2/protocol/openid-connect/certs
```

인가 서버 메타데이터 엔드포인트에는 아래와 같이 3가지 종류가 있다. issuer uri를 사용하기 위해서는 인가 서버가 아래의 3가지 엔드포인트 중에 하나는 반드시 지원해야한다. keycloak의 경우 첫번째 uri를 통해 엔드포인트 메타 데이터를 반환한다.

- https://localhost:8080/issuer/.well-known/openid-configuration
- https://localhost:8080/.well-known/openid-configuration/issuer
- https://localhost:8080/.well-known/oauth-authorization-server/issuer


위와 같이 gradle 과 application.yml을 설정하게 되면 자동으로 OAuth2ResourceServer에 대한 설정 클래스들이 실행된다.

### OAuth2ResourceServerAutoConfiguration

```java
@AutoConfiguration(before = { SecurityAutoConfiguration.class, UserDetailsServiceAutoConfiguration.class })
@EnableConfigurationProperties(OAuth2ResourceServerProperties.class)
@ConditionalOnClass(BearerTokenAuthenticationToken.class)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Import({ Oauth2ResourceServerConfiguration.JwtConfiguration.class,
		Oauth2ResourceServerConfiguration.OpaqueTokenConfiguration.class })
public class OAuth2ResourceServerAutoConfiguration {
}
```

> OAuth2ResourceServerProperties

OAuth2ResourceServerProperties 클래스를 살펴 보면, application.yml에 설정된 값을 토대로, JWT, Opaque token에 대한 정보가 parsing되어 저장되는 것을 확인할 수 있다.

```java
@ConfigurationProperties(prefix = "spring.security.oauth2.resourceserver")
public class OAuth2ResourceServerProperties {

	private final Jwt jwt = new Jwt();

	public Jwt getJwt() {
		return this.jwt;
	}

	private final Opaquetoken opaqueToken = new Opaquetoken();

	public Opaquetoken getOpaquetoken() {
		return this.opaqueToken;
	}

//JWT
public static class Jwt {

		/**
		 * JSON Web Key URI to use to verify the JWT token.
		 */
		private String jwkSetUri;

		/**
		 * JSON Web Algorithms used for verifying the digital signatures.
		 */
		private List<String> jwsAlgorithms = Arrays.asList("RS256");

		/**
		 * URI that can either be an OpenID Connect discovery endpoint or an OAuth 2.0
		 * Authorization Server Metadata endpoint defined by RFC 8414.
		 */
		private String issuerUri;

		/**
		 * Location of the file containing the public key used to verify a JWT.
		 */
		private Resource publicKeyLocation;

//Opaque
public static class Opaquetoken {

		/**
		 * Client id used to authenticate with the token introspection endpoint.
		 */
		private String clientId;

		/**
		 * Client secret used to authenticate with the token introspection endpoint.
		 */
		private String clientSecret;

		/**
		 * OAuth 2.0 endpoint through which token introspection is accomplished.
		 */
		private String introspectionUri;
```

위의 설정 정보를 토대로, JwtDecoderConfiguration, OpaqueConfiguration이 동작하게 된다.

> OAuth2ResourceServerJwtConfiguration

해당 클래스를 내부를 확인해보면, jwk-set-uri, issuer-uri를 토대로 JwtDecoder를 생성하여 Bean으로 등록하는 것을 확인할 수 있다. 또한, SecurityFilterChain도 생성하여 Security에 대한 설정을 처리한다.

```java
@Configuration(proxyBeanMethods = false)
class OAuth2ResourceServerJwtConfiguration {

	@Configuration(proxyBeanMethods = false)
	@ConditionalOnMissingBean(JwtDecoder.class)
	static class JwtDecoderConfiguration {

		private final OAuth2ResourceServerProperties.Jwt properties;

		JwtDecoderConfiguration(OAuth2ResourceServerProperties properties) {
			this.properties = properties.getJwt();
		}

		@Bean
		@ConditionalOnProperty(name = "spring.security.oauth2.resourceserver.jwt.jwk-set-uri")
		JwtDecoder jwtDecoderByJwkKeySetUri() {
			NimbusJwtDecoder nimbusJwtDecoder = NimbusJwtDecoder.withJwkSetUri(this.properties.getJwkSetUri())
				.jwsAlgorithms(this::jwsAlgorithms)
				.build();
			String issuerUri = this.properties.getIssuerUri();
			Supplier<OAuth2TokenValidator<Jwt>> defaultValidator = (issuerUri != null)
					? () -> JwtValidators.createDefaultWithIssuer(issuerUri) : JwtValidators::createDefault;
			nimbusJwtDecoder.setJwtValidator(getValidators(defaultValidator));
			return nimbusJwtDecoder;
		}


		@Bean
		@Conditional(KeyValueCondition.class)
		JwtDecoder jwtDecoderByPublicKeyValue() throws Exception {
			RSAPublicKey publicKey = (RSAPublicKey) KeyFactory.getInstance("RSA")
				.generatePublic(new X509EncodedKeySpec(getKeySpec(this.properties.readPublicKey())));
			NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withPublicKey(publicKey)
				.signatureAlgorithm(SignatureAlgorithm.from(exactlyOneAlgorithm()))
				.build();
			jwtDecoder.setJwtValidator(getValidators(JwtValidators::createDefault));
			return jwtDecoder;
		}


		@Bean
		@Conditional(IssuerUriCondition.class)
		SupplierJwtDecoder jwtDecoderByIssuerUri() {
			return new SupplierJwtDecoder(() -> {
				String issuerUri = this.properties.getIssuerUri();
				NimbusJwtDecoder jwtDecoder = JwtDecoders.fromIssuerLocation(issuerUri);
				jwtDecoder.setJwtValidator(getValidators(() -> JwtValidators.createDefaultWithIssuer(issuerUri)));
				return jwtDecoder;
			});
		}

	}

    //Security Filter Chain
	@Configuration(proxyBeanMethods = false)
	@ConditionalOnDefaultWebSecurity
	static class OAuth2SecurityFilterChainConfiguration {

		@Bean
		@ConditionalOnBean(JwtDecoder.class)
		SecurityFilterChain jwtSecurityFilterChain(HttpSecurity http) throws Exception {
			http.authorizeHttpRequests((requests) -> requests.anyRequest().authenticated());
			http.oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);
			return http.build();
		}

	}

}
```
### OAuth2ResourceServerConfigurer

위의 SecurityFilterChain 객체 생성으로 OAuth2ResourceServerConfigurer가 동작하여 ResourceServer 기능을 수행하기 위한 각종 설정들을 처리하게 된다. 내부 클래스를 확인해보면 아래와 같다.

```java
public final class OAuth2ResourceServerConfigurer<H extends HttpSecurityBuilder<H>>
		extends AbstractHttpConfigurer<OAuth2ResourceServerConfigurer<H>, H> {

	private static final RequestHeaderRequestMatcher X_REQUESTED_WITH = new RequestHeaderRequestMatcher(
			"X-Requested-With", "XMLHttpRequest");
	private final ApplicationContext context;
	private AuthenticationManagerResolver<HttpServletRequest> authenticationManagerResolver;
	private BearerTokenResolver bearerTokenResolver;

    //JwtConfigurer
	private JwtConfigurer jwtConfigurer;
    //OpaqueConfigurer
	private OpaqueTokenConfigurer opaqueTokenConfigurer;
    //AccessDeninedHandler
	private AccessDeniedHandler accessDeniedHandler = new DelegatingAccessDeniedHandler(
			new LinkedHashMap<>(Map.of(CsrfException.class, new AccessDeniedHandlerImpl())),
			new BearerTokenAccessDeniedHandler());
    //AuthenticationEntryPoint
	private AuthenticationEntryPoint authenticationEntryPoint = new BearerTokenAuthenticationEntryPoint();
	private BearerTokenRequestMatcher requestMatcher = new BearerTokenRequestMatcher();
```

JwtConfigurer,OpaqueTokenConfigurer와 같이 Token를 처리하기 위한 객체들을 포함하고 있다.

> BearerTokenAuthenticationFilter

아래와 같이 BearerToken 기반의 인증을 처리하기 위한 Filter을 생성하는 작업을 담당한다.
```java
@Override
public void configure(H http) {
    BearerTokenResolver bearerTokenResolver = getBearerTokenResolver();
    this.requestMatcher.setBearerTokenResolver(bearerTokenResolver);
    AuthenticationManagerResolver resolver = this.authenticationManagerResolver;
    if (resolver == null) {
        AuthenticationManager authenticationManager = getAuthenticationManager(http);
        resolver = (request) -> authenticationManager;
    }

    BearerTokenAuthenticationFilter filter = new BearerTokenAuthenticationFilter(resolver);
    filter.setBearerTokenResolver(bearerTokenResolver);
    filter.setAuthenticationEntryPoint(this.authenticationEntryPoint);
    filter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());
    filter = postProcess(filter);
    http.addFilter(filter);
}
```

> BearerTokenAuthenticationEntryPoint

인증이 실패하였을 때, 다시 로그인을 처리하기 위한 AuthenticationEntryPoint을 등록하는 작업

```java
private void registerDefaultEntryPoint(H http) {
    ExceptionHandlingConfigurer<H> exceptionHandling = http.getConfigurer(ExceptionHandlingConfigurer.class);
    if (exceptionHandling != null) {
        ContentNegotiationStrategy contentNegotiationStrategy = http
                .getSharedObject(ContentNegotiationStrategy.class);
        if (contentNegotiationStrategy == null) {
            contentNegotiationStrategy = new HeaderContentNegotiationStrategy();
        }
        MediaTypeRequestMatcher restMatcher = new MediaTypeRequestMatcher(contentNegotiationStrategy,
                MediaType.APPLICATION_ATOM_XML, MediaType.APPLICATION_FORM_URLENCODED, MediaType.APPLICATION_JSON,
                MediaType.APPLICATION_OCTET_STREAM, MediaType.APPLICATION_XML, MediaType.MULTIPART_FORM_DATA,
                MediaType.TEXT_XML);
        restMatcher.setIgnoredMediaTypes(Collections.singleton(MediaType.ALL));
        MediaTypeRequestMatcher allMatcher = new MediaTypeRequestMatcher(contentNegotiationStrategy, MediaType.ALL);
        allMatcher.setUseEquals(true);
        RequestMatcher notHtmlMatcher = new NegatedRequestMatcher(
                new MediaTypeRequestMatcher(contentNegotiationStrategy, MediaType.TEXT_HTML));
        RequestMatcher restNotHtmlMatcher = new AndRequestMatcher(
                Arrays.<RequestMatcher>asList(notHtmlMatcher, restMatcher));
        RequestMatcher preferredMatcher = new OrRequestMatcher(
                Arrays.asList(this.requestMatcher, X_REQUESTED_WITH, restNotHtmlMatcher, allMatcher));
        exceptionHandling.defaultAuthenticationEntryPointFor(this.authenticationEntryPoint, preferredMatcher);
    }
}
```
## Jwt 토큰 검증

Bearer Token을 전달하게 되면 Resource Server에서는 해당 토큰에 대한 검증을 처리한다. 이때, jwk-set-uri 엔드포인트가 활용된다.

검증은 크게 2가지 단계로 이루어진다.

1. jwk-set-uri을 통해 공개키를 받아서 검증을 수행한다.
2. Issuer-uri에 대한 JWT 클레임에 대한 검증을 수행한다.

이 모든 과정은 JwtDecoder에 의해서 처리된다.

Spring Security에서는 NimbusJwtDecoder가 default으로 동작하게 된다. NimbusJwtDecoder는 아래와 같이 크게 3가지 방법으로 만들 수 있다. 해당 프로젝트의 경우, jwk-set-uri을 기반으로 동작하기 때문에, JwtSetUriJwtDecoderBuilder 클래스가 동작하게 된다.

![nimbus_jwt_decoder](/assets/images/jsf/Spring_Security/oauth2/nimbus_jwt_decoder.png)

### 검증 프로세스

![jwt_verification_process](/assets/images/jsf/Spring_Security/oauth2/jwt_verification_process.png)

> 1. JwtAuthenticationProvider에 의해서 Jwt 검증을 호출된다.

```java
//JwtAuthenticationProvider
@Override
public Authentication authenticate(Authentication authentication) throws AuthenticationException {
    BearerTokenAuthenticationToken bearer = (BearerTokenAuthenticationToken) authentication;
    Jwt jwt = getJwt(bearer);
    AbstractAuthenticationToken token = this.jwtAuthenticationConverter.convert(jwt);
    token.setDetails(bearer.getDetails());
    this.logger.debug("Authenticated token");
    return token;
}

private Jwt getJwt(BearerTokenAuthenticationToken bearer) {
    try {
        return this.jwtDecoder.decode(bearer.getToken());
    }
    catch (BadJwtException failed) {
        this.logger.debug("Failed to authenticate since the JWT was invalid");
        throw new InvalidBearerTokenException(failed.getMessage(), failed);
    }
    catch (JwtException failed) {
        throw new AuthenticationServiceException(failed.getMessage(), failed);
    }
}

//NimbusJwtDecoder
@Override
public Jwt decode(String token) throws JwtException {
    JWT jwt = parse(token);
    if (jwt instanceof PlainJWT) {
        this.logger.trace("Failed to decode unsigned token");
        throw new BadJwtException("Unsupported algorithm of " + jwt.getHeader().getAlgorithm());
    }
    Jwt createdJwt = createJwt(token, jwt);
    return validateJwt(createdJwt);
}
```

> 2. JwtParser에 의해 JWT가 parsing 된다.

```java
//JwtParser
private JWT parse(String token) {
    try {
        return JWTParser.parse(token);
    }
    catch (Exception ex) {
        this.logger.trace("Failed to parse token", ex);
        throw new BadJwtException(String.format(DECODING_ERROR_MESSAGE_TEMPLATE, ex.getMessage()), ex);
    }
}

public static JWT parse(final String s)
    throws ParseException {

    final int firstDotPos = s.indexOf(".");
    
    if (firstDotPos == -1)
        throw new ParseException("Invalid JWT serialization: Missing dot delimiter(s)", 0);
        
    Base64URL header = new Base64URL(s.substring(0, firstDotPos));
    
    Map<String, Object> jsonObject;

    try {
        jsonObject = JSONObjectUtils.parse(header.decodeToString());

    } catch (ParseException e) {

        throw new ParseException("Invalid unsecured/JWS/JWE header: " + e.getMessage(), 0);
    }

    Algorithm alg = Header.parseAlgorithm(jsonObject);

    if (alg.equals(Algorithm.NONE)) {
        return PlainJWT.parse(s);
    } else if (alg instanceof JWSAlgorithm) {
        return SignedJWT.parse(s);
    } else if (alg instanceof JWEAlgorithm) {
        return EncryptedJWT.parse(s);
    } else {
        throw new AssertionError("Unexpected algorithm type: " + alg);
    }
}
//SignedJwt
public static SignedJWT parse(final String s)
		throws ParseException {

		Base64URL[] parts = JOSEObject.split(s);

		if (parts.length != 3) {
			throw new ParseException("Unexpected number of Base64URL parts, must be three", 0);
		}

		return new SignedJWT(parts[0], parts[1], parts[2]);
	}

```

위의 과정을 통해 아래와 같이, header,payloag,signature이 parsing된다.

![jwt-parser](/assets/images/jsf/Spring_Security/oauth2/jwt_parser.png)

> 3. JwtProcessor을 통해 JwtClaimSet 처리

Jwt에 대한 구문 분석 및 검증 처리를 위한 인터페이스다.

```java
//NimbusJwtDecoder
private Jwt createJwt(String token, JWT parsedJwt) {
try {
    // Verify the signature
    JWTClaimsSet jwtClaimsSet = this.jwtProcessor.process(parsedJwt, null);

//DefaultJwsProcessor
@Override
	public JWTClaimsSet process(final JWT jwt, final C context)
		throws BadJOSEException, JOSEException {

		if (jwt instanceof SignedJWT) {
			return process((SignedJWT)jwt, context);
		}

		if (jwt instanceof EncryptedJWT) {
			return process((EncryptedJWT)jwt, context);
		}

		if (jwt instanceof PlainJWT) {
			return process((PlainJWT)jwt, context);
		}

		// Should never happen
		throw new JOSEException("Unexpected JWT object type: " + jwt.getClass());
	}

@Override
public JWTClaimsSet process(final SignedJWT signedJWT, final C context)
    throws BadJOSEException, JOSEException {
    
    if (jwsTypeVerifier == null) {
        throw new BadJOSEException("Signed JWT rejected: No JWS header typ (type) verifier is configured");
    }
    
    jwsTypeVerifier.verify(signedJWT.getHeader().getType(), context);

    if (getJWSKeySelector() == null && getJWTClaimsSetAwareJWSKeySelector() == null) {
        // JWS key selector may have been deliberately omitted
        throw new BadJOSEException("Signed JWT rejected: No JWS key selector is configured");
    }

    if (getJWSVerifierFactory() == null) {
        throw new JOSEException("No JWS verifier is configured");
    }
    
    JWTClaimsSet claimsSet = extractJWTClaimsSet(signedJWT);

```

위의 결과로 아래와 같이 claim들이 parsing된다.

![jwt_claim_set](/assets/images/jsf/Spring_Security/oauth2/jwt_claim_set.png)

> 4. JWSKeySelector에 의해 Jwt 검증을 위한 키 후보를 탐색한다.

```java
//DefaultJWTProcessor
@Override
public JWTClaimsSet process(final SignedJWT signedJWT, final C context)
    ...
    List<? extends Key> keyCandidates = selectKeys(signedJWT.getHeader(), claimsSet, context);
    ...

private List<? extends Key> selectKeys(final JWSHeader header, final JWTClaimsSet claimsSet, final C context)
    throws KeySourceException, BadJOSEException {
    
    if (getJWTClaimsSetAwareJWSKeySelector() != null) {
        return getJWTClaimsSetAwareJWSKeySelector().selectKeys(header, claimsSet, context);
    } else if (getJWSKeySelector() != null) {
        return getJWSKeySelector().selectJWSKeys(header, context);
    } else {
        throw new BadJOSEException("Signed JWT rejected: No JWS key selector is configured");
    }
}
//JWSVerificationKeySelector
@Override
public List<Key> selectJWSKeys(final JWSHeader jwsHeader, final C context)
    throws KeySourceException {

    if (! jwsAlgs.contains(jwsHeader.getAlgorithm())) {
        // Unexpected JWS alg
        return Collections.emptyList();
    }

    JWKMatcher jwkMatcher = createJWKMatcher(jwsHeader);
    if (jwkMatcher == null) {
        return Collections.emptyList();
    }

    List<JWK> jwkMatches = getJWKSource().get(new JWKSelector(jwkMatcher), context);
    ...
}
```

> 5. JWKSource를 통해 인가 서버와 통신을 수행하여 키를 검색한다.

캐시를 확인해서 JwkSet이 존재하면 캐시로부터 받아오고, 그렇지 않으면 RestTemplate을 활용하여 인가서버로 부터 키 후보를 받아온다.


```java
//RemoteJwtSet
@Override
public List<JWK> get(final JWKSelector jwkSelector, final C context)
    throws RemoteKeySourceException {

    // Check the cache first
    JWKSet jwkSet = jwkSetCache.get();
    
    if (jwkSetCache.requiresRefresh() || jwkSet == null) {
        // JWK set update required
        try {
            // Prevent multiple cache updates in case of concurrent requests
            // (with double-checked locking, i.e. locking on update required only)
            synchronized (this) {
                jwkSet = jwkSetCache.get();
                if (jwkSetCache.requiresRefresh() || jwkSet == null) {
                    // Retrieve JWK set from URL
                    jwkSet = updateJWKSetFromURL();
        ...
}
//
private JWKSet updateJWKSetFromURL()
    throws RemoteKeySourceException {
    Resource res;
    try {
        res = jwkSetRetriever.retrieveResource(jwkSetURL);
    } catch (IOException e) {
        throw new RemoteKeySourceException("Couldn't retrieve remote JWK set: " + e.getMessage(), e);
    }
    JWKSet jwkSet;
    try {
        jwkSet = JWKSet.parse(res.getContent());
    } catch (java.text.ParseException e) {
        throw new RemoteKeySourceException("Couldn't parse remote JWK set: " + e.getMessage(), e);
    }
    jwkSetCache.put(jwkSet);
    return jwkSet;
}
@Override
public Resource retrieveResource(URL url) throws IOException {
    HttpHeaders headers = new HttpHeaders();
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON, APPLICATION_JWK_SET_JSON));
    ResponseEntity<String> response = getResponse(url, headers);
    if (response.getStatusCodeValue() != 200) {
        throw new IOException(response.toString());
    }
    return new Resource(response.getBody(), "UTF-8");
}

private ResponseEntity<String> getResponse(URL url, HttpHeaders headers) throws IOException {
    try {
        RequestEntity<Void> request = new RequestEntity<>(headers, HttpMethod.GET, url.toURI());
        return this.restOperations.exchange(request, String.class);
    }
    catch (Exception ex) {
        throw new IOException(ex);
    }
}
```

위의 결과로 아래의 JwkSet이 반환된다.

![jwk_key_set](/assets/images/jsf/Spring_Security/oauth2/jwk_key_set.png)

#### 6.JWKSelector을 통해 JWKSet에서 키를 선택한다.

```java
//RemoteJWKSet
@Override
public List<JWK> get(final JWKSelector jwkSelector, final C context)
    throws RemoteKeySourceException {
    ...
    /*
    JwkSet 탐색 작업 --> 5번 과정
    */
    // Run the selector on the JWK set
    List<JWK> matches = jwkSelector.select(jwkSet);

    if (! matches.isEmpty()) {
        // Success
        return matches;
    }

//JwkSelector
public List<JWK> select(final JWKSet jwkSet) {

    List<JWK> selectedKeys = new LinkedList<>();

    if (jwkSet == null)
        return selectedKeys;

    for (JWK key: jwkSet.getKeys()) {

        if (matcher.matches(key)) {
            selectedKeys.add(key);
        }
    }

    return selectedKeys;
}
```
#### 7. JWKMatcher을 통해 키가 JWKMatcher의 사양과 부합하는 지 검사한다.

JWKMatcher는 JWSKeySelector에 의해 전달되는데, JWT의 header을 활용하여 생성된다.

```java
//JWSVerificationKeySelector
@Override
public List<Key> selectJWSKeys(final JWSHeader jwsHeader, final C context)
    throws KeySourceException {

    if (! jwsAlgs.contains(jwsHeader.getAlgorithm())) {
        // Unexpected JWS alg
        return Collections.emptyList();
    }

    JWKMatcher jwkMatcher = createJWKMatcher(jwsHeader);
    if (jwkMatcher == null) {
        return Collections.emptyList();
    }

    List<JWK> jwkMatches = getJWKSource().get(new JWKSelector(jwkMatcher), context);
    ...
}
protected JWKMatcher createJWKMatcher(final JWSHeader jwsHeader) {

    if (! isAllowed(jwsHeader.getAlgorithm())) {
        // Unexpected JWS alg
        return null;
    } else {
        return JWKMatcher.forJWSHeader(jwsHeader);
    }
}

//JwkSelector
public final class JWKSelector {
	/**
	 * The JWK matcher.
	 */
	private final JWKMatcher matcher;
    public List<JWK> select(final JWKSet jwkSet) {

        List<JWK> selectedKeys = new LinkedList<>();

        if (jwkSet == null)
            return selectedKeys;

        for (JWK key: jwkSet.getKeys()) {

            if (matcher.matches(key)) {
                selectedKeys.add(key);
            }
        }

        return selectedKeys;
    }
}
```

#### 8. JWSVerifier에 의해 JWT 검증을 수행한다.

```java
//DefaultJWTProcessor
@Override
public JWTClaimsSet process(final SignedJWT signedJWT, final C context)
    throws BadJOSEException, JOSEException {
    List<? extends Key> keyCandidates = selectKeys(signedJWT.getHeader(), claimsSet, context);

    if (keyCandidates == null || keyCandidates.isEmpty()) {
        throw new BadJOSEException("Signed JWT rejected: Another algorithm expected, or no matching key(s) found");
    }

    ListIterator<? extends Key> it = keyCandidates.listIterator();

    while (it.hasNext()) {

        JWSVerifier verifier = getJWSVerifierFactory().createJWSVerifier(signedJWT.getHeader(), it.next());

        if (verifier == null) {
            continue;
        }

        final boolean validSignature = signedJWT.verify(verifier);

        if (validSignature) {
            return verifyClaims(claimsSet, context);
        }

        if (! it.hasNext()) {
            // No more keys to try out
            throw new BadJWSException("Signed JWT rejected: Invalid signature");
        }
    }

    throw new BadJOSEException("JWS object rejected: No matching verifier(s) found");
}

//JWSVerifier
@Override
public JWSVerifier createJWSVerifier(final JWSHeader header, final Key key)
    throws JOSEException {

    JWSVerifier verifier;

    if (MACVerifier.SUPPORTED_ALGORITHMS.contains(header.getAlgorithm())) {

        if (!(key instanceof SecretKey)) {
            throw new KeyTypeException(SecretKey.class);
        }

        SecretKey macKey = (SecretKey)key;

        verifier = new MACVerifier(macKey);

    } else if (RSASSAVerifier.SUPPORTED_ALGORITHMS.contains(header.getAlgorithm())) {

        if (!(key instanceof RSAPublicKey)) {
            throw new KeyTypeException(RSAPublicKey.class);
        }

        RSAPublicKey rsaPublicKey = (RSAPublicKey)key;

        verifier = new RSASSAVerifier(rsaPublicKey);

    } else if (ECDSAVerifier.SUPPORTED_ALGORITHMS.contains(header.getAlgorithm())) {

        if (!(key instanceof ECPublicKey)) {
            throw new KeyTypeException(ECPublicKey.class);
        }

        ECPublicKey ecPublicKey = (ECPublicKey)key;

        verifier = new ECDSAVerifier(ecPublicKey);

    } else {

        throw new JOSEException("Unsupported JWS algorithm: " + header.getAlgorithm());
    }

    // Apply JCA context, SecureRandom expensive and not needed for verification (iss #385)
    verifier.getJCAContext().setProvider(jcaContext.getProvider());

    return verifier;
}
//JWSObject
public synchronized boolean verify(final JWSVerifier verifier)
    throws JOSEException {

    ensureSignedOrVerifiedState();

    boolean verified;

    try {
        verified = verifier.verify(getHeader(), getSigningInput(), getSignature());

    } catch (JOSEException e) {

        throw e;

    } catch (Exception e) {

        // Prevent throwing unchecked exceptions at this point,
        // see issue #20
        throw new JOSEException(e.getMessage(), e);
    }

    if (verified) {

        state.set(State.VERIFIED);
    }

    return verified;
}
//RSASSAVerifier
@Override
public boolean verify(final JWSHeader header,
                    final byte[] signedContent, 
                    final Base64URL signature)
    throws JOSEException {

    if (! critPolicy.headerPasses(header)) {
        return false;
    }

    final Signature verifier = RSASSA.getSignerAndVerifier(header.getAlgorithm(), getJCAContext().getProvider());

    try {
        verifier.initVerify(publicKey);

    } catch (InvalidKeyException e) {
        throw new JOSEException("Invalid public RSA key: " + e.getMessage(), e);
    }

    try {
        verifier.update(signedContent);
        return verifier.verify(signature.decode());

    } catch (SignatureException e) {
        return false;
    }
}
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



