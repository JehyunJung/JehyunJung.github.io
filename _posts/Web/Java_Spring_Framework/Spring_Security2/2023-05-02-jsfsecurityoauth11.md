---
title: "Spring Security Oauth2 Part 11"
excerpt: "OAuth2Client + OAuth2ResourceServer"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# OAuth2Client + OAuth2ResourceServer

Spring Security, Keycloak를 활용하여 OAuth2Client와 OAuth2ResourceServer을 연동해보자

## OAuth2Client

OAuth2 인증을 통해 Access Token을 발급해주는 서버, OAuth2Login Module을 사용하여 OAuth2 기반의 인증을 수행할 수 있도록 한다.

### Configs

> build.gradle

```java
dependencies {
    //OAuth2Client
	implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'

    //Spring Security
	implementation 'org.springframework.boot:spring-boot-starter-security'
    testImplementation 'org.springframework.security:spring-security-test'

    //Thymeleaf
	implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
	implementation 'org.thymeleaf.extras:thymeleaf-extras-springsecurity6'
    
    //Spring Web
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    //Lombok
	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
}
```

> application.yml

access token 발급을 위해 openid provider, registration에 대한 정보를 저장한다.

```yml
server:
  port: 8081

spring:
  security:
    oauth2:
      client:
        provider:
          keycloak:
            issuer-uri: http://localhost:8080/realms/oauth2
            user-name-attribute: preferred_username
        registration:
          keycloak:
            authorization-grant-type: authorization_code
            client-id: oauth2-client-app
            client-name: oauth2-client-app
            client-secret: mRd6pSwgCVEcC6TwMdiEVXVga85rLEcd
            redirect-uri: http://localhost:8081/login/oauth2/code/keycloak
            scope: openid,profile,email,photo
```

> Securit Config

```java
@Configuration
public class OAuth2ClientConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests()
                .requestMatchers("/").permitAll()
                .anyRequest().authenticated();

        httpSecurity.oauth2Login(authLogin -> authLogin.defaultSuccessUrl("/"));

        return httpSecurity.build();
    }

    @Bean
    public RestTemplate restTemplate(){
        return new RestTemplate();
    }
}
```

### Controllers

> IndexController

```java
@Controller
public class IndexController {
    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/home")
    public String home() {
        return "home";
    }
}
```

> RestApiController

RestApi controller을 정의해서, api 요청을 처리하도록 한다. 해당 프로젝트에서는 resource server로부터 사진 정보를 가져오도록 한다.

```java
@RestController
@RequiredArgsConstructor
public class RestApiController {
    private final RestTemplate restTemplate;

    @GetMapping("/token")
    public OAuth2AccessToken token(@RegisteredOAuth2AuthorizedClient("keycloak") OAuth2AuthorizedClient oAuth2AuthorizedClient) {
        return oAuth2AuthorizedClient.getAccessToken();
    }

    @GetMapping("/photos")
    public List<Photo> photos(AccessToken accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken.getToken());
        HttpEntity entity = new HttpEntity(headers);
        String url = "http://localhost:8082/photos";

        ResponseEntity<List<Photo>> response = restTemplate.exchange(url, HttpMethod.GET, entity, new ParameterizedTypeReference<>() {
        });
        return response.getBody();
    }
}
```

### Views

> index.html

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
    <script>
        function token(){
            fetch("/token")
                .then(response => {
                    response.json().then(function(data){
                        console.log("text 안에 데이터 = " + data.tokenValue);
                        window.localStorage.setItem("access_token", data.tokenValue);
                        location.href = "/home";
                    })
                })
        }
    </script>
</head>
<body>
<div>OAuth2.0 Client</div>
<div sec:authorize="isAnonymous()"><a th:href="@{/oauth2/authorization/keycloak}">Login</a></div>
<div sec:authorize="isAuthenticated()">
<form action="#">
    <p><input type="button" onclick="token()" value="access token" />
</form>
</div>
</body>
</html>
```

> home.html

```html
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">

<head>
<meta charset="UTF-8">
<title>Insert title here</title>
    <script>
        function remotePhotos(){
            fetch("http://localhost:8082/remotePhotos",{
                method : "GET",
                headers : {
                    Authorization : "Bearer "+ localStorage.getItem("access_token")
                }
            })
                .then(response => {
                    response.json().then(function(data){
                        for(const prop in data) {
                            document.querySelector("#remotePhotos").append(data[prop].userId);
                            document.querySelector("#remotePhotos").append(data[prop].photoId);
                            document.querySelector("#remotePhotos").append(data[prop].photoTitle);
                            document.querySelector("#remotePhotos").append(data[prop].photoDescription);
                            document.querySelector("#remotePhotos").append(document.createElement('br'));
                        }
                    })
                })
        }

        function photos(){
            fetch("/photos?token="+localStorage.getItem("access_token"),
                {
                    method : "GET",
                    headers : {
                        "Content-Type": "application/json",
                    },
                })
                .then(response => {
                    response.json().then(function(data){
                        for(const prop in data) {
                            document.querySelector("#photos").append(data[prop].userId);
                            document.querySelector("#photos").append(data[prop].photoId);
                            document.querySelector("#photos").append(data[prop].photoTitle);
                            document.querySelector("#photos").append(data[prop].photoDescription);
                            document.querySelector("#photos").append(document.createElement('br'));
                        }
                    })
                })
                .catch((error) => console.log("error:", error));
        }

    </script>
</head>
<body>
<div>Welcome</div>
<div sec:authorize="isAuthenticated()"><a th:href="@{/logout}">Logout</a></div>
<form action="#">
    <p><input type="button" onclick="photos()" value="Photos" />
    <p><input type="button" onclick="remotePhotos()" value="Remote Photos" />
</form>
<div id="photos"></div>
<p></p>
<div id="remotePhotos"></div>
</body>
</html>
```

/photos는 Spring 내부에서 RestTemplate을 활용하여 자원을 요청하는 것이며, /remotePhotos는 JavaScript을 활요하여 자원을 직접 요청하는 방식이다.

### Results

위와 같이, Controller, View을 구성하고 access Token 버튼을 클릭(로그인 수행)하게 되면 아래와 같이 브라우져의 localStorage에 access token이 저장된다.

![local_storage_token](/assets/images/jsf/Spring_Security/oauth2/local_storage_token.png)


## OAuth2ResourceServer

자원을 포함하고 있는 Resource Server는 Access Token에 포함된 SCOPE를 토대로 자원 접근를 제한한다.

### Configs

> build.gradle

```java
dependencies {
    //OAuth2 Resource Server
	implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'

    //Spring Security
	implementation 'org.springframework.boot:spring-boot-starter-security'
    testImplementation 'org.springframework.security:spring-security-test'

    //Spring Web
    implementation 'org.springframework.boot:spring-boot-starter-web'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    //Lombok
	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
}
```

> application.yml

jwt-decoder 생성을 위해 jwk-set-uri를 지정한다.

```yml
server:
  port: 8082

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: http://localhost:8080/realms/oauth2/protocol/openid-connect/certs
```

> Securiy Config

ResourceServer 모듈을 활용하여, JWTDecoder을 통한 토큰 검증을 수행한다. 자원에 대하여 SCOPE 기반의 권한을 설정하여, 특정 권한이 없는 경우에는 해당 자원에 접근할 수 없도록 막는다. 또한, Front 와 Back 단의 도메인이 다르기 때문에 CORS 문제가 발생할 수 있기 때문에, CORS Header에 대한 처리도 진행한다.

```java
@Configuration
public class ResourceServerConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests()
                .requestMatchers("/photos").hasAuthority("SCOPE_photo")
                .requestMatchers("/remotePhotos").hasAuthority("SCOPE_photo")
                .anyRequest().authenticated();

        httpSecurity.oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt);

        httpSecurity.cors().configurationSource(corsConfigurationSource());
        return httpSecurity.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;

    }
}
```

### Controllers

/photos, /remotePhotos을 접근하기 위해 SecurityFilterChain을 통해 접근 권한을 설정하였기 때문에 해당 controller의 실행되는 것은 토큰을 통한 인가 검증이 완료되었음을 의미한다. 따라서, Controller에서는 자원을 반환하기만 하면 된다.

```java
@RestController
public class PhotoController {
    @GetMapping("/photos")
    public List<Photo> photos1() {
        Photo photo1 = getPhoto("1", "Photo 1", "Photo Description 1", "user1");
        Photo photo2 = getPhoto("2", "Photo 2", "Photo Description 2", "user2");

        return Arrays.asList(photo1, photo2);
    }
    @GetMapping("/remotePhotos")
    public List<Photo> photos2() {
        Photo photo1 = getPhoto("1", "Remote Photo 1", "Remote Photo Description 1", "Remote user1");
        Photo photo2 = getPhoto("2", "Remote Photo 2", "Remote Photo Description 2", "Remote user2");

        return Arrays.asList(photo1, photo2);
    }

    public Photo getPhoto(String id, String title, String description, String userId) {
        return Photo.builder()
                .photoId(id)
                .photoTitle(title)
                .photoDescription(description)
                .userId(userId)
                .build();
    }
}
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



