---
title: "Spring Security Oauth2 Part 12"
excerpt: "Spring Authorization Server"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# Spring Authorization Server

KeyCloak과 같이 OAuth2, OIDC 기반의 인증방식을 제공하는 Authorization Server을 구현하는 프레임워크이다. Provider 설정, Token 생성, 등의 작업을 처리한다.

![spring_authorization_server](/assets/images/jsf/Spring_Security/oauth2/spring_authorization_server.png)

## Configuration

> build.gradle

```java
dependencies {
	//spring security
    implementation 'org.springframework.boot:spring-boot-starter-security'
	testImplementation 'org.springframework.security:spring-security-test'

    //spring authorization server
    implementation 'org.springframework.security:spring-security-oauth2-authorization-server:1.0.2'

    //thymeleaf
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
    implementation 'org.thymeleaf.extras:thymeleaf-extras-springsecurity6'

    //spring web
	implementation 'org.springframework.boot:spring-boot-starter-web'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'

    //lombok
	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'	
}
```

위의 authorization-server 관련 dependency를 추가하게 되면 아래와 같이 OAuthAuthorizationServerConfiguration class을 활용하여 Spring Authorization Server을 구성할 수 있다.

> import을 통한 Authorization Server 구성

OAuth2AuthorizationServerConfiguration을 import 하는 것만으로도 Authorization Server 관련 설정을 수행할 수 있다.

```java
@Configuration
@Import(OAuth2AuthorizationServerConfiguration.class)
public class AuthorizationServerConfig1 {
    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer("http://localhost:9000")
                .build();
    }
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("oauth2-client-app")
                .clientSecret("{noop}secret")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .redirectUri("http://127.0.0.1:8081/login/oauth2/code/oauth2-client-app")
                .redirectUri("http://127.0.0.1:8081")
                .scope(OidcScopes.OPENID)
                .scope("read")
                .scope("write")
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
                .build();

        InMemoryRegisteredClientRepository registeredClientRepository = new InMemoryRegisteredClientRepository(registeredClient);
        return registeredClientRepository;
    }
}
```

> applyDefaultSecurity의 활용한 구성

OAuth2AuthorizationServerConfiguration 내부에는 applyDefaultSecurity 메소드가 존재하는 데, 이를 활용하여 구성하는 것도 가능하다.

```java
@Configuration
public class AuthorizationServerConfig2 {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(httpSecurity);
        return httpSecurity.build();
    }

    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer("http://localhost:9000")
                .build();
    }
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("oauth2-client-app")
                .clientSecret("{noop}secret")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .redirectUri("http://127.0.0.1:8081/login/oauth2/code/oauth2-client-app")
                .redirectUri("http://127.0.0.1:8081")
                .scope(OidcScopes.OPENID)
                .scope("read")
                .scope("write")
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
                .build();

        InMemoryRegisteredClientRepository registeredClientRepository = new InMemoryRegisteredClientRepository(registeredClient);
        return registeredClientRepository;
    }
}
```

> 직접 OAuth2AuthorizationServerConfigurer 호출을 통한 구성

OAuth2AuthorizationServerConfigurer을 직접 호출하여 authorizationService, TokenGenerator, 각종 endpoint을 세밀하게 처리하는 것이 가능하다.

```java
Configuration
public class AuthorizationServerConfig3 {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer =
                new OAuth2AuthorizationServerConfigurer();
        httpSecurity.apply(authorizationServerConfigurer);

        return httpSecurity.build();
    }
    
    @Bean
    public AuthorizationServerSettings authorizationServerSettings() {
        return AuthorizationServerSettings.builder()
                .issuer("http://localhost:9000")
                .build();
    }
    @Bean
    public RegisteredClientRepository registeredClientRepository() {
        RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
                .clientId("oauth2-client-app")
                .clientSecret("{noop}secret")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .redirectUri("http://127.0.0.1:8081/login/oauth2/code/oauth2-client-app")
                .redirectUri("http://127.0.0.1:8081")
                .scope(OidcScopes.OPENID)
                .scope("read")
                .scope("write")
                .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())
                .build();

        InMemoryRegisteredClientRepository registeredClientRepository = new InMemoryRegisteredClientRepository(registeredClient);
        return registeredClientRepository;
    }
}
```

> jwtDecoder 관련 설정

jwt 기반의 access token을 처리하기 때문에, JwtDecoder을 통한 Token 검증을 수행한다. 따라서, JwtDecoder를 Bean 객체로 등록하여 처리될 수 있도록 한다.

```java
//JwtDecoder
@Bean
public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
    return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
}

//JWKSource
@Bean
public JWKSource<SecurityContext> jwkSource() throws NoSuchAlgorithmException {
    RSAKey rsaKey = generateRSA();
    JWKSet jwkSet = new JWKSet(rsaKey);
    return (jwkSelector, context) -> jwkSelector.select(jwkSet);
}

//RSAKey 생성
private RSAKey generateRSA() throws NoSuchAlgorithmException {
    KeyPair keyPair = generateRSAKey();
    RSAPrivateKey rsaPrivateKey = (RSAPrivateKey) keyPair.getPrivate();
    RSAPublicKey rsaPublicKJey = (RSAPublicKey) keyPair.getPublic();
    return new RSAKey.Builder(rsaPublicKJey)
            .privateKey(rsaPrivateKey)
            .keyID(UUID.randomUUID().toString())
            .build();
}

//KeyPair 생성
private KeyPair generateRSAKey() throws NoSuchAlgorithmException {
    KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
    keyPairGenerator.initialize(2048);
    return keyPairGenerator.generateKeyPair();
}
```

## Domain Classes


### OAuth2AuthorizationServerConfigurer

Authorization Server 관련 설정을 처리하는 configurer으로 아래의 5가지 Configurer을 포함한다.

|Configurer|Description|
|--|--|
|OAuth2ClientAuthenticationConfigurer|클라이언트 인증 엔드포인트 설정|
|OAuth2AuthorizationEndpointConfigurer|권한 부여 엔드 포인트 설정|
|OAuth2TokenEndpointConfigurer|토큰 엔드포인트 설정|
|OAuth2TokenRevocationConfigurer|토큰 취소 엔드포인트 설정|
|OidcConfigurer|OIDC 엔드포인트 설정|

아래의 메소드를 확인해보면 configurer들을 처리하는 것을 확인할 수 있다.

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

위의 Configurer 외에도 아래와 같이 여러 Configurer 들이 존재한다.

![oauth2_authorizationserver_configurers1](/assets/images/jsf/Spring_Security/oauth2/oauth2_authorizationserver_configurers1.png)

![oauth2_authorizationserver_configurers2](/assets/images/jsf/Spring_Security/oauth2/oauth2_authorizationserver_configurers2.png)

### AuthorizationServerContext

Provider 설정에 대한 정보를 저장하고 있는 객체로, Spring Authorization Server을 구동하기 위한 각종 정보를 포함한다.

> AuthorizationServerContext

```java
//AuthorizationServerContext
public interface AuthorizationServerContext {
	String getIssuer();
	AuthorizationServerSettings getAuthorizationServerSettings();
}
//AuthorizationServerSettings
public final class AuthorizationServerSettings extends AbstractSettings {

	private AuthorizationServerSettings(Map<String, Object> settings) {
		super(settings);
	}

	public String getIssuer() {
		return getSetting(ConfigurationSettingNames.AuthorizationServer.ISSUER);
	}

	public String getAuthorizationEndpoint() {
		return getSetting(ConfigurationSettingNames.AuthorizationServer.AUTHORIZATION_ENDPOINT);
	}

	public String getTokenEndpoint() {
		return getSetting(ConfigurationSettingNames.AuthorizationServer.TOKEN_ENDPOINT);
	}

	public String getJwkSetEndpoint() {
		return getSetting(ConfigurationSettingNames.AuthorizationServer.JWK_SET_ENDPOINT);
	}

	public String getTokenRevocationEndpoint() {
		return getSetting(ConfigurationSettingNames.AuthorizationServer.TOKEN_REVOCATION_ENDPOINT);
	}

	public String getTokenIntrospectionEndpoint() {
		return getSetting(ConfigurationSettingNames.AuthorizationServer.TOKEN_INTROSPECTION_ENDPOINT);
	}

	public String getOidcClientRegistrationEndpoint() {
		return getSetting(ConfigurationSettingNames.AuthorizationServer.OIDC_CLIENT_REGISTRATION_ENDPOINT);
	}
	public String getOidcUserInfoEndpoint() {
		return getSetting(ConfigurationSettingNames.AuthorizationServer.OIDC_USER_INFO_ENDPOINT);
	}
	public static Builder builder() {
		return new Builder()
				.authorizationEndpoint("/oauth2/authorize")
				.tokenEndpoint("/oauth2/token")
				.jwkSetEndpoint("/oauth2/jwks")
				.tokenRevocationEndpoint("/oauth2/revoke")
				.tokenIntrospectionEndpoint("/oauth2/introspect")
				.oidcClientRegistrationEndpoint("/connect/register")
				.oidcUserInfoEndpoint("/userinfo");
	}
```

> AuthorizationServerContextFilter

AuthorizationServerContext을 처리하는 filter로 AuthorizationServerContext을 생성해서 AuthoriationServerContextHolder에 저장하여 Spring application 전반에 걸쳐 사용될 수 있도록 한다.

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

    try {
        AuthorizationServerContext authorizationServerContext =
                new DefaultAuthorizationServerContext(
                        () -> resolveIssuer(this.authorizationServerSettings, request),
                        this.authorizationServerSettings);
        AuthorizationServerContextHolder.setContext(authorizationServerContext);
        filterChain.doFilter(request, response);
    } finally {
        AuthorizationServerContextHolder.resetContext();
    }
}
```

### RegisteredClient

> RegisteredClient

RegisteredClient 클래스는 인가 서버에 등록된 클라이언트에 대한 메타정보를 포함하는 클래스이다. 아래와 같이 clientId, clientSecret, authorizationGrantType 등 client에 관한 다양한 정보를 포함하고 있다.

```java
public class RegisteredClient implements Serializable {
	private static final long serialVersionUID = SpringAuthorizationServerVersion.SERIAL_VERSION_UID;
	private String id;
	private String clientId;
	private Instant clientIdIssuedAt;
	private String clientSecret;
	private Instant clientSecretExpiresAt;
	private String clientName;
	private Set<ClientAuthenticationMethod> clientAuthenticationMethods;
	private Set<AuthorizationGrantType> authorizationGrantTypes;
	private Set<String> redirectUris;
	private Set<String> scopes;
	private ClientSettings clientSettings;
	private TokenSettings tokenSettings;
}
```

> RegisteredClientRepository

Authorization Server에는 여러 client들이 등록되는데, InMemory 방식 혹은 JDBC 방식을 활용하여 registeredclient을 저장할 수 있다. 

```java
//InMemoryRegisteredClientRepository
public final class InMemoryRegisteredClientRepository implements RegisteredClientRepository {
	private final Map<String, RegisteredClient> idRegistrationMap;
	private final Map<String, RegisteredClient> clientIdRegistrationMap;
    ...
}

//JdbcRegisteredClientRepository
public class JdbcRegisteredClientRepository implements RegisteredClientRepository {

	// @formatter:off
	private static final String COLUMN_NAMES = "id, "
			+ "client_id, "
			+ "client_id_issued_at, "
			+ "client_secret, "
			+ "client_secret_expires_at, "
			+ "client_name, "
			+ "client_authentication_methods, "
			+ "authorization_grant_types, "
			+ "redirect_uris, "
			+ "scopes, "
			+ "client_settings,"
			+ "token_settings";
	// @formatter:on

	private static final String TABLE_NAME = "oauth2_registered_client";

	private static final String PK_FILTER = "id = ?";

	private static final String LOAD_REGISTERED_CLIENT_SQL = "SELECT " + COLUMN_NAMES + " FROM " + TABLE_NAME + " WHERE ";

	// @formatter:off
	private static final String INSERT_REGISTERED_CLIENT_SQL = "INSERT INTO " + TABLE_NAME
			+ "(" + COLUMN_NAMES + ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
	// @formatter:on

	// @formatter:off
	private static final String UPDATE_REGISTERED_CLIENT_SQL = "UPDATE " + TABLE_NAME
			+ " SET client_name = ?, client_authentication_methods = ?, authorization_grant_types = ?,"
			+ " redirect_uris = ?, scopes = ?, client_settings = ?, token_settings = ?"
			+ " WHERE " + PK_FILTER;
	// @formatter:on

	private static final String COUNT_REGISTERED_CLIENT_SQL = "SELECT COUNT(*) FROM " + TABLE_NAME + " WHERE ";

	private final JdbcOperations jdbcOperations;
	private RowMapper<RegisteredClient> registeredClientRowMapper;
	private Function<RegisteredClient, List<SqlParameterValue>> registeredClientParametersMapper;
    ...
}

```

위의 RegisteredClient을 조회해보면 아래와 같이 client의 정보를 포함하고 있는 것을 확인할 수 있다.

```json
{
    "id": "778a4813-078a-4091-ac33-408a8dad3316",
    "clientId": "oauth2-client-app1",
    "clientIdIssuedAt": null,
    "clientSecret": "{noop}secret1",
    "clientSecretExpiresAt": "+1000000000-12-31T23:59:59.999999999Z",
    "clientName": "oauth2-client-app1",
    "clientAuthenticationMethods": [
        {
            "value": "none"
        },
        {
            "value": "client_secret_basic"
        }
    ],
    "authorizationGrantTypes": [
        {
            "value": "refresh_token"
        },
        {
            "value": "client_credentials"
        },
        {
            "value": "authorization_code"
        }
    ],
    "redirectUris": [
        "http://127.0.0.1:8081"
    ],
    "scopes": [
        "read",
        "openid",
        "profile",
        "write",
        "email"
    ],
    "clientSettings": {
        "settings": {
            "settings.client.require-proof-key": false,
            "settings.client.require-authorization-consent": true
        },
        "tokenEndpointAuthenticationSigningAlgorithm": null,
        "jwkSetUrl": null,
        "requireProofKey": false,
        "requireAuthorizationConsent": true
    },
    "tokenSettings": {
        "settings": {
            "settings.token.reuse-refresh-tokens": true,
            "settings.token.id-token-signature-algorithm": "RS256",
            "settings.token.access-token-time-to-live": "PT5M",
            "settings.token.access-token-format": {
                "value": "self-contained"
            },
            "settings.token.refresh-token-time-to-live": "PT1H",
            "settings.token.authorization-code-time-to-live": "PT5M"
        },
        "idTokenSignatureAlgorithm": "RS256",
        "authorizationCodeTimeToLive": "PT5M",
        "accessTokenFormat": {
            "value": "self-contained"
        },
        "accessTokenTimeToLive": "PT5M",
        "refreshTokenTimeToLive": "PT1H",
        "reuseRefreshTokens": true
    }
}
```

### OAuth2Authorization

OAuth2Authorization은 OAuth2AuthorizedClient 처럼 해당 사용자에 대한 access token, refresh token과 같이 인가 상태를 유지하기 위한 객체이다. 

```java
public class OAuth2Authorization implements Serializable {
	private static final long serialVersionUID = SpringAuthorizationServerVersion.SERIAL_VERSION_UID;
	private String id;
	private String registeredClientId;
	private String principalName;
	private AuthorizationGrantType authorizationGrantType;
	private Set<String> authorizedScopes;
	private Map<Class<? extends OAuth2Token>, Token<?>> tokens;
	private Map<String, Object> attributes;
}
```

권한 부여 방식, scope에 따라 저장되는 정보가 상이하다.

1. Authorization Code 방식의 경우, Authorization Code, Access Token, Refresh Token이 저장된다.
2. Client Credentials의 경우 Access Token
3. OIDC 방식의 경우 Authorization Code, Access Token, Refresh Token, ID Token이 저장된다.

이러한 OAuth2Authorization은 OAuth2AuthorizationService에 의해 관리되는데, In-Memory, JDBC type이 존재하는데, 무수히 많은 사용자가 발생할 수 있기 때문에, In-Memory 방식은 개발환경에서는 활용하는 것이 좋다.

> OAuth2AuthorizationService

```java
//InMemoryOAuth2AuthorizationService
public final class InMemoryOAuth2AuthorizationService implements OAuth2AuthorizationService {
	private int maxInitializedAuthorizations = 100;
	private Map<String, OAuth2Authorization> initializedAuthorizations =
			Collections.synchronizedMap(new MaxSizeHashMap<>(this.maxInitializedAuthorizations));

	private final Map<String, OAuth2Authorization> authorizations = new ConcurrentHashMap<>();
    ...
}


//JdbcOAuth2AuthorizationService
public class JdbcOAuth2AuthorizationService implements OAuth2AuthorizationService {

	// @formatter:off
	private static final String COLUMN_NAMES = "id, "
			+ "registered_client_id, "
			+ "principal_name, "
			+ "authorization_grant_type, "
			+ "authorized_scopes, "
			+ "attributes, "
			+ "state, "
			+ "authorization_code_value, "
			+ "authorization_code_issued_at, "
			+ "authorization_code_expires_at,"
			+ "authorization_code_metadata,"
			+ "access_token_value,"
			+ "access_token_issued_at,"
			+ "access_token_expires_at,"
			+ "access_token_metadata,"
			+ "access_token_type,"
			+ "access_token_scopes,"
			+ "oidc_id_token_value,"
			+ "oidc_id_token_issued_at,"
			+ "oidc_id_token_expires_at,"
			+ "oidc_id_token_metadata,"
			+ "refresh_token_value,"
			+ "refresh_token_issued_at,"
			+ "refresh_token_expires_at,"
			+ "refresh_token_metadata";
	// @formatter:on

	private static final String TABLE_NAME = "oauth2_authorization";

	private static final String PK_FILTER = "id = ?";
	private static final String UNKNOWN_TOKEN_TYPE_FILTER = "state = ? OR authorization_code_value = ? OR " +
			"access_token_value = ? OR refresh_token_value = ?";

	private static final String STATE_FILTER = "state = ?";
	private static final String AUTHORIZATION_CODE_FILTER = "authorization_code_value = ?";
	private static final String ACCESS_TOKEN_FILTER = "access_token_value = ?";
	private static final String REFRESH_TOKEN_FILTER = "refresh_token_value = ?";

	// @formatter:off
	private static final String LOAD_AUTHORIZATION_SQL = "SELECT " + COLUMN_NAMES
			+ " FROM " + TABLE_NAME
			+ " WHERE ";
	// @formatter:on

	// @formatter:off
	private static final String SAVE_AUTHORIZATION_SQL = "INSERT INTO " + TABLE_NAME
			+ " (" + COLUMN_NAMES + ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
	// @formatter:on

	// @formatter:off
	private static final String UPDATE_AUTHORIZATION_SQL = "UPDATE " + TABLE_NAME
			+ " SET registered_client_id = ?, principal_name = ?, authorization_grant_type = ?, authorized_scopes = ?, attributes = ?, state = ?,"
			+ " authorization_code_value = ?, authorization_code_issued_at = ?, authorization_code_expires_at = ?, authorization_code_metadata = ?,"
			+ " access_token_value = ?, access_token_issued_at = ?, access_token_expires_at = ?, access_token_metadata = ?, access_token_type = ?, access_token_scopes = ?,"
			+ " oidc_id_token_value = ?, oidc_id_token_issued_at = ?, oidc_id_token_expires_at = ?, oidc_id_token_metadata = ?,"
			+ " refresh_token_value = ?, refresh_token_issued_at = ?, refresh_token_expires_at = ?, refresh_token_metadata = ?"
			+ " WHERE " + PK_FILTER;
	// @formatter:on

	private static final String REMOVE_AUTHORIZATION_SQL = "DELETE FROM " + TABLE_NAME + " WHERE " + PK_FILTER;

	private static Map<String, ColumnMetadata> columnMetadataMap;

	private final JdbcOperations jdbcOperations;
	private final LobHandler lobHandler;
	private RowMapper<OAuth2Authorization> authorizationRowMapper;
	private Function<OAuth2Authorization, List<SqlParameterValue>> authorizationParametersMapper;
    ...
}
```

OIDC + Authorization Code 방식을 통한 인증 과정의 경우 아래와 같이 저장되는 것을 확인할 수 있다.

![oauth2_authorization](/assets/images/jsf/Spring_Security/oauth2/oauth2authorization.png)

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



