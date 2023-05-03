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

## OAuth2AuthorizationServerConfigurer

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

## AuthorizationServerContext

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


## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



