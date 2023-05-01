---
title: "Spring Security Oauth2 Part 10"
excerpt: "Opaque Token"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# Opaque Token

## Description

Opaque Token 또한, Oauth2 기반의 token이며, Jwt와 비교되는 두 가지 특징이 있다.

- Opaque Token은 자체 검증이 불가능하며 Authorization Server의 Introspection 엔드포인트를 통해 토큰 검증을 수행한다.

- Jwt Token의 경우, Resource 접근 과정에서 토큰의 활성화 여부를 판별할 수 있었지만, Opaque Token은 내부에 active property를 포함하고 있어 토큰의 활성화 여부를 실시간으로 확인하는 것이 가능하다.


## Config

Opaque Token을 활용하기 위해 설정을 추가한다.

> build.gradle

```java
runtimeOnly 'com.nimbusds:oauth2-oidc-sdk:10.8'
```

> application.yml

```yml
spring:
  security:
    oauth2:
      resourceserver:
        opaquetoken:
          introspection-uri: http://localhost:8080/realms/oauth2/protocol/openid-connect/token/introspect
          client-id: oauth2-client-app
          client-secret: mRd6pSwgCVEcC6TwMdiEVXVga85rLEcd
```

> Security Config

```java
@Bean
public SecurityFilterChain config(HttpSecurity httpSecurity) throws Exception {
    httpSecurity
            .authorizeHttpRequests()
            .requestMatchers("/").permitAll()
            .anyRequest().authenticated();

    httpSecurity.oauth2ResourceServer(OAuth2ResourceServerConfigurer::opaqueToken);

    return httpSecurity.build();
}

//OpaqueTokenIntrospector 객체를 직접 bean으로 등록하게 되면 Spring에서는 OpaqueTokenIntrospector을 생성하는 작업이 생략된다.
@Bean
public OpaqueTokenIntrospector opaqueTokenIntrospector(OAuth2ResourceServerProperties oAuth2ResourceServerProperties) {
    OAuth2ResourceServerProperties.Opaquetoken opaquetoken = oAuth2ResourceServerProperties.getOpaquetoken();
    return new NimbusOpaqueTokenIntrospector(opaquetoken.getIntrospectionUri(),opaquetoken.getClientId(),opaquetoken.getClientSecret());
}
```

## OpaqueTokenIntrospector

![opaquetokenintrospector](/assets/images/jsf/Spring_Security/oauth2/opaquetokenintrospector.png)

application.yml에 필요한 Opaque Token 관련 설정을 처리하게 되면 Spring 내부에서 OAuth2ResourceServerOpaqueTokenConfiguration가 동작하여 Opaque Token을 검증하는 OpaqueTokenIntrospector 객체를 생성하게 된다.

> OAuth2ResourceServerOpaqueTokenConfiguration

```java
@Configuration(proxyBeanMethods = false)
class OAuth2ResourceServerOpaqueTokenConfiguration {

	@Configuration(proxyBeanMethods = false)
	@ConditionalOnMissingBean(OpaqueTokenIntrospector.class)
	static class OpaqueTokenIntrospectionClientConfiguration {

		@Bean
		@ConditionalOnProperty(name = "spring.security.oauth2.resourceserver.opaquetoken.introspection-uri")
		SpringOpaqueTokenIntrospector opaqueTokenIntrospector(OAuth2ResourceServerProperties properties) {
			OAuth2ResourceServerProperties.Opaquetoken opaqueToken = properties.getOpaquetoken();
			return new SpringOpaqueTokenIntrospector(opaqueToken.getIntrospectionUri(), opaqueToken.getClientId(),
					opaqueToken.getClientSecret());
		}

	}

	@Configuration(proxyBeanMethods = false)
	@ConditionalOnDefaultWebSecurity
	static class OAuth2SecurityFilterChainConfiguration {

		@Bean
		@ConditionalOnBean(OpaqueTokenIntrospector.class)
		SecurityFilterChain opaqueTokenSecurityFilterChain(HttpSecurity http) throws Exception {
			http.authorizeHttpRequests((requests) -> requests.anyRequest().authenticated());
			http.oauth2ResourceServer(OAuth2ResourceServerConfigurer::opaqueToken);
			return http.build();
		}

	}
}
```

> OpaqueTokenIntrospector

```java
@Override
public OAuth2AuthenticatedPrincipal introspect(String token) {
    RequestEntity<?> requestEntity = this.requestEntityConverter.convert(token);
    if (requestEntity == null) {
        throw new OAuth2IntrospectionException("requestEntityConverter returned a null entity");
    }
    ResponseEntity<String> responseEntity = makeRequest(requestEntity);
    HTTPResponse httpResponse = adaptToNimbusResponse(responseEntity);
    TokenIntrospectionResponse introspectionResponse = parseNimbusResponse(httpResponse);
    TokenIntrospectionSuccessResponse introspectionSuccessResponse = castToNimbusSuccess(introspectionResponse);
    // relying solely on the authorization server to validate this token (not checking
    // 'exp', for example)
    if (!introspectionSuccessResponse.isActive()) {
        this.logger.trace("Did not validate token since it is inactive");
        throw new BadOpaqueTokenException("Provided token isn't active");
    }
    return convertClaimsSet(introspectionSuccessResponse);
}
```

introspector는 RestTemplate을 활용하여 introspection endpoint으로 검증 요청을 보내게 되고, 검증이 완료되면 OAuth2AuthenticatedPrincipal을 반환하게 된다. 이는 BearerTokenAuthentication에 저장된다.

> Oauth2AuthenticatedPrincipal

```java
//Oauth2AuthenticatedPrincipal
public interface OAuth2AuthenticatedPrincipal extends AuthenticatedPrincipal {

	@Nullable
	@SuppressWarnings("unchecked")
	default <A> A getAttribute(String name) {
		return (A) getAttributes().get(name);
	}
	Map<String, Object> getAttributes();

	Collection<? extends GrantedAuthority> getAuthorities();

}
//OAuth2IntrospectionAuthenticatedPrincipal
public final class OAuth2IntrospectionAuthenticatedPrincipal implements OAuth2TokenIntrospectionClaimAccessor, OAuth2AuthenticatedPrincipal, Serializable {
	private final OAuth2AuthenticatedPrincipal delegate;

	public OAuth2IntrospectionAuthenticatedPrincipal(Map<String, Object> attributes,
			Collection<GrantedAuthority> authorities) {
		this.delegate = new DefaultOAuth2AuthenticatedPrincipal(attributes, authorities);
	}

	public OAuth2IntrospectionAuthenticatedPrincipal(String name, Map<String, Object> attributes,
			Collection<GrantedAuthority> authorities) {
		this.delegate = new DefaultOAuth2AuthenticatedPrincipal(name, attributes, authorities);
    }
    ...
}   
//DefaultOAuth2AuthenticatedPrincipal 
public final class DefaultOAuth2AuthenticatedPrincipal implements OAuth2AuthenticatedPrincipal, Serializable {

	private final Map<String, Object> attributes;

	private final Collection<GrantedAuthority> authorities;

	private final String name;

	public DefaultOAuth2AuthenticatedPrincipal(Map<String, Object> attributes,
			Collection<GrantedAuthority> authorities) {
		this(null, attributes, authorities);
	}

	public DefaultOAuth2AuthenticatedPrincipal(String name, Map<String, Object> attributes,
			Collection<GrantedAuthority> authorities) {
		Assert.notEmpty(attributes, "attributes cannot be empty");
		this.attributes = Collections.unmodifiableMap(attributes);
		this.authorities = (authorities != null) ? Collections.unmodifiableCollection(authorities)
				: AuthorityUtils.NO_AUTHORITIES;
		this.name = (name != null) ? name : (String) this.attributes.get("sub");
	}
    ...
}
```

> CustomIntrospector

Introspector 또한, 커스텀하게 생성하는 것이 가능하다. 권한 설정 과정을 직접 구현하고자 하면 아래와 같이 커스텀한 introspector을 정의해서 해당 클래스 내부에서 검증이 이루어질 수 있도록 한다.

```java
public class CustomOpaqueTokenIntrospector implements OpaqueTokenIntrospector {

    private OAuth2ResourceServerProperties oAuth2ResourceServerProperties;

    private OpaqueTokenIntrospector delegate;

    public CustomOpaqueTokenIntrospector(OAuth2ResourceServerProperties oAuth2ResourceServerProperties) {
        this.oAuth2ResourceServerProperties = oAuth2ResourceServerProperties;
        this.delegate = new NimbusOpaqueTokenIntrospector(
                oAuth2ResourceServerProperties.getOpaquetoken().getIntrospectionUri(),
                oAuth2ResourceServerProperties.getOpaquetoken().getClientId(),
                oAuth2ResourceServerProperties.getOpaquetoken().getClientSecret()
        );

    }

    @Override
    public OAuth2AuthenticatedPrincipal introspect(String token) {
        OAuth2AuthenticatedPrincipal principal = delegate.introspect(token);
        return new DefaultOAuth2AuthenticatedPrincipal(principal.getName(), principal.getAttributes(), extractAuthorities(principal));
    }

    private Collection<GrantedAuthority> extractAuthorities(OAuth2AuthenticatedPrincipal principal) {
        return ((List<String>) principal.getAttribute(OAuth2TokenIntrospectionClaimNames.SCOPE))
                .stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

    }
}
```

> Security Config

```java
@Bean
public OpaqueTokenIntrospector customOpaqueIntrospector(OAuth2ResourceServerProperties oAuth2ResourceServerProperties){
    return new CustomOpaqueTokenIntrospector(oAuth2ResourceServerProperties);
}
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



