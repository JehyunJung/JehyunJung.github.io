---
title: "Spring Security Oauth2 Part 3"
excerpt: "Oauth2 Grant Types"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# Oauth2 Grant Types

Oauth2 인증에는 여러 권한 부여 방식이 존재한다. 

- Authorization Code Grant Type
- Implicit Grant Type
- Resource Owner Password Credentials Grant Type
- Client Credentials Grant Type
- Refresh Token Grant Type
- PKCE-enhanced Authorization Code Grant Type

또한 인증 과정에서 사용되는 매개변수에는 아래와 같이 존재한다.

|parameters|description|
|--|--|
|client_id|클라이언트에 대한 고유키|
|client_secret|client_id에 대한 비밀 값|
|response_type|반환받는 응답의 유형, code,token,id_token을 지정할 수 있다.|
|grant_type|권한 부여 방식 지정|
|redirect_uri|인증 이후 사용자를 다시 리다이렉트 시킬 주소, 만일 해당 매개변수를 지정하였으면 authorization code 과정과 access token 과정 모두에서 같은 값을 지정해야한다.|
|scope|접근하고자 하는 사용자의 자원 범위|
|state|csrf 공격 방지를 위해 사용되는 값|

## Authorization Code Type

권한 코드 부여방식은 2단계 인증 방식을 통해 가장 안전한 유형의 권한 부여 방식이다.

권한 코드 부여방식은 크게 2단계로 이루어져있다.

> 1. Authorization Code 요청

![authorization_code_grant1](/assets/images/jsf/Spring_Security/oauth2/authorization_code_grant1.png)

access token으로 교환할 수 있는 authorization code를 요청하는 단계로, 아래의 매개변수들이 전달된다.

|parameter|value|
|--|--|
|response_type|code|
|client_id||
|redirect_uri||
|scope||
|state||

아래와 같이 get 방식으로 요청을 수행 한후 사용자의 인증,동의 과정을 거쳐 code가 반환된다.

```
http://localhost:8080/realms/oauth2/protocol/openid-connect/auth?response_type=code&client_id=oauth2-client-app&scope=profile email&redirect_url=http://localhost:8081

//result
http://localhost:8081/?session_state=57e167ca-d626-4313-a9d7-b264a54014a4&code=451c2dd7-e80a-4708-9b1c-4a9225c2eacd.57e167ca-d626-4313-a9d7-b264a54014a4.80f1ca83-0b83-4b38-a4b3-65ae916fad29
```

> 2. Access Token 요청

![authorization_code_grant2](/assets/images/jsf/Spring_Security/oauth2/authorization_code_grant2.png)

전달받은 code을 이용해서 access token으로 교환하는 과정을 거친다.

아래의 매개변수들이 활용된다.

|parameter|value|
|--|--|
|grant_type|authorization_code|
|client_id||
|client_secret||
|redirect_url||
|code||

![authorization_code_grant3](/assets/images/jsf/Spring_Security/oauth2/authorization_code_grant3.png)

POST 방식으로 요청을 수행하게 되면 아래와 같이 access token과 refresh token이 반환된다.

```json
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODAzMTkzNDQsImlhdCI6MTY4MDMxOTA0NCwiYXV0aF90aW1lIjoxNjgwMzE5MDI3LCJqdGkiOiJjYjNkMmE2NC01ZWU5LTQxNjktOGU3Mi1iM2FlZDA0OTc2MGQiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5YmY5MjA0Yi1mMGJlLTQ3OTItOGM5ZC0xZTU4NDI0ZmYxYjIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsInNlc3Npb25fc3RhdGUiOiI1N2UxNjdjYS1kNjI2LTQzMTMtYTlkNy1iMjY0YTU0MDE0YTQiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtb2F1dGgyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBvcGVuaWQgcHJvZmlsZSIsInNpZCI6IjU3ZTE2N2NhLWQ2MjYtNDMxMy1hOWQ3LWIyNjRhNTQwMTRhNCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkplaHl1biBKdW5nIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlciIsImdpdmVuX25hbWUiOiJKZWh5dW4iLCJmYW1pbHlfbmFtZSI6Ikp1bmciLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIn0.TDK03smJz5udqznaqbgiRhJ26osyPu8Y4Y2TiC4ErfDJpKCYAnCcllAPL0LCqnwH_TiXGJcIhxyXgOihGDJXRV_ZZSKt_A_55jdsx20CxRvBw6rErNmFb5soWcPgF8pXHHvjSLo9AIKz8YjUu3JicRl3Bv-O2nxj1ruUV9Ue99x0AeMa1nlafM8_97zVZ4IaINPpyPqo6qsJVKZXWsBCrRkk-Hyb-ScVFPdND2c5CZxzCCtrJ2-jgmiit5Bj7crJMerqzMtP5xcfzBEuTpNXko_8AZT7kM2sGlul9XZR4boTKrtplKm_eVyaoxNXHVj6YiWaCOeciEvPs4dD2HebPQ",
    "expires_in": 300,
    "refresh_expires_in": 1800,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4Y2RjMDZiYy00NTljLTRlNjMtYTVkYy0xNmY1N2YxNTgxNmYifQ.eyJleHAiOjE2ODAzMjA4NDQsImlhdCI6MTY4MDMxOTA0NCwianRpIjoiNDhjMzMzZDYtNmEyZC00YmM5LWI5M2YtNmU1MzRkNjVlODExIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9vYXV0aDIiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsInN1YiI6IjliZjkyMDRiLWYwYmUtNDc5Mi04YzlkLTFlNTg0MjRmZjFiMiIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsInNlc3Npb25fc3RhdGUiOiI1N2UxNjdjYS1kNjI2LTQzMTMtYTlkNy1iMjY0YTU0MDE0YTQiLCJzY29wZSI6ImVtYWlsIG9wZW5pZCBwcm9maWxlIiwic2lkIjoiNTdlMTY3Y2EtZDYyNi00MzEzLWE5ZDctYjI2NGE1NDAxNGE0In0.KQAA65DYiLEUzn0vts8c8hC-o0fWR5VG3y2Vw8p17lw",
    "token_type": "Bearer",
    "not-before-policy": 0,
    "session_state": "57e167ca-d626-4313-a9d7-b264a54014a4",
    "scope": "email openid profile"
}
```

### Flow

![authorization_code_grant_flow](/assets/images/jsf/Spring_Security/oauth2/authorization_code_grant_flow.png)

## Implicit Grant Type

해당 권한 부여방식의 경우 Javascript, Andriod, IOS와 같은 클라이언트 측에서 수행하는 권한 인증으로 GET 방식을 통해 바로 access tokend을 부여받는다. Back Channel이 없기 때문에 기밀성이 유지되지 않아 client secret과 같은 비밀키의 사용이 안된다.

아래의 매개변수들이 활용된다.

|parameter|value|
|--|--|
|response_type|token|
|client_id||
|redirect_url||
|state||
|scope||

> Access Token 요청

![implicit_grant_type](/assets/images/jsf/Spring_Security/oauth2/implicit_grant_type.png)

GET 방식을 통해 바로 access token을 요청한다.

```
http://localhost:8080/realms/oauth2/protocol/openid-connect/auth?response_type=token&client_id=oauth2-client-app&scope=profile email&redirect_url=http://localhost:8081

//Result
http://localhost:8081/#session_state=57e167ca-d626-4313-a9d7-b264a54014a4&access_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODAzMjA0OTEsImlhdCI6MTY4MDMxOTU5MSwiYXV0aF90aW1lIjoxNjgwMzE5MDI3LCJqdGkiOiJiZTNhY2EwMy1kODQ5LTRiYWItYjA3Yy1hZjI2MGFhYjk5NDkiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5YmY5MjA0Yi1mMGJlLTQ3OTItOGM5ZC0xZTU4NDI0ZmYxYjIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsInNlc3Npb25fc3RhdGUiOiI1N2UxNjdjYS1kNjI2LTQzMTMtYTlkNy1iMjY0YTU0MDE0YTQiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtb2F1dGgyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBvcGVuaWQgcHJvZmlsZSIsInNpZCI6IjU3ZTE2N2NhLWQ2MjYtNDMxMy1hOWQ3LWIyNjRhNTQwMTRhNCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkplaHl1biBKdW5nIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlciIsImdpdmVuX25hbWUiOiJKZWh5dW4iLCJmYW1pbHlfbmFtZSI6Ikp1bmciLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIn0.BGK_xNN96rTh_V_IzJh3YvVrH527uqNGqssQOglcvvsk8thijtUKMCWIFOxsKH0Q9pVnmwKuOWsrG7SUU5yR5g6sCoXIYag4a4wnFHLocHDMpRAzATTwpl6XKn90vhWJNspcVdA5mFKQwtdiMBMUeXuw1QnLBnPl1Wb_O7a6iCbRMhVZydOKSqbNr1jBSQO8HQQcQtCXtXFaIL7VOMufIWtiRZSIGqIExGxuawBOQ503Fl_-9q1KmdMNsghgT5Erdgra2UzyYQGNRbD9RRypn0ooxxtoEcNHI4BJqFSDtLrDlUw2DLj-4gZSqKJf8Hq_ZxygxN7lpviiU5EgyFaUsg&token_type=Bearer&expires_in=900
```

### Flow

![implicit_grant_flow](/assets/images/jsf/Spring_Security/oauth2/implicit_grant_flow)

## Resource Owner Grant Type

사용자의 id/pw을 제공받아서 인증을 수행한다. 사용자의 계정이 클라이언트 측에 저장되어있는 서비스의 형태에서만 사용하도록 한다.

아래의 매개변수들이 활용된다.

|parameter|value|
|--|--|
|grant_type|password|
|client_id||
|client_secret||
|username||
|password||
|redirect_url||
|code||

client_secret, id,password와 같이 민감한 정보를 포함하고 있기 때문에 Back Channel을 통한 인증을 수행한다.

> Access Token 요청

![resource_owner_grant1](/assets/images/jsf/Spring_Security/oauth2/resource_owner_grant1.png)

아래와 같이 POST 요청을 전달하면 Access Token이 반환된다.

![resource_owner_grant2](/assets/images/jsf/Spring_Security/oauth2/resource_owner_grant2.png)

```json
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODAzMjAyOTQsImlhdCI6MTY4MDMxOTk5NCwianRpIjoiOTQxOWExOTItNmQ1Yi00MzBmLWEwNmYtNzc0MTMzNGUxMTIzIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9vYXV0aDIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiOWJmOTIwNGItZjBiZS00NzkyLThjOWQtMWU1ODQyNGZmMWIyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoib2F1dGgyLWNsaWVudC1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiNWUyNzNiN2QtYTUyOC00NTZlLTlkNjEtYjU1MGY3ZDZiNGE2IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjgwODEiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLW9hdXRoMiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgb3BlbmlkIHByb2ZpbGUiLCJzaWQiOiI1ZTI3M2I3ZC1hNTI4LTQ1NmUtOWQ2MS1iNTUwZjdkNmI0YTYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJKZWh5dW4gSnVuZyIsInByZWZlcnJlZF91c2VybmFtZSI6InVzZXIiLCJnaXZlbl9uYW1lIjoiSmVoeXVuIiwiZmFtaWx5X25hbWUiOiJKdW5nIiwiZW1haWwiOiJ1c2VyQGVtYWlsLmNvbSJ9.T1wMnT8LErccZ4tho5P2aP1_ocJ2H8Qj4BmqbOQu-utvKBoP6WOZ_DDE2G1Fo1JTeN3ytLcpyzbK4X7tANDcsYADTeBl_P54jGVrx_J2JaFVIK7K-W61Jx6ItOgV2lrhlJ_DgSt03a68DaCvHboQYOrymc3Rd7hMOFSR4MHu_oVDN7HokkvmHUC8AsOyCunegQlt8s6qd8GK0s2fd5CB1RRPp78Kaq6zzwjbPRMQpTBBLz8tPNHEB80DJMmyntYdo0qiJW8KZqrbCvjL5A5hjuRVkSVm4i82iBuP5SLPQNhgtTAgvDv02NgXW0fhjgtmtPiGcODUo4MfX6YcN17s0w",
    "expires_in": 300,
    "refresh_expires_in": 1800,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4Y2RjMDZiYy00NTljLTRlNjMtYTVkYy0xNmY1N2YxNTgxNmYifQ.eyJleHAiOjE2ODAzMjE3OTQsImlhdCI6MTY4MDMxOTk5NCwianRpIjoiOWIwYjk1Y2UtMGU2Yy00NmM1LWFjMTMtZTY1ZDIyMWY0YjZmIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9vYXV0aDIiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsInN1YiI6IjliZjkyMDRiLWYwYmUtNDc5Mi04YzlkLTFlNTg0MjRmZjFiMiIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsInNlc3Npb25fc3RhdGUiOiI1ZTI3M2I3ZC1hNTI4LTQ1NmUtOWQ2MS1iNTUwZjdkNmI0YTYiLCJzY29wZSI6ImVtYWlsIG9wZW5pZCBwcm9maWxlIiwic2lkIjoiNWUyNzNiN2QtYTUyOC00NTZlLTlkNjEtYjU1MGY3ZDZiNGE2In0.HMtpcczIxXqwQ85vA3I6Pk_QW1dSlM7w_2EgImpjCyU",
    "token_type": "Bearer",
    "not-before-policy": 0,
    "session_state": "5e273b7d-a528-456e-9d61-b550f7d6b4a6",
    "scope": "email openid profile"
}
```

### Flow 

![resource_owner_grant_flow](/assets/images/jsf/Spring_Security/oauth2/resource_owner_grant_flow.png)

## Client Credentials Grant Type

사용자의 인증 방식 없이 client_id/client_secret을 기반으로 인증을 수행한다. 즉, resource owner가 없고, client가 그 역할을 대신하는 것처럼 보이는 인증방식이다. 

주로, UI가 없는 서버 간 통신에서 활용된다. 또한 사용자의 인증 방식이 없기 때문에 사용자의 자원을 활용하는 요청에서는 사용될 수 없다.

아래의 매개변수들이 활용된다.

|parameter|value|
|--|--|
|grant_type|client_credentials|
|client_id||
|client_secret||
|scope||

> Access Token 요청

![client_credentials_grant1](/assets/images/jsf/Spring_Security/oauth2/client_credentials_grant1.png)

아래와 같이 POST 요청을 통해 Access Token을 반환받게 된다.

![client_credentials_grant2](/assets/images/jsf/Spring_Security/oauth2/client_credentials_grant2.png)

```json
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODAzMjA2MTEsImlhdCI6MTY4MDMyMDMxMSwianRpIjoiOWRlYjhmNjItYzBjZC00ZTNkLThmZmQtNzBkODZlMjA1YzRhIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9vYXV0aDIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiNThkODYwNWItYjVlMy00OTFhLTliMmQtY2FiYjkyNzgwYjFlIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoib2F1dGgyLWNsaWVudC1hcHAiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtb2F1dGgyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBvcGVuaWQgcHJvZmlsZSIsImNsaWVudEhvc3QiOiIxMjcuMC4wLjEiLCJjbGllbnRJZCI6Im9hdXRoMi1jbGllbnQtYXBwIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtb2F1dGgyLWNsaWVudC1hcHAiLCJjbGllbnRBZGRyZXNzIjoiMTI3LjAuMC4xIn0.tyYq222hIg9UZP_mytV_CUAHfYCVfmUQx1K5pE69lqHnmp80vfJIBRDgTEdIhuPQpkZuQHPvyjR7xRKawgBemxCFzJfAV56ZYCJ53FWaA7IkAOKwrPwc5eZHj-Pt-q5YYMOMdHi8Ygxg2HNsmyIEi0Ja_la7tiXOBHE_BVkz6p2hi16fqH5mnOpg3Sfc4YAK9xrizkkr_HNbdw4HzDRLnGJMXMcOJOuhDoiLM577O71EjO82juvUUCTLySDeuQ-OEPsqrpexeO_fLw2IkQHK_YdUfkyIXFRj9fkhu1QQDB4PXejx12Kf_nJGpcs45wGhrxSA0iscW1E_IoouuCL7kA",
    "expires_in": 300,
    "refresh_expires_in": 0,
    "token_type": "Bearer",
    "not-before-policy": 0,
    "scope": "email openid profile"
}
```

### Flow

![client_credentials_grant_flow](/assets/images/jsf/Spring_Security/oauth2/client_credentials_grant_flow.png)

## Refresh Token Grant Type

Access Token이 만료된 경우, Refresh Token을 활용하여 다시 유효한 Access Token을 재발급 받을 수 있다.

아래의 매개변수들이 활용된다.

|parameter|value|
|--|--|
|grant_type|refresh_token|
|client_id||
|client_secret||
|refresh_token||

> Access Token 요청

![refresh_token_grant1](/assets/images/jsf/Spring_Security/oauth2/refresh_token_grant1.png)

아래와 같이 POST 요청을 통해 Access Token을 반환받게 된다. 이때, Refresh Token 또한 추가로 발급된다.

![refresh_token_grant2.png](/assets/images/jsf/Spring_Security/oauth2/refresh_token_grant2.png.png)

```json
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODAzMjA4NzYsImlhdCI6MTY4MDMyMDU3NiwianRpIjoiODcwNmMwMzEtNjRlMi00OTZlLWEyNmUtOWRmYWJkYWUyNmVkIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9vYXV0aDIiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiOWJmOTIwNGItZjBiZS00NzkyLThjOWQtMWU1ODQyNGZmMWIyIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoib2F1dGgyLWNsaWVudC1hcHAiLCJzZXNzaW9uX3N0YXRlIjoiNWUyNzNiN2QtYTUyOC00NTZlLTlkNjEtYjU1MGY3ZDZiNGE2IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjgwODEiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLW9hdXRoMiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgb3BlbmlkIHByb2ZpbGUiLCJzaWQiOiI1ZTI3M2I3ZC1hNTI4LTQ1NmUtOWQ2MS1iNTUwZjdkNmI0YTYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJKZWh5dW4gSnVuZyIsInByZWZlcnJlZF91c2VybmFtZSI6InVzZXIiLCJnaXZlbl9uYW1lIjoiSmVoeXVuIiwiZmFtaWx5X25hbWUiOiJKdW5nIiwiZW1haWwiOiJ1c2VyQGVtYWlsLmNvbSJ9.xCbwmnyaU4tMHqT2CMhRs5FJFOZ8XDPoJSTKxQqxFCo57ySH-LMDNFOr4Fmd1ms6ZPHehs6unZjyobgTJmaHbgTpqMxrsNoEdseOkGASTKAnrJ5gyP90Q_OYkks9d1RLZLQOnhGi5fHwNWkh_XP1qbbn0h9HhDiHeUZrGvZaBefgrFVqLKmUiyyV05znL5hJQL61F0MApFgcn0LOYgOUYCboVmf0id-pSp_Jw4hJIJLmMKR7Ii3elcC5Hk6mtWefDhvnnpwefX0wI-l1S0jTqLf7MqzjqdnybA3YWO6hZj68HHEeAenRqbufawiGKib4XdNP8vmXK1t1N9qg-YNAkQ",
    "expires_in": 300,
    "refresh_expires_in": 1800,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4Y2RjMDZiYy00NTljLTRlNjMtYTVkYy0xNmY1N2YxNTgxNmYifQ.eyJleHAiOjE2ODAzMjIzNzYsImlhdCI6MTY4MDMyMDU3NiwianRpIjoiZDlhMjE3Y2UtYmFlZC00ZWE2LTk3OGItZTYxYjU3NWNjNTNiIiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9vYXV0aDIiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsInN1YiI6IjliZjkyMDRiLWYwYmUtNDc5Mi04YzlkLTFlNTg0MjRmZjFiMiIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsInNlc3Npb25fc3RhdGUiOiI1ZTI3M2I3ZC1hNTI4LTQ1NmUtOWQ2MS1iNTUwZjdkNmI0YTYiLCJzY29wZSI6ImVtYWlsIG9wZW5pZCBwcm9maWxlIiwic2lkIjoiNWUyNzNiN2QtYTUyOC00NTZlLTlkNjEtYjU1MGY3ZDZiNGE2In0.NcUMvB_Za9JVjT5xpmxn03K1Kzu6h0Sfy6NL5WSjEpA",
    "token_type": "Bearer",
    "not-before-policy": 0,
    "session_state": "5e273b7d-a528-456e-9d61-b550f7d6b4a6",
    "scope": "email openid profile"
}
```

### Flow

![refresh_token_grant_flow.png](/assets/images/jsf/Spring_Security/oauth2/refresh_token_grant_flow.png.png)

## PKCE-enhanced Authorization Code Flow

해당 방식의 경우 권한 부여 방식의 일종이 아닌, PKCE 기반의 보안 과정을 추가하여 권한 부여 방식에 있어 보안성을 강화시킬 수 있다.

Authorization Code가 노출되어, 공격자를 이를 악용하여 Access Token을 요청할 수 있는데, 이를 막기 위해서, Code Challenge을 활용해서 이러한 공격 행위를 막을 수 있다.

PKCE 인증에는 아래의 요소들이 활용된다.

- Code Verifier: 원본 난수 값
- Code Challenge: Code Verifier을 해싱해서 Base64 인코딩을 수행
- Code Challenge Method: plain으로 설정시 암호화 수행하지 않음을 명시, S256의 경우 암호화 되었음을 명시

PKCE 난수 값은 [generator](https://tonyxu-io.github.io/pkce-generator/)을 활용한다.

> 1. Authorization Code 요청

authorization code을 요청하는 과정에서 code_challenge와 code_challenge_method을 전달한다.

![pkce_authorization_code_grant1](/assets/images/jsf/Spring_Security/oauth2/pkce_authorization_code_grant1.png)

```
http://localhost:8080/realms/oauth2/protocol/openid-connect/auth?response_type=code&client_id=oauth2-client-app&scope=profile email&redirect_url=http://localhost:8081&code_challenge=wwdchKACduHMSh1e2vUEwoEsMlvYdc4CZ27eb6Wfebk&code_challenge_method=S256

//result
http://localhost:8081/?session_state=57e167ca-d626-4313-a9d7-b264a54014a4&code=c56bd560-e97c-49b5-b2be-c6fd0b261bf8.57e167ca-d626-4313-a9d7-b264a54014a4.80f1ca83-0b83-4b38-a4b3-65ae916fad29
```

> 2. Access Token 요청

access token을 요청하는 과정에서는 code-verfier을 전달하여 서버 측에 저장된 code-challenge와 code-challenge-method을 토대로 올바른 요청인지를 판단한다.

![pkce_authorization_code_grant2](/assets/images/jsf/Spring_Security/oauth2/pkce_authorization_code_grant2.png)

아래의 POST 요청을 통해 성공적으로 Access Token이 반환된다.

![pkce_authorization_code_grant3](/assets/images/jsf/Spring_Security/oauth2/pkce_authorization_code_grant3.png)

```json
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLZGtOYkN5TDF2NHR3RlBYY3hrM3pFWThjSWg1TjFmM2hZQmdzbGhRcGJzIn0.eyJleHAiOjE2ODAzMjE0MTQsImlhdCI6MTY4MDMyMTExNCwiYXV0aF90aW1lIjoxNjgwMzE5MDI3LCJqdGkiOiIzMGRjMWFiMC1jMzFhLTQxMjQtYTNhYi1jYTkxMTk4ZGE3NDMiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI5YmY5MjA0Yi1mMGJlLTQ3OTItOGM5ZC0xZTU4NDI0ZmYxYjIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsInNlc3Npb25fc3RhdGUiOiI1N2UxNjdjYS1kNjI2LTQzMTMtYTlkNy1iMjY0YTU0MDE0YTQiLCJhY3IiOiIwIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtb2F1dGgyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBvcGVuaWQgcHJvZmlsZSIsInNpZCI6IjU3ZTE2N2NhLWQ2MjYtNDMxMy1hOWQ3LWIyNjRhNTQwMTRhNCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6IkplaHl1biBKdW5nIiwicHJlZmVycmVkX3VzZXJuYW1lIjoidXNlciIsImdpdmVuX25hbWUiOiJKZWh5dW4iLCJmYW1pbHlfbmFtZSI6Ikp1bmciLCJlbWFpbCI6InVzZXJAZW1haWwuY29tIn0.JVw_RNtAkZTsZ8a1IfT3yPmcILfau2HKy1f4Ok_uKaDkwdGq1l52GgOV73mHz0ukN8OLMd4qikgI5X3Kj0DAL7UNzSSieRkZMfsK3Dhd6VZrWhCsxerjzLiAhZS-xgpzuvmmAZvPoVS94-7SzmaHOlMvAbA6PHg_4wViSCZZuaQGbx-GNmbMeSLXGEpmVMu0qZSNIjTxVOpHDQzEGtJ69EYJxEi33akyn1nqFAuafE6eqQB4H8Facwg9rymrQNvl3GpAkA7worzirNH3aqR1bnzT7s43UDAPkoIummSHYL1FymSYuqgNHxQu5TeFqTYpzH3T_QZPPpsr8DDPUG4SfA",
    "expires_in": 300,
    "refresh_expires_in": 1800,
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI4Y2RjMDZiYy00NTljLTRlNjMtYTVkYy0xNmY1N2YxNTgxNmYifQ.eyJleHAiOjE2ODAzMjI5MTQsImlhdCI6MTY4MDMyMTExNCwianRpIjoiYmJlNTkyYTktNzkzYy00ZmZmLTljZWItODE4NTE2YTkxOWY1IiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL3JlYWxtcy9vYXV0aDIiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvcmVhbG1zL29hdXRoMiIsInN1YiI6IjliZjkyMDRiLWYwYmUtNDc5Mi04YzlkLTFlNTg0MjRmZjFiMiIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJvYXV0aDItY2xpZW50LWFwcCIsInNlc3Npb25fc3RhdGUiOiI1N2UxNjdjYS1kNjI2LTQzMTMtYTlkNy1iMjY0YTU0MDE0YTQiLCJzY29wZSI6ImVtYWlsIG9wZW5pZCBwcm9maWxlIiwic2lkIjoiNTdlMTY3Y2EtZDYyNi00MzEzLWE5ZDctYjI2NGE1NDAxNGE0In0.sHnxz3oer8FKSsRllUJHFHFZRtaDbMxKxOZw_dfjiaI",
    "token_type": "Bearer",
    "not-before-policy": 0,
    "session_state": "57e167ca-d626-4313-a9d7-b264a54014a4",
    "scope": "email openid profile"
}
```

만약, code-verifier에 틀린 값을 전달하게 되면 아래와 같이 반환된다.

```json
{
    "error": "invalid_grant",
    "error_description": "PKCE verification failed"
}
```

## References
link: [inflearn](https://www.inflearn.com/course/%EC%A0%95%EC%88%98%EC%9B%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



