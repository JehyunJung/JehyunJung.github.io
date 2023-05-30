---
title: "Spring Security Oauth2 Part 4"
excerpt: "Open Id Connect & Oauth2 Client"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# Open Id Connect & Oauth2 Client

## Open Id Connect

scope에 openid를 추가해주게 되면 JWT 기반의 ID token이 발급되어, 해당 token을 활용하여 인증을 수행하는 것이 가능하다. 즉 인증을 위한 ID token 과 인가를 위한 Access Token이 발급되는 것이다.

### Id Token

JWT 기반의 Token으로 내부에 사용자의 정보(이름, 이메일, 등)를 포함하고 있다.  

![id_connect_vs_access_token](/assets/images/jsf/Spring_Security/oauth2/id_connect_vs_access_token.png)

이와 같이 open id 기반의 인증방식을 위해 ID Token을 제공하는 주체를 바로 OpenId Provider이라고 한다. 

> id token 요청과정

아래의 매개변수들이 활용된다.

|parameter|value|
|--|--|
|response_type|id_token|
|redirect_uri||
|scope|openid|
|nonce||

scope에는 openid, response_type에는 id_token을 반드시 포함시켜줘야 하며 nonce 값을 추가해야한다. nonce는 code-challenge 개념으로 서버와 클라이언트 요청에 있어 정상적인인 서버의 요청임을 확인한다.

```
http://localhost:8080/realms/oauth2/protocol/openid-connect/auth?response_type=id_token&client_id=oauth2-client-app&scope=openid profile email&redirect_uri=http://localhost:8081&nonce=12345

//result
http://localhost:8081/#session_state=72437ad4-4fa7-4fda-9193-0ced82d28ebd&id_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODA0ODY1MjgsImlhdCI6MTY4MDQ4NTYyOCwiYXV0aF90aW1lIjoxNjgwNDg1NjI4LCJqdGkiOiI4OWI4ZGY5Mi03M2Y0LTQ4NWItODhmNS05ZmEwYjc4ZGNhNzMiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsImF1ZCI6Im9hdXRoMi1jbGllbnQtYXBwIiwic3ViIjoiOWJmOTIwNGItZjBiZS00NzkyLThjOWQtMWU1ODQyNGZmMWIyIiwidHlwIjoiSUQiLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsIm5vbmNlIjoiMTIzNDUiLCJzZXNzaW9uX3N0YXRlIjoiNzI0MzdhZDQtNGZhNy00ZmRhLTkxOTMtMGNlZDgyZDI4ZWJkIiwiYWNyIjoiMSIsInNpZCI6IjcyNDM3YWQ0LTRmYTctNGZkYS05MTkzLTBjZWQ4MmQyOGViZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkplaHl1biBKdW5nIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlciIsImdpdmVuX25hbWUiOiJKZWh5dW4iLCJmYW1pbHlfbmFtZSI6Ikp1bmciLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIn0.ipoorPbMZgChoeadmlwpjtFfMBGe4h54rq9H_lM-CEIpQ5zSHbsbFoguvQb6_n1P3SUcG0g5oheevOR3CTTYuHvED-PiDYPd-8kDkxnAQWOXUMQljLzfxr8e2lB4kDfZBMcfCgsZq5rgOnHdi_OMPAu2PCztASC-JXCuJwwtaXFnCyXb-wEJv7kVfNd8JQuiArqto-tNrq7Aj3wxJjfqUtVdXFllAewTyKK5onf3xdl9lORiVov1-23NM0FaLavH47YYv3DKaO4Cxc0AJLMRepNAziUAbhjGtC0509MIdEZa79NfCNeQwpT9XVK7-PYOBrlsw77ZF0c3CszYNirLtw
```

위의 jwt token을 decoding 해보면 아래와 같이 유저의 정보를 포함하고 있는 것을 확인할 수 있다. 이후, 이 id_token을 기반으로 oauth2 기반의 인증을 수행할 수 있다.

```json
{
  "exp": 1680486528,
  "iat": 1680485628,
  "auth_time": 1680485628,
  "jti": "89b8df92-73f4-485b-88f5-9fa0b78dca73",
  "iss": "http://localhost:8080/realms/oauth2",
  "aud": "oauth2-client-app",
  "sub": "9bf9204b-f0be-4792-8c9d-1e58424ff1b2",
  "typ": "ID",
  "azp": "oauth2-client-app",
  "nonce": "12345",
  "session_state": "72437ad4-4fa7-4fda-9193-0ced82d28ebd",
  "acr": "1",
  "sid": "72437ad4-4fa7-4fda-9193-0ced82d28ebd",
  "email_verified": false,
  "name": "Jehyun Jung",
  "preferred_username": "user",
  "given_name": "Jehyun",
  "family_name": "Jung",
  "email": "user@email.com"
}
```

## Oauth2 Client

Oauth2 Authorization Framework의 일환으로 필터 기반으로 oauth2 인증을 수행할 수 있도록 지원한다. 해당 모듈의 추가로 간단한 설정을 통해 oauth2을 활용한 인증이 가능하다. default으로 authorization code 방식의 권한 부여를 통해 인증을 수행한다. 

> build.gradle
```java
//spring oauth2 client
implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
```

### Client Properties

Oauth2 Client 내부에는 Oauth2ClientProperties 객체가 포함되어 있는데 해당 객체에는 OpenID Provider와 Client에 대한 메타 정보를 포함하고 있다. application.yaml에 설정한 openId 정보를 토대로 Oauth2ClientProperties가 맵핑된다.

이후, ClientProperties 객체에 저장되어 있는 메타정보를 토대로 oauth2 인증이 수행된다.

> Oauth2ClientProperties

Oauth2ClientProperties을 확인해보면 Provider,Registration 객체가 포함된 것을 확인할 수 있다. 이는 각각 OpenId Provider에 대한 정보, Registration(클라이언트에 대한 정보)를 포함하고 있는 것이다.

```java
@ConfigurationProperties(prefix = "spring.security.oauth2.client")
public class OAuth2ClientProperties implements InitializingBean {

	/**
	 * OAuth provider details.
	 */
	private final Map<String, Provider> provider = new HashMap<>();

	/**
	 * OAuth client registrations.
	 */
	private final Map<String, Registration> registration = new HashMap<>();
 
    ...
}
```

> Provider

Provider 객체에는 OpenID Provider에 대한 각종 end-point가 저장되게 된다.

|parameter|description|
|--|--|
|authorizationUri|권한 코드를 요청을 위한 uri|
|issuerUri|openid provider의 base uri|
|jwkSetUri|JWK(Json Web Key)을 요청하는 uri로, private key로 서명된 access token을 검증하기 위해 public key을 요청한다.|
|authorizationUri|access token에 |
|tokenUri|access token 요청을 위한 uri|
|userInfoUri|유저 정보를 요청하기 위한 uri|
|userNameAttribute|openid provider에 설정된 유저의 속성|

```java
public static class Provider {

    /**
     * Authorization URI for the provider.
     */
    private String authorizationUri;

    /**
     * Token URI for the provider.
     */
    private String tokenUri;

    /**
     * User info URI for the provider.
     */
    private String userInfoUri;

    /**
     * User info authentication method for the provider.
     */
    private String userInfoAuthenticationMethod;

    /**
     * Name of the attribute that will be used to extract the username from the call
     * to 'userInfoUri'.
     */
    private String userNameAttribute;

    /**
     * JWK set URI for the provider.
     */
    private String jwkSetUri;
    ...
}
```

> Registration

Registration에는 client에 대한 정보가 포한되어 있다.

|parameter|description|
|provider|provider 이름|
|clientId|클라이언트 id|
|clientSecret|클라이언트 비밀키|
|clientAuthenticationMethod|provider에서 client 검증을 진행하는 방식을 의미하며, basic, post, none의 값을 설정할 수 있다.|
|authorizationGrantType|권한 부여 방식 지정|
|redirect-uri|리다이렉트 uri 지정|
|scope|자원 범위 지정|

```java
public static class Registration {
    /**
     * Reference to the OAuth 2.0 provider to use. May reference an element from the
     * 'provider' property or used one of the commonly used providers (google, github,
     * facebook, okta).
     */
    private String provider;

    /**
     * Client ID for the registration.
     */
    private String clientId;

    /**
     * Client secret of the registration.
     */
    private String clientSecret;

    /**
     * Client authentication method. May be left blank when using a pre-defined
     * provider.
     */
    private String clientAuthenticationMethod;

    /**
     * Authorization grant type. May be left blank when using a pre-defined provider.
     */
    private String authorizationGrantType;

    /**
     * Redirect URI. May be left blank when using a pre-defined provider.
     */
    private String redirectUri;

    /**
     * Authorization scopes. When left blank the provider's default scopes, if any,
     * will be used.
     */
    private Set<String> scope;

    ...
}
```

위와 같이 Oauth2ClientProperties 객체가 초기화되게 되면 ClientRegistration 객체에 해당 값들을 매핑하여 Oauth2Client에 포함시킨다.

### ClientRegistration

OAuth2 Client에 저장되어 각종 메타데이터를 포함하고 있다. 이후에 Spring framework 내부에서 client에 대한 정보가 필요할때 ClientRegistration 객체를 활용하여 접근하는 것이 가능하다.

#### Common OpenId Provider

Google, Facebook, Github 등과 널리 알려진 provider의 경우 아래와 같이 기본으로 설정되어 있어, registrationId 설정만으로 쉽게 setting이 가능하다.

```java
public enum CommonOAuth2Provider {

	GOOGLE {

		@Override
		public Builder getBuilder(String registrationId) {
			ClientRegistration.Builder builder = getBuilder(registrationId,
					ClientAuthenticationMethod.CLIENT_SECRET_BASIC, DEFAULT_REDIRECT_URL);
			builder.scope("openid", "profile", "email");
			builder.authorizationUri("https://accounts.google.com/o/oauth2/v2/auth");
			builder.tokenUri("https://www.googleapis.com/oauth2/v4/token");
			builder.jwkSetUri("https://www.googleapis.com/oauth2/v3/certs");
			builder.issuerUri("https://accounts.google.com");
			builder.userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo");
			builder.userNameAttributeName(IdTokenClaimNames.SUB);
			builder.clientName("Google");
			return builder;
		}

	},

	GITHUB {

		@Override
		public Builder getBuilder(String registrationId) {
			ClientRegistration.Builder builder = getBuilder(registrationId,
					ClientAuthenticationMethod.CLIENT_SECRET_BASIC, DEFAULT_REDIRECT_URL);
			builder.scope("read:user");
			builder.authorizationUri("https://github.com/login/oauth/authorize");
			builder.tokenUri("https://github.com/login/oauth/access_token");
			builder.userInfoUri("https://api.github.com/user");
			builder.userNameAttributeName("id");
			builder.clientName("GitHub");
			return builder;
		}

	},

	FACEBOOK {

		@Override
		public Builder getBuilder(String registrationId) {
			ClientRegistration.Builder builder = getBuilder(registrationId,
					ClientAuthenticationMethod.CLIENT_SECRET_POST, DEFAULT_REDIRECT_URL);
			builder.scope("public_profile", "email");
			builder.authorizationUri("https://www.facebook.com/v2.8/dialog/oauth");
			builder.tokenUri("https://graph.facebook.com/v2.8/oauth/access_token");
			builder.userInfoUri("https://graph.facebook.com/me?fields=id,name,email");
			builder.userNameAttributeName("id");
			builder.clientName("Facebook");
			return builder;
		}

	},

	OKTA {

		@Override
		public Builder getBuilder(String registrationId) {
			ClientRegistration.Builder builder = getBuilder(registrationId,
					ClientAuthenticationMethod.CLIENT_SECRET_BASIC, DEFAULT_REDIRECT_URL);
			builder.scope("openid", "profile", "email");
			builder.userNameAttributeName(IdTokenClaimNames.SUB);
			builder.clientName("Okta");
			return builder;
		}

	};

	private static final String DEFAULT_REDIRECT_URL = "{baseUrl}/{action}/oauth2/code/{registrationId}";

	protected final ClientRegistration.Builder getBuilder(String registrationId, ClientAuthenticationMethod method,
			String redirectUri) {
		ClientRegistration.Builder builder = ClientRegistration.withRegistrationId(registrationId);
		builder.clientAuthenticationMethod(method);
		builder.authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE);
		builder.redirectUri(redirectUri);
		return builder;
	}

	/**
	 * Create a new
	 * {@link org.springframework.security.oauth2.client.registration.ClientRegistration.Builder
	 * ClientRegistration.Builder} pre-configured with provider defaults.
	 * @param registrationId the registration-id used with the new builder
	 * @return a builder instance
	 */
	public abstract ClientRegistration.Builder getBuilder(String registrationId);

}

```

#### ClientRegistration 초기화 과정

> 1. Oauth2ClientRegistrationRepositoryConfiguration

ClientRegistrationRepository Bean 객체가 없는 경우 실행된다.

```java
@Bean
@ConditionalOnMissingBean(ClientRegistrationRepository.class)
InMemoryClientRegistrationRepository clientRegistrationRepository(OAuth2ClientProperties properties) {
    List<ClientRegistration> registrations = new ArrayList<>(
            OAuth2ClientPropertiesRegistrationAdapter.getClientRegistrations(properties).values());
    return new InMemoryClientRegistrationRepository(registrations);
}
```

> 2. OAuth2ClientPropertiesRegistrationAdapter의 getClientRegistrations() 메소드 호출

```java
public static Map<String, ClientRegistration> getClientRegistrations(OAuth2ClientProperties properties) {
    Map<String, ClientRegistration> clientRegistrations = new HashMap<>();
    properties.getRegistration()
        .forEach((key, value) -> clientRegistrations.put(key,
                getClientRegistration(key, value, properties.getProvider())));
    return clientRegistrations;
}

private static ClientRegistration getClientRegistration(String registrationId,
        OAuth2ClientProperties.Registration properties, Map<String, Provider> providers) {
    Builder builder = getBuilderFromIssuerIfPossible(registrationId, properties.getProvider(), providers);
    if (builder == null) {
        builder = getBuilder(registrationId, properties.getProvider(), providers);
    }
    PropertyMapper map = PropertyMapper.get().alwaysApplyingWhenNonNull();
    map.from(properties::getClientId).to(builder::clientId);
    map.from(properties::getClientSecret).to(builder::clientSecret);
    map.from(properties::getClientAuthenticationMethod)
        .as(ClientAuthenticationMethod::new)
        .to(builder::clientAuthenticationMethod);
    map.from(properties::getAuthorizationGrantType)
        .as(AuthorizationGrantType::new)
        .to(builder::authorizationGrantType);
    map.from(properties::getRedirectUri).to(builder::redirectUri);
    map.from(properties::getScope).as(StringUtils::toStringArray).to(builder::scope);
    map.from(properties::getClientName).to(builder::clientName);
    return builder.build();
}
```

> 3. getBuilderFromIssuerIfPossible() 요청을 통해 각종 메타데이터 정보 추출

등록한 issueruri을 활용하여 end-point에 대한 정보를 저장되어 있는 url에 각종 정보를 요청한다.

oidc: {issuerUri}/.well-known/openid-configuration

auth: {issuerUri}/.well-known/oauth-authorization-server

와 같이 uri를 생성하여 해당 uri로의 요청을 통해 메타 데이터를 추출한다.

keycloak의 경우 oidc uri를 통해 요청을 수행하면 아래와 같이 메타 데이터들이 있는 것을 확인할 수 있다.

```json
{
"issuer": "http://localhost:8080/realms/oauth2",
"authorization_endpoint": "http://localhost:8080/realms/oauth2/protocol/openid-connect/auth",
"token_endpoint": "http://localhost:8080/realms/oauth2/protocol/openid-connect/token",
"introspection_endpoint": "http://localhost:8080/realms/oauth2/protocol/openid-connect/token/introspect",
"userinfo_endpoint": "http://localhost:8080/realms/oauth2/protocol/openid-connect/userinfo",
"end_session_endpoint": "http://localhost:8080/realms/oauth2/protocol/openid-connect/logout",
"frontchannel_logout_session_supported": true,
"frontchannel_logout_supported": true,
"jwks_uri": "http://localhost:8080/realms/oauth2/protocol/openid-connect/certs",
"check_session_iframe": "http://localhost:8080/realms/oauth2/protocol/openid-connect/login-status-iframe.html",
"grant_types_supported": [
"authorization_code",
"implicit",
"refresh_token",
"password",
"client_credentials",
"urn:ietf:params:oauth:grant-type:device_code",
"urn:openid:params:grant-type:ciba"
],
 ...
}
```

```java
private static Builder getBuilderFromIssuerIfPossible(String registrationId, String configuredProviderId,
        Map<String, Provider> providers) {
    String providerId = (configuredProviderId != null) ? configuredProviderId : registrationId;
    if (providers.containsKey(providerId)) {
        Provider provider = providers.get(providerId);
        String issuer = provider.getIssuerUri();
        if (issuer != null) {
            Builder builder = ClientRegistrations.fromIssuerLocation(issuer).registrationId(registrationId);
            return getBuilder(builder, provider);
        }
    }
    return null;
}
public static ClientRegistration.Builder fromIssuerLocation(String issuer) {
    Assert.hasText(issuer, "issuer cannot be empty");
    URI uri = URI.create(issuer);
    return getBuilder(issuer, oidc(uri), oidcRfc8414(uri), oauth(uri));
}
```

위와 같이 uri을 기반으로 builder 클래스를 생성하게 되면 이를 활용하여 ClientRegistration 값을 매핑한다.

![clientRegistration](/assets/images/jsf/Spring_Security/oauth2/client_registration.png)

> ClientRegistrationRepository

이후, ClientRegistration은 ClientRegistrationRepository에 Bean 객체로 저장되어 Spring에서 DI를 통해 어디서든지 참조가 가능하다. 이러한 ClientRegistrationRepository는 수동으로 등록하는 것도 가능하다.

```java
@Configuration
public class Oauth2ClientConfig {
    @Bean
    public ClientRegistrationRepository clientRegistrationRepository(){
        return new InMemoryClientRegistrationRepository(keycloakClientRegistration());
    }

    private ClientRegistration keycloakClientRegistration(){
        return ClientRegistrations.fromIssuerLocation("http://localhost:8080/realms/oauth2")
                .registrationId("keycloak")
                .clientId("oauth2-client-app")
                .clientSecret("mRd6pSwgCVEcC6TwMdiEVXVga85rLEcd")
                .redirectUri("http://localhost:8081/login/oauth2/code/keycloak")
                .build();
    }
}
```

### Oauth2 Auto Configuration

#### Oauth2ImportSelector

![oauth2-autoconfiguration1](/assets/images/jsf/Spring_Security/oauth2/oauth2_autoconfiguration1.png)

1. Oauth2ImportSelector을 통해 필요한 class을 loading한다.
2. 이후 OAuth2ClientConfiguration -> Oauth2ClientWebMvcImportSelector -> Oauth2ClientWebMvcSecurityConfiguration을 호출한다.

Oauth2ClientWebMvcSecurityConfiguration 내부에서 크게 2가지 작업을 수행한다.

> OAuth2AuthorizedClientManager

oauth2 기반의 인증을 수행할 수 있는 ClientManager 객체를 생성한다.

```java
private OAuth2AuthorizedClientManager getAuthorizedClientManager() {
    if (this.authorizedClientManager != null) {
        return this.authorizedClientManager;
    }
    OAuth2AuthorizedClientManager authorizedClientManager = null;
    if (this.clientRegistrationRepository != null && this.authorizedClientRepository != null) {
        if (this.accessTokenResponseClient != null) {
            // @formatter:off
            OAuth2AuthorizedClientProvider authorizedClientProvider = OAuth2AuthorizedClientProviderBuilder
                .builder()
                .authorizationCode()
                .refreshToken()
                .clientCredentials((configurer) -> configurer.accessTokenResponseClient(this.accessTokenResponseClient))
                .password()
                .build();
            // @formatter:on
            DefaultOAuth2AuthorizedClientManager defaultAuthorizedClientManager = new DefaultOAuth2AuthorizedClientManager(
                    this.clientRegistrationRepository, this.authorizedClientRepository);
            defaultAuthorizedClientManager.setAuthorizedClientProvider(authorizedClientProvider);
            authorizedClientManager = defaultAuthorizedClientManager;
        }
        else {
            authorizedClientManager = new DefaultOAuth2AuthorizedClientManager(
                    this.clientRegistrationRepository, this.authorizedClientRepository);
        }
    }
    return authorizedClientManager;
}
```

> Argument Resolver 등록

```java
if (authorizedClientManager != null) {
    OAuth2AuthorizedClientArgumentResolver resolver = new OAuth2AuthorizedClientArgumentResolver(
            authorizedClientManager);
    if (this.securityContextHolderStrategy != null) {
        resolver.setSecurityContextHolderStrategy(this.securityContextHolderStrategy);
    }
    argumentResolvers.add(resolver);
}
```

#### Oauth2ClientAutoConfiguration

AutoConfiguration에서는 Oauth2Client에 대한 초기화 과정이 이루어진다.

```java
@AutoConfiguration(before = SecurityAutoConfiguration.class)
@ConditionalOnClass({ EnableWebSecurity.class, ClientRegistration.class })
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Import({ OAuth2ClientRegistrationRepositoryConfiguration.class, OAuth2WebSecurityConfiguration.class })
public class OAuth2ClientAutoConfiguration {

}
```

1. OAuth2ClientRegistrationRepositoryConfiguration 에서는 위에서 다룬 ClientRegistration을 초기화하는 과정을 진행한다

2. OAuth2WebSecurityConfiguration에서는 아래의 과정이 이루어진다.

> OAuth2AuthorizedClientService 와 OAuth2AuthorizedClientRepository 
인증된 Oauth2Client를 관리하는 객체로, 인증이 완료된 사용자의 정보를 저장하고 있어, 인증 과정에서 해당 클래스들을 활용한다.

```java

public class OAuth2AuthorizedClient implements Serializable {

	private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

	private final ClientRegistration clientRegistration;

	private final String principalName;

	private final OAuth2AccessToken accessToken;

	private final OAuth2RefreshToken refreshToken;
    ...

}

@Configuration(proxyBeanMethods = false)
@ConditionalOnBean(ClientRegistrationRepository.class)
class OAuth2WebSecurityConfiguration {

	@Bean
	@ConditionalOnMissingBean
	OAuth2AuthorizedClientService authorizedClientService(ClientRegistrationRepository clientRegistrationRepository) {
		return new InMemoryOAuth2AuthorizedClientService(clientRegistrationRepository);
	}

	@Bean
	@ConditionalOnMissingBean
	OAuth2AuthorizedClientRepository authorizedClientRepository(OAuth2AuthorizedClientService authorizedClientService) {
		return new AuthenticatedPrincipalOAuth2AuthorizedClientRepository(authorizedClientService);
	}
```

> Oauth2SecurityFilterChain

Oauth2SecurityFilterChain의 경우, oauth2 기반의 인증을 수행하도록 SecurityFilterChain을 생성하는 작업을 진행한다.


```java
	@Configuration(proxyBeanMethods = false)
	@ConditionalOnDefaultWebSecurity
	static class OAuth2SecurityFilterChainConfiguration {

		@Bean
		SecurityFilterChain oauth2SecurityFilterChain(HttpSecurity http) throws Exception {
			http.authorizeHttpRequests((requests) -> requests.anyRequest().authenticated());
			http.oauth2Login(Customizer.withDefaults());
			http.oauth2Client();
			return http.build();
		}

	}

}
```

![oauth2_securityfilterchain](/assets/images/jsf/Spring_Security/oauth2/oauth2_securityfilterchain.png)


#### AuthenticationEntryPoint 등록

OAuth2 방식의 경우에도 마찬가지로 인증에 실패하였을 때, login page로 redirect하는 과정이 필요하다

```java
@Override
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
            //AuthenticationEntryPoint 등록 과정
            this.registerAuthenticationEntryPoint(http, this.getLoginEntryPoint(http, providerLoginPage));
        }
        else {
            super.init(http);
        }
        ...
    }
}

protected final void registerAuthenticationEntryPoint(B http, AuthenticationEntryPoint authenticationEntryPoint) {
    ExceptionHandlingConfigurer<B> exceptionHandling = http.getConfigurer(ExceptionHandlingConfigurer.class);
    if (exceptionHandling == null) {
        return;
    }
    exceptionHandling.defaultAuthenticationEntryPointFor(postProcess(authenticationEntryPoint),
            getAuthenticationEntryPointMatcher(http));
}
```








## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



