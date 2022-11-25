---
title: "Node.js"
excerpt: "Node.js oauth"

categories:
  - Web
tags:
  - node.js
  - MySQL
  - 생활코딩
---

# OAuth

3rd party service를 이용하기 위해서는 기존에는 id/password을 입력해서 해당 서비스에 접근했어야 했다. 그러러면 사용자로부터 id/password을 입력 받아야하는데, 이렇게 되면 개인정보가 그래도 노출되는 문제점이 있기 때문에 보안에 취약하다.

이런 문제는 해결한 방식이 바로 oauth인데, oauth를 통해 accessToken이라는 것을 발급하게 되는데, 이 accessToken을 이용해서 3rd party Service을 사용할 수 있게된다. 추가로, 이를 통해 3rd party service를 이용한 인증을 구현할 수 있다.

## Roles

|Roles|Description|
|--|--|
|Resource Owner|정보의 소유자, 서비스의 사용자|
|Client|Resource Server에서 필요한 정보를 가져오고, 서비스를 제공하는 애플리케이션 서버|
|Resource Server|사용자가 원하는 정보를 가지고 있는 3rd party 서버로, 해당 정보를 얻기 위해서는 Token이 필요|
|Authorization Server|사용자로부터 ID/Password을 입력받아서 Token을 제공한다.|
|Access Token|사용자가 정상적인 로그인을 통해 인증하였음을 알리는 키|

## Logic

Oauth 과정은 아래와 같은 일련의 순서로 인증을 수행한다.

![oauth_logic](/assets/images/node.js/oauth_logic.png)



## Register

이런 인증을 먼저 수행하기 전에 client 측에서는 authorization server에 대한 client_id 및 redirect_url을 등록하는 작업을 먼저 수행해야 한다.

네이버 로그인을 구현을 예로 들어보자

> 애플리케이션 이름 설정

사용하는 애플리케이션 서비스의 이름 설정
![register_name](/assets/images/node.js/register_name.png)

> 애플리케이션 서비스 범위

제공하고자 하는 정보의 범위 지정
![register_scope](/assets/images/node.js/register_scope.png)

> 애플리케이션 redirect_URL

client가 서비스를 요청하는 url로, 해당 url에서 오는 서비스 요청 및 인증 수행, 그외의 url에서 오는 요청은 무시한다.

![register_redirect_URL](/assets/images/node.js/register_redirect_URL.png)

> Client Id/Secrets
해당 등록 작업을 마무리하게 되면 아래와 같은 정보가 출력되는 데, 이는 client에서 보관하고 있는다.

![client_id_secrets](/assets/images/node.js/client_id_secrets.png)

|field|description|
|--|--|
|Client ID|애플리케이션을 구분하기 위한 식별자|
|Client Key|해당 클라이언트(애플리케이션)에 대한 비밀키(노출되어서는 안되는 정보|
|Authorized redirect URIs|authorized code나 서비스가 제공되는 client의 url|

## Resource Owner Authorization

Resource Owner, 즉 사용자는 사용자 개인의 정보를 사용하기 위한 인증 작업을 수행한다.

![resource_owner_authorization](/assets/images/node.js/resource_owner_authorization.png)

사용자로 부터 Resource Server로의 로그인 과정을 수행을 통해, 사용자를 인증하고, 해당 scope에 대한 접근 권한을 요청받고, 사용자가 인증을 하게 되면 Resource Server는 redirect url를 통해 Authorization code를 전달하게 된다.

## Resource Server Authorization

![resource_server_authorization](/assets/images/node.js/resource_server_authorization.png)

authorization code를 가지고 있는 user측에서는 다시 client로 authorization code를 보내게 된다. client 측에서는 authorization code를 이용해서 Resource Server로 Access Token을 요청해서 Resource Server는 AccessToken을 client 측에 제공하게 된다.

## Service

Access Token을 전달받은 client는 이제 Resource Server로부터 정보를 받아올 수 있는데, 이때 그냥 받아오는 것이 아니라, Resource Server가 제공하는 API를 이용해서 원하는 정보를 요청할 수 있다. 

```bash
curl  -XGET "https://openapi.naver.com/v1/nid/me" \
      -H "Authorization: Bearer AAAAPIuf0L+qfDkMABQ3IJ8heq2mlw71DojBj3oc2Z6OxMQESVSrtR0dbvsiQbPbP1/cxva23n7mQShtfK4pchdk/rc="
```

다음과 같이 Authorization 부분에 전달받은 AccessToken 값을 기입해서 원하는 서비스를 요청할 수 있는 것이다.

## Refresh Token

AccessToken은 정해진 사용 기한이 있다. AccessToken이 정해진 기간을 지나게 되면 더 이상 서비스를 제공하지 못하게 되는데. 
이때, Refresh Token을 이용해서 갱신된 Access Token을 새로 발급받게 된다.

보통의 경우에는 access token을 발급받을 때, 아래와 같이 refresh token도 같이 발급받는다.

![refresh_token](/assets/images/node.js/refresh_token.png)


> Renew Access Token

```bash
curl -X GET "https://auth.clova.ai/token?grant_type=refresh_token?client_id=c2Rmc2Rmc2FkZ2Fasdkjh234zZnNhZGZ&client_secret=66qo65asdfasdfaA7JasdfasfOqwnOq1rOyfgeydtCDrvYasfasf%3D&model_id=test_model&refresh_token=GW-Ipsdfasdfdfs3IbHFBA \
  -H 'Accept: application/json'"
```

다음과 같이 client_id,client_secret,model_id,refresh_token 등의 정보를 제공하게 되면 아래와 같은 Access Token을 새로 받게 된다.

```json
{
  "value": {
    "access_token": "xFcH08vYQcahQWouqIzWOw",
    "expires_in": 12960000,
    "refresh_token": "drJK-soIQI6vqEukqsLU2g",
    "token_type": "Bearer"
  }
}
```

## References
link: [node.js](https://www.youtube.com/watch?v=hm2r6LtUbk8&list=PLuHgQVnccGMA4guyznDlykFJh28_R08Q-)

link: [node.js doc](https://nodejs.org/dist/latest-v16.x/docs/api/)

link: [oauth](https://inpa.tistory.com/entry/WEB-%F0%9F%93%9A-OAuth-20-%EA%B0%9C%EB%85%90-%F0%9F%92%AF-%EC%A0%95%EB%A6%AC)
