---
title: "Spring Security Oauth2 Part 9"
excerpt: "JWT Token"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# JWT Token

## JOSE

JSON Object Signing and Encryption의 약자로, JSON 객체에 대한 암호화, 서명을 나타내기 위한 소프트웨어 기술 세트이다. JOSE에는 아래의 항목들이 포함되어 있다.

- JWT
    - 클레임 기반으로 보안 값을 나타내는 방법으로 당사자간에 안전하게 클레임을 전달할 수 있도록 한다.
    - JWT은 JWS,JWE을 통해 구현된다.
- JWS
    - JSON을 활용하여 디지털 서명, MAC을 활용하여 보안 컨텐츠 표현
- JWE
    - JSON 객체를 활용하여 의도한 사용자만 읽을 수 있도록 암호화처리
- JWK
    - HMAC, RSA 등을 활용한 공개키 세트로 JWT 검증에 활용된다.
- JWA
    - JWS,JWE,JWK에 활용되는 알고리즘 목록

### Structure

일반적으로 활용되는 JWT 형태는 아래와 같이 header, payload, signature 형태로 이루어진 토큰 형태이다.

> Access Token

```
eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODI0NzU0ODYsImlhdCI6MTY4MjQ3NTE4NiwianRpIjoiZmVmMWQ5YzctNjYwZi00NGQ1LThiMDAtOTVhM2MwMTY0YzFmIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9vYXV0aDIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiOWJmOTIwNGItZjBiZS00NzkyLThjOWQtMWU1ODQyNGZmMWIyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoib2F1dGgyLWNsaWVudC1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiNDE1NWMwMzctZTk4My00MWYyLWJiZmMtZGY0NDU4YTUyYmZmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjgwODEiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLW9hdXRoMiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgb3BlbmlkIiwic2lkIjoiNDE1NWMwMzctZTk4My00MWYyLWJiZmMtZGY0NDU4YTUyYmZmIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIn0.jD0EipKVbEO4o3GO-yRjw8yMdfS6eFZ6uXjZgH5_dnYtYoI9F-R8PwDh-vyPuLrjj8UzzkSFFTXzQvpSauYyQkcaVls5J9FLKbH8s22cXzADrXV6Losb3hdXdpyDRSug1tx4xvpZTxvnvlfQSJ5DYEAQSu-zlUm9_aaDejtGvX3dzLGAf3AKdRc8t8EI-BsuM4N00guKGkwfpoe6g96gryq2vn5vRv8_ENs7zN6ChPqLOXZmzM9cUYpmpyBVoJkOMZwXjtqe8p3oS7ruRNJYvXpgRyknqqSDeuj74SIGkAckzuxPMuh0KgXCSQti2X9uE1aqQ4j7NM3oPFEP98dsDA
```

위와 같은 JWT 형태의 Access Token이 있다고 가정하자. '.'을 통해 header, payload, signature로 구분되며 이를 복호화를 해보면 아래의 결과가 나온다.

> HEADER

header에는 토큰의 유형과 보안 알고리즘의 방식이 정의되어있다.

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "KdkNbCyL1v4twFPXcxk3zEY8cIh5N1f3hYBgslhQpbs"
}
```

> PAYLOAD

payload에는 각종 정보(claim)들이 포함되어 있다.

```
{
  "exp": 1682475486,
  "iat": 1682475186,
  "jti": "fef1d9c7-660f-44d5-8b00-95a3c0164c1f",
  "iss": "http://localhost:8080/realms/oauth2",
  "aud": "account",
  "sub": "9bf9204b-f0be-4792-8c9d-1e58424ff1b2",
  "typ": "Bearer",
  "azp": "oauth2-client-app",
  "session_state": "4155c037-e983-41f2-bbfc-df4458a52bff",
  "acr": "1",
  "allowed-origins": [
    "http://localhost:8081"
  ],
  "realm_access": {
    "roles": [
      "offline_access",
      "uma_authorization",
      "default-roles-oauth2"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "email openid",
  "sid": "4155c037-e983-41f2-bbfc-df4458a52bff",
  "email_verified": false,
  "email": "user@email.com"
}
```
> SIGNATURE


signature는 header, payload를 각각 base64 형태로 인코딩 해서 서로 '.'을 이용해서 연결하여 이를 secret_key을 활용하여 HMAC_SHA256 형태로 암호화한 형태이다. signature을 활용하여 JWT Token의 무결성, 기밀성을 유지한다.

```json
RSASHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
{
  "e": "AQAB",
  "kty": "RSA",
  "n": "yg6kDmNx8djlvils7fhVRowB1FX01Bcn5rZEhwrjgoZc5e7Alt66TF_SYoZB8OfZEtEdwZjBggXCBKLtbqmpU5bzxmHulRzEtV0-6BHM7TxBkLURAhoqKzSspwWxb_oYNtCF7PvNlpaSyehv0hdDtNpAh7ws_Iow7UKCPXyGjx-3tlLeUvaKfMW53WX0hH2s7sB_vrWvpBUh0pEE_2X9icX0x-JgdnaCnvVlug7zh568WH4sDJurP8yL1PEYMA18CSUNmA1sjtu23seI_D-OtWajurpr_FwOgwmoUNpImLEWWbMIx1a6W9X3uLABQQ_4bZfMNtjLqluLeoqm7V9H2w"
}
)
```

### Claims

클레임은 주장하고자 하는 부분 즉, 정보를 나타내는 것으로 해당 토큰으로 전달하고자 하는 정보가 포함되어 있다.

클레임은 크게 3종류로 구분된다.

> Registerd Claim

IANA에 등록된 표준 클레임으로 공통적으로 사용되는 클레임 값들이 존재한다.

|claim_name|description|
|--|--|
|iss|토큰의 발급자|
|sub|토큰의 주체|
|aud|토큰의 수신자|
|exp|토큰 만료시간|
|nbf|not before의 약자로, 해당 시간 이전에는 토큰을 처리할 수 없다|
|iat|토큰이 발급된 시간|
|jti|JWT의 고유 식별자로, 중복 방지를 위해 활용|

> Public Claim

공개된 이름으로 충돌을 방지하기 위해 가지고 있어야 한다. 클레임 이름을 URI 형태로 지정한다.

> Private Claim

클라이언트 - 서버간에 전달되어야하는 정보를 포함하고 있는 것으로, 보통 유저의 개인 정보를 포함하고 있는 클레임들이다.

### JWK

JWT 암호화, 서명, 검증에 활용되는 다양한 암호화 키에 대한 정보를 포함하고 있는 JSON 표준 객체이다. jwk-set-uri를 이용해서 인가서버로부터 받아온다.

> JWK Class

```java
public abstract class JWK implements Serializable {

	private static final long serialVersionUID = 1L;
	public static final String MIME_TYPE = "application/jwk+json; charset=UTF-8";
	//키의 유형: RSA, EC, OCT
    private final KeyType kty;
	private final KeyUse use;
	private final Set<KeyOperation> ops;
	//키 알고리즘
    private final Algorithm alg;
    //키의 고유 id
	private final String kid;
	private final URI x5u;
	@Deprecated
	private final Base64URL x5t;
	private final Base64URL x5t256;
	private final List<Base64> x5c;
	private final List<X509Certificate> parsedX5c;
	private final KeyStore keyStore;
}
```

JWK은 알고리즘 종류에 따라 여러 개를 가지고 있을 수 있으며, JWKSet에 저장한다.

> JWKSet

```java
@Immutable
public class JWKSet implements Serializable {	
	private static final long serialVersionUID = 1L;
	public static final String MIME_TYPE = "application/jwk-set+json; charset=UTF-8";
    private final List<JWK> keys;
```

JWK Key는 추상 클래스 형태로, 알고리즘 유형에 따라서, RSAKey, OctetSequenceKey, ECKey와 같은 구현체들이 있다. 직접적으로 위와 같은 Key 객체를 생성해도 되지만 JWKKeyGenerator을 이용해서 Key 객체를 생성한다.

![jwk_generator](/assets/images/jsf/Spring_Security/oauth2/jwk_generator.png)

## Token Verification

MAC, RSA, EC 알고리즘 방식을 활용하여 토큰 서명 및 토큰에 대한 검증을 수행하는 프로젝트를 구성해보자

### MAC

#### Token Creation

로그인이 완료된 사용자에 대해 토큰을 생성하는 과정을 살펴보자

![token_creation](/assets/images/jsf/Spring_Security/oauth2/token_creation.png)

1. UsernamePasswordAuthenticationFilter을 상속하는 JwtAuthenticationFilter 클래스를 정의해서 인증 과정 이후 토큰을 생성할 수 있도록 한다.

attemtAuthentication 메소드를 통해 인증을 처리한 이후, successfulAuthentication 메소드를 활용하여 토큰 생성 과정을 처리한다.

```java
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private SecuritySigner securitySigner;
    private JWK jwk;

    public JwtAuthenticationFilter(SecuritySigner securitySigner, JWK jwk) {
        this.securitySigner = securitySigner;
        this.jwk = jwk;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        ObjectMapper objectMapper = new ObjectMapper();

        LoginDTO loginDto = null;

        try {
            loginDto = objectMapper.readValue(request.getInputStream(), LoginDTO.class);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(loginDto.getUsername(), loginDto.getPassword());
        return getAuthenticationManager().authenticate(usernamePasswordAuthenticationToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        String jwtToken;
        User user = (User) authResult.getPrincipal();
        try {
            jwtToken = securitySigner.getToken(user, jwk);
            response.addHeader("Authorization", "Bearer " + jwtToken);
        } catch (KeyLengthException e) {
            throw new RuntimeException(e);
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }
}
```

2. 토큰 생성 과정은 Security Signer 클래스를 정의해서 해당 클래스 내부에서 토큰을 생성할 수 있도록 한다.

SecuritySigner 클래스를 추상 클래스 형태로 정의해서, 공통적으로 처리되는 부분은 묶어두고 MAC, RSA와 같이 특정 알고리즘에 따라 다르게 처리되어야하는 부분은 다형성을 통해 처리할 수 있도록 한다.

```java
//SecuritySigner
public abstract class SecuritySigner {
    protected String getJwtTokenInternal(MACSigner jwsSigner, UserDetails user, JWK jwk) throws JOSEException {
        JWSHeader header = new JWSHeader.Builder((JWSAlgorithm) jwk.getAlgorithm()).keyID(jwk.getKeyID()).build();
        List<? extends String> authorities = user.getAuthorities().stream().map(auth -> auth.getAuthority()).collect(Collectors.toList());
        JWTClaimsSet jwtclaimSet = new JWTClaimsSet.Builder()
                .subject("user")
                .issuer("http://localhost:8081")
                .claim("username", user.getUsername())
                .claim("password", user.getPassword())
                .claim("authorities",authorities)
                .expirationTime(new Date(new Date().getTime() * 60 * 1000 * 5))
                .build();
        SignedJWT signedJWT = new SignedJWT(header, jwtclaimSet);
        signedJWT.sign(jwsSigner);
        String serialize = signedJWT.serialize();
        return serialize;
    }
    public abstract String getToken(UserDetails user, JWK jwk) throws JOSEException;
}

//MACSecuritySigner
public class MacSecuritySigner extends SecuritySigner{
    @Override
    public String getToken(UserDetails user, JWK jwk) throws JOSEException {
        MACSigner jwsSigner = new MACSigner(((OctetSequenceKey)jwk).toSecretKey());
        return super.getJwtTokenInternal(jwsSigner, user,jwk);
    }
}
```

알고리즘별로 특화된 SecuritySigner 구현체가 있으며, 토큰 서명 과정에서 JWK를 활용하기 떄문에, JwtAuthenticationFilter에 SecuritySigner, JWK 객체를 전달한다. OctetSequenceKey는 대칭키를 포함하고 있는 객체로, Bean으로 등록되어 싱글톤으로 관리되기 때문에 동일한 대칭키를 유지할 수 있게 된다.

> JwtAuthenticationFilter Initialize

```java
@Autowired
private MacSecuritySigner macSecuritySigner;

@Autowired
private OctetSequenceKey octetSequenceKey;

@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
}
@Bean
public JwtAuthenticationFilter jwtAuthenticationFilter(MacSecuritySigner macSecuritySigner, OctetSequenceKey octetSequenceKey) throws Exception {
    JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(macSecuritySigner,octetSequenceKey);
    jwtAuthenticationFilter.setAuthenticationManager(authenticationManager(null));
    return jwtAuthenticationFilter;
}

//filter 생성 과정 추가
httpSecurity.addFilterBefore(jwtAuthenticationFilter(macSecuritySigner,octetSequenceKey), UsernamePasswordAuthenticationFilter.class);
```

> OctetSequenceKey Initialize

```java
@Configuration
public class SignatureConfig {
    @Bean
    public MacSecuritySigner macSecuritySigner() {
        return new MacSecuritySigner();
    }
    //대칭키를 bean 객체로 설정해서, 토큰 생성, 검증 단계에서 활용할 수 있도록 한다. --> Singleton 객체로 유지되어, 대칭키의 값이 유지된다.
    @Bean
    public OctetSequenceKey octetSequenceKey() throws JOSEException {
        OctetSequenceKey octetSequenceKey = new OctetSequenceKeyGenerator(256)
                .keyID("macKey")
                .algorithm(JWSAlgorithm.HS256)
                .generate();
        return octetSequenceKey;
    }
}
```

3. 위의 과정을 통해 아래와 같이 토큰이 생성된다.

```json
eyJraWQiOiJtYWNLZXkiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODEiLCJzdWIiOiJ1c2VyIiwiZXhwIjo1MDQ3OTQyNDUwMjkzMDAsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJ1c2VybmFtZSI6InVzZXIifQ.m2x2dQtKYcYQkC3aBfMWDT9ojtoX5T5kOhDTId9qzy0

HEADER:
{
  "kid": "macKey",
  "alg": "HS256"
}
PAYLOAD:
{
  "iss": "http://localhost:8081",
  "sub": "user",
  "exp": 504794245029300,
  "authorities": [
    "ROLE_USER"
  ],
  "username": "user"
}
```

#### Token Verification

![token_verification](/assets/images/jsf/Spring_Security/oauth2/token_verification.png)

토큰의 검증은 JwtMacAuthorizationFilter에서 처리될 수 있도록 필터를 구성해보자

검증 과정은 이전에 다뤘던 내용과 유사하게 동작한다. SignedJWT을 활용하여 Header, Payload, Signature 부분으로 parsing하고, Verfier을 통해 토큰을 검증한다. 

검증이 완료된 JWT token 내부에 있는 Claim 정보를 토대로 원하는 정보를 얻을 수 있게 된다.

```java
public class JwtAuthorizationMacFilter extends OncePerRequestFilter {
    private OctetSequenceKey jwk;

    public JwtAuthorizationMacFilter(OctetSequenceKey octetSequenceKey) {
        this.jwk = octetSequenceKey;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        //토큰의 유효성 검사
        if (header == null || !header.startsWith("Bearer")) {
            filterChain.doFilter(request,response);
        }
        //실제 토큰 값 추출
        String token = header.replace("Bearer ", "");
        SignedJWT signedJWT;
        try {
            signedJWT=SignedJWT.parse(token);
            MACVerifier macVerifier = new MACVerifier(jwk.toSecretKey());
            boolean verify = signedJWT.verify(macVerifier);
            if (verify) {
                JWTClaimsSet jwtClaimsSet = signedJWT.getJWTClaimsSet();
                String username = jwtClaimsSet.getClaim("username").toString();
                List<String> authorities = (List<String>) jwtClaimsSet.getClaim("authorities");

                if (username != null) {
                    UserDetails user = User.withUsername(username)
                            .password(UUID.randomUUID().toString())
                            .authorities(authorities.get(0))
                            .build();
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);

                }
            }
        } catch (ParseException e) {
            throw new RuntimeException(e);
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
        filterChain.doFilter(request,response);
    }

```

Verifier을 사용하기 위해 secret key 객체가 필요하기 때문에 JwtMacAuthorizationFilter 초기화 과정에서 아래와 같이 OctetSequenceKey을 전달한다.

```java
@Autowired
private OctetSequenceKey octetSequenceKey;

@Bean
public JwtAuthorizationMacFilter jwtAuthorizationMacFilter(OctetSequenceKey octetSequenceKey){
    return new JwtAuthorizationMacFilter(octetSequenceKey);
}

//filter 생성 과정 추가
httpSecurity.addFilterBefore(jwtAuthorizationMacFilter(octetSequenceKey), UsernamePasswordAuthenticationFilter.class);
```

위와 같이 직접 필터를 정의해서 토큰에 대한 검증을 수행해도 되지만, Oauth2ResourceServer 모듈을 활용하여 JWTDecoder을 통한 인증으로 토큰 검증 과정을 간편화할 수 있다. application.yml을 통해 정의된 설정을 토대로 JwtDecoder을 생성해서 토큰 검증과정을 진행한다.

> JwtDecoderConfig

```java
@Configuration
public class JwtDecoderConfig {
    @Bean
    @ConditionalOnProperty(prefix = "spring.security.oauth2.resourceserver.jwt", name = "jws-algorithms", havingValue = "HS256", matchIfMissing = false)
    public JwtDecoder jwtDecoderBySecretKeyValue(OctetSequenceKey octetSequenceKey, OAuth2ResourceServerProperties properties) {
        return NimbusJwtDecoder.withSecretKey(octetSequenceKey.toSecretKey())
                .macAlgorithm(MacAlgorithm.from(properties.getJwt().getJwsAlgorithms().get(0)))
                .build();
    }
}
```

위의 ResourceServer 기반의 검증을 활용하기 위해 아래와 같이 oauth2ResourceServer 설정을 추가해준다.

> SecurityConfig

```java
httpSecurity.oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



