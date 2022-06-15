---
title: "Node.js"
excerpt: "Node.js Cookie & Authentication"

categories:
  - Web
tags:
  - node.js
  - MySQL
  - 생활코딩
---
# Cookie & Authentication
Cookie라는 것은 서버가 일련의 정보를 저장해서 client에게 전달한다음, client에서 쿠키를 저장하고 있다가, 추후에 Server로의 요청을 진행할 때, 이 cookie를 보내서 client에 대한 정보를 전달 할 수 있다.

Cookie를 이용해서 Login(세션ID), Personalization(언어, 표시),Tracking(방문 통계),등 다양한 정보들을 전달해서 client가 server로의 작업 요청에 있어 편의를 제공하기 위해 사용한다.Cookie는 client마다 개인화된 정보를 제공해주기 위해 사용된다.

SessionId와 같은 정보들이 cookie에 저장됨으로써, 로그인이 자동으로 이루어지게 되는데, 이를 통한 보안 문제가 발생할 수 있으니, 쿠키를 다룰때는 신중해야한다.

## Creating Cookies

```js
const http=require('http');
http.createServer((req,res)=>{
    res.writeHead(200,{
        "Set-Cookie":['yummy_cookie=choco','tasty_cookie=strawberry']
    });
    res.end("Cookie");
}).listen(3000);
```

위와 같이 http Server을 구동면서, response 객체에 Set-Cookie property에 cookie를 담아서 전달한다.

값에 배열을 전달하게 되면 같은 이름의 쿠키가 여러개 전달되게 된다.

한번 전달된 쿠키는 브라우져 저장되어서, 앞으로 서버로 연결을 수행할때, request 객체의 cookie를 담아서 전달하게 된다.

## Reading Cookies

```js
const http=require('http');
http.createServer((req,res)=>{
    console.log(req.headers.cookie);
    res.writeHead(200,{
        "Set-Cookie":['yummy_cookie=choco','tasty_cookie=strawberry']
    });
    res.end("Cookie");
}).listen(3000);
```

쿠키는 req.header.cookie을 통해 확인할 수 있다.

>Results

```powershell
yummy_cookie=choco; tasty_cookie=strawberry
```

하지만, 위와 같이 String 형태의 data에 복수 개의 쿠키가 전달되어서 쿠키들을 파악하기 어렵다.

이를 위해 node에서 제공해주는 cookie 모듈을 활용한다.

```powershell
npm install -S cookie
```
```js
const http=require('http');
const cookie=require('cookie');

http.createServer((req,res)=>{
    const cookies=cookie.parse(req.headers.cookie);
    console.log(cookies);
    res.writeHead(200,{
        "Set-Cookie":['yummy_cookie=choco','tasty_cookie=strawberry']
    });
    res.end("Cookie");
}).listen(3000);
```

> Results

```js
{ yummy_cookie: 'choco', tasty_cookie: 'strawberry' }
```
cookie모듈을 활용해서 위와 같이 객체 형태로 사용 가능하다.

## Deleting Cookies

```js
response.writeHead(302,
          {
            Location: `/`,
            "Set-Cookie": [
              `email=;Max-Age=0`,
              `password=;Max-Age=0`,
              `nickname=;Max-Age=0`
            ]
          });
```

위와 같이 생성한 Cookie에 Max-Age=0을 하므로써 cookie를 제거할 수 있다.

## Session Cookies vs Permanent Cookies
Session Cookie는 웹 브라우져가 켜져있는 동안(세션이 유지되는) client에 남아있는 쿠키를 의미하며, 위의 예제를 통해 설정한 쿠키는 Session Cookie이다.

Permanent Cookie는 Expires(특정 날짜), 혹은 Max-age(특정 간동안) 옵션을 이용해서 Cookie가 유지되는 시간을 설정할 수 있다.

```js
const http=require('http');
const cookie=require('cookie');

http.createServer((req,res)=>{
    let cookies={}
    if(req.headers.cookie !== undefined){
        cookies=cookie.parse(req.headers.cookie);
    } 

    console.log(cookies);
    res.writeHead(200,{
        "Set-Cookie":[
            'yummy_cookie=choco',
            'tasty_cookie=strawberry',
            `Permanent=cookies;Max-Age=${60*60*24*30}`]
    });
    res.end("Cookie");
}).listen(3000);
```

아래의 그림을 통해 쿠키가 등록되는 것을 확인 할 수 있다.
![cookie](/assets/images/node.js/cookie.png)

## Secure & Http Only

> Secure

```js
'Secure=Secure; Secure',
```

HTTPS을 통한 서버 연결시에만 해당 쿠키를 보내도록 설정

> HTTP Only

```js
'HttpOnly=HttpOnly;HttpOnly'
```

http 통신 방식을 이용해서만 cookie에 접속 할 수 있다.


```js
> document.cookie
'yummy_cookie=choco; tasty_cookie=strawberry; Permanent=cookies; Secure=Secure'
```

위 처럼, Javascript을 통한 접근으로는 HttpOnly 쿠키를 탐색할 수 없다.
## Path & Domain

> Path

```js
'Path=Path;Path=/cookie'
```

특정 라우팅(경로에 대해서만) cookie가 보이도록 하고자 하면 Path option을 활용한다.

위와 같이 설정할 경우, localhost:3000/cookie으로 시작하는 경로에 접속했을때만 Cookie가 보이게 된다.

>Domain

```js
'Domain=Domain; Domain=o2.org'
```
Path와 유사하게 작동하는데, 단지 domain을 활용한다는 점이 다르다.

해당 domain으로 접속했을 때 cookie가 보이도록 설정한다.



## References
link: [node.js](https://www.youtube.com/watch?v=i51xW3eh-T4&list=PLuHgQVnccGMDo8561VLWTZox8Zs3K7K_m)

link: [node.js doc](https://nodejs.org/dist/latest-v16.x/docs/api/)

link: [cookie](https://developer.mozilla.org/ko/docs/Web/HTTP/Cookies)
