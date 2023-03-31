---
title: "Spring Security Oauth2 Part 2"
excerpt: "Oauth2 Fundamentals"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# Oauth2 Fundamentals

![oauth2_framework](/assets/images/jsf/Spring_Security/oauth2/oauth2_framework.png)

Oauth는 Open Authorization의 약어로, 클라이언트가 사용자의 정보를 가지고 있는 resource server에 대한 요청을 진행할때 사용자로부터 접근 허가를 받아 access token을 통해 사용자에 대한 정보에 접근하는 것이 가능하다. 

3rd party componenet을 통해 사용자에대한 인증을 대신하기 때문에 Delegated Authorization Framework이라고도 한다.흔히, 카카오톡, 네이버, 페이스북, 등의 SNS 플랫폼을 통해 사용자를 인증하고 사용자의 개인정보에 접근한다.

## Keycloak

Oauth2 기반의 인증을 제공하는 keycloak를 활용하여 oauth2의 동작방식을 이해하도록 하자. 

아래의 명령어를 통해 keycloak 서버를 동작시킬 수 있다.
```powershell
/bin kc.bat start-dev 
```
아래와 같이 client를 등록해서 관리할 수 있다.

![keycloak_client](/assets/images/jsf/Spring_Security/oauth2/keycloak_client.png)

user 정보 또한 등록하는 것이 가능하다.

![keycloak_user](/assets/images/jsf/Spring_Security/oauth2/keycloak_users.png)

## Oauth2 Roles

1. Resource Owner
- 자원을 소유한 소유자로, 해당 자원에 대한 접근을 위해서는 소유자에 대한 접근 허가 요청을 받아야한다.
- 실제 고객에 해당하는 역할이다.

2. Resource Server
- 자원을 보관하고 있는 서버로, access token 기반의 인증을 통해 자원 요청에 접근을 제한한다.

3. Authorization Server
- Resource Server에 대한 요청을 하기에 앞서 소유자, client에 대한 인증을 수행해서 자원 접근에 필요한 access token을 발행한다.

4. Client
- 사용자의 자원을 필요로 하는 어플리케이션으로, 사용자로부터 접근 허가를 받아서 사용자의 자원을 활용한다.
- 실제 고객이 서비스를 요청하는 서버이다.

## Oauth2 Client Types

![oauth2_client_types](/assets/images/jsf/Spring_Security/oauth2/oauth2_client_types.png)

1. Confidential Client: 기밀 클라이언트
- NET, Java, PHP와 같은 서버 프로그래밍 언어로 구현된 웹 어플리케이션 서비스 형태의 클라이언트로 사용자가 서버 소스 코드에 접근할 수 없어 기밀성을 유지할 수 있다. 이와 같은 클라이언트에서는 백서버 채널에서 사용자에 대한 인증을 수행한다. confidential client에서는 client secret과 같은 기밀성을 유지하는 것이 가능하다.

2. Public Client: 공개 클라이언트
- JavaScript, Android, IOS와 같은 프로그래밍 언어로 구성된 앱, 데스크톱 앱에서 활용되는 서비스로, 사용자가 직접적으로 디버그를 통해 소스코드에 접근할 수 있기 때문에 기밀성이 유지되지 않는다. 

보안이 인증된 백엔드 서버측에서 oauth2 인증을 수행하므로써 client, 사용자에 대한 인증을 수행하여 보다 안전한 oauth2 인증이 가능하다. 하지만, native한 환경에서 구현이 필요한 경우 public client으로 구현해야한다.

## Oauth2 Token Types

1. Access Token
- 사용자의 보호된 리소스에 접근하기 위해 필요한 Token으로, 매 요청 시 token 값을 같이 전달하여 자원에 접근이 가능하다.
- resource owner와 authorization server간의 상호작용을 통해 access token이 발행되며, 해당 token은 client에 저장되어, 이후 client가 사용자의 자원에 요청할때 활용한다.

2. Refresh Token
- 보안상의 이유로 일반적으로 AccessToken의 유효시간은 매우 짧게 설정한다. 이때 만료된 access token을 재발급하기 위해 Refresh Token을 활용한다. 

3. ID Token
- 추후 학습 예정

4. Authorization Code
- Authorization Code 인증방식에서 활용되는 code로, client_id 와 client_secret, code를 활용하여 access token과 교환한다.

> Identifier Type

access token을 구현하는 방식에는 크게 2가지가 있다.

![access_token_identifier](/assets/images/jsf/Spring_Security/oauth2/access_token_id.png)

authorization server에는 access token에 대한 정보들을 저장하고 있고 이후, client가 전달한 access token이 유효한지를 판단한다. 즉, 매 요청하다 client는 authorization server로부터 access token이 유효한지를 검증해야한다.

> Self-Contained Type

![access_token_selfcontained](/assets/images/jsf/Spring_Security/oauth2/access_token_selfcontained.png)

식별자 타입의 경우, 매 요청마다 Authorization Server로 access token이 유효한지를 검증해야하기 때문에 네트워크 자원을 계속적으로 활용하는 문제가 있다. 이를 보완할 수 있는 방식이 바로 JWT와 같이 Token 자체에 유의미한 정보를 가지고 있는 Token을 활용하여 서버로의 검증을 생략할 수 있다. 단, 정보를 포함하고 있는 token이므로 해당 token에대한 정보를 안전하게 관리하기 위해 공개키 기반의 암호화 방식과 같은 암호화 과정이 요구된다.

## Oauth2 Flow

Keycloak과 Postman을 활용하여 사용자의 정보를 얻어오는 과정을 확인하자.

![oauth2_flow](/assets/images/jsf/Spring_Security/oauth2/oauth2_flow.png)

> Confidential Client

1. Authorization Code를 받아오기 위한 요청을 수행한다.

response_type: code
client_id: 클라이언트의 id
scope: 접근하고자 하는 사용자의 리소스 종류
redirect_url: 결과를 전달한 url

```
http://localhost:8080/realms/oauth2/protocol/openid-connect/auth?response_type=code&client_id=oauth2-client-app&scope=profile email&redirect_url=http://localhost:8081
```

![get_authorization_code](/assets/images/jsf/Spring_Security/oauth2/get_authorization_code.png)

위의 화면을 통해 id/pw 기반의 인증을 수행하고 나면 아래와 같이 authorization code가 발급되는 것을 확인할 수 있다.

```
http://localhost:8081/?session_state=2b6f3542-a658-4e84-bf2f-9acff912776e&code=8033af0b-557b-4bea-b57e-4367e6bc75b7.2b6f3542-a658-4e84-bf2f-9acff912776e.80f1ca83-0b83-4b38-a4b3-65ae916fad29
```

2. Access Token을 받아오기 위한 요청

![get_access_token](/assets/images/jsf/Spring_Security/oauth2/get_access_token.png)

위의 결과를 통해 access token을 발행되는 것을 확인할 수 있다.

3. Resource 접근

![get_resource](/assets/images/jsf/Spring_Security/oauth2/get_resource.png)

> public client

공개 클라이언트의 경우 client-secret과 같은 기밀성을 유지할 수 없기 때문에 바로 access token을 가져오는 작업을 진행한다.

```
http://localhost:8080/realms/oauth2/protocol/openid-connect/auth?response_type=token&client_id=oauth2-client-app&scope=profile email&redirect_url=http://localhost:8081
```

그러면 아래와 같이 바로 access token이 발행되는 것을 확인할 수 있다.
```
http://localhost:8081/#session_state=2b6f3542-a658-4e84-bf2f-9acff912776e&access_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODAyMzE4MDEsImlhdCI6MTY4MDIzMDkwMSwiYXV0aF90aW1lIjoxNjgwMjMwMzc1LCJqdGkiOiJmYzhiZTVlYS1hZGRkLTQ3NjMtOTgyMi1iNDQzNWI1ZTYyNTQiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5YmY5MjA0Yi1mMGJlLTQ3OTItOGM5ZC0xZTU4NDI0ZmYxYjIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsInNlc3Npb25fc3RhdGUiOiIyYjZmMzU0Mi1hNjU4LTRlODQtYmYyZi05YWNmZjkxMjc3NmUiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtb2F1dGgyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBvcGVuaWQgcHJvZmlsZSIsInNpZCI6IjJiNmYzNTQyLWE2NTgtNGU4NC1iZjJmLTlhY2ZmOTEyNzc2ZSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkplaHl1biBKdW5nIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlciIsImdpdmVuX25hbWUiOiJKZWh5dW4iLCJmYW1pbHlfbmFtZSI6Ikp1bmciLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIn0.vzm1UwFolyY-OhuXcFndUK_PqnpmqcRSwjk8_O4Sw5uZDb--i8EQJ9HEqMNYaTiwjHN9T6oAwm-Ge-HFlxMUdHWLsqj8wprUc1i9F-7x9vde0faqsmCcd4lqzmO768KDTK4BrHm4fvIaZi6hLnHrrSFbd3dnv0xSIbmkkYoTH13yIsk8bJsM6YqVJlLoC4qrMODTf5ECMMmYnXl1-6n-ugMNWdAqeAV5qSlUEZg0HkSDSo48y1_KEo_utf17rhQv_DKWKShFeMwxZ5sYPYEdHws9GZt8HYVhCg_yY-uvd3VKkJRl3xamYgYGZ-ZkZ458ckvplUQxow4Iajh5NHINxw&token_type=Bearer&expires_in=900
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



