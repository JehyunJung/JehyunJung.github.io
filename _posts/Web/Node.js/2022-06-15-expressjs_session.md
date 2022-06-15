---
title: "Node.js"
excerpt: "Express.js Session & Authentication"

categories:
  - Web
tags:
  - node.js
  - MySQL
  - 생활코딩
---
# Express.js Sessions & Authentications

쿠키만을 이용해 id, password을 쿠키에 저장해서 이를 이용해서 자동 로그인 유지 기능을 구현하게 되면, 쿠키에 id/password 같은 개인 정보들이 그대로 드러나는 문제가 발생해, 보안에 취약하다.

보통은 session을 이용해서 필요한 정보들을 서버 쪽에 저장하면서, 이 session에 관련된 id 값을 쿠키에 저장하므로써 인증을 하는 것이 안전한 방법이다.

## Express-Session module 

### Module Installation & Initialization

>Install

```powershell
npm install -S express-session
```

>Middleware

```js
const express=require('express');
const session=require('express-session');
const app=express();

app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true
}))
```

위와 같이 Session 객체를 middleware로 등록하므로써, Session을 활용할 수 있다.

>Options

|options|descriptions|
|--|--|
|secret|비밀키로, 해시 알고리즘과 같은 곳에 활용되므로 고유한 값으로 유지할 필요 있음|
|resave|변경되지 않은 세션도 매번 저장할지에 대한 설정|
|saveUninitialized|초기화되지 않은 세션에 대한 저장 설정|

```js
console.log(req.session);
```

Session 미들웨어 실행을 통해 request 객체의 property에 session 객체를 추가 시켜주는 것을 확인 할 수 있다.

```js
Session {
    cookie: { path: '/', _expires: null, originalMaxAge: null, httpOnly: true }
}
```
## Session Store
Session은 기본적으로 Memory에 저장되어, 서버를 재부팅 하게 되면 Session 정보는 모두 사라지게 된다.

이 Session 정보를 memory 이외에 다른 곳에서 관리하기 위해 node에서는 session store 모듈을 지원해준다.

그중에서도 해당 프로젝트에서 사용하게 있는 MySQL에 저장하는 방법을 알아보자

### Module Install & Initialization

>Install

```powershell
npm install -S express-mysql-session
```

>Initialization

```js
const express = require('express');
const app = module.exports = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const options = {
	host: 'localhost',
	port: 3306,
	user: 'session_test',
	password: 'password',
	database: 'session_test'
};

const sessionStore = new MySQLStore(options);

//session store option에 생성한 session store 객체를 전달한다.
app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));
```

아니면 기존의 mysql_connection이 존재하는 경우 해당 connection을 이용한 session 연결이 가능하다.

```js

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql_connection=require('../lib/mysql.js');

const sessionStore = new MySQLStore({}/* session store options */, mysql_connection);
```

## Creating/Updating Sessions
express.js을 이용한 application에서는 session에 대한 조작을 더욱 간편하게 할 수 있다. 이미 main.js에서 middleware로 등록해놓은 상황에서 

```js
app.get("/",(req,res)=>{
    req.session.isLogined=False;
})
```

위와 같이 req.session 객체에 직접 접근 해서 생성 및 수정하는 것이 가능하다.

## Deleting Sessions

session을 제거하는 방법 또한 매우 간단하다.

```js
app.get("/",(req,res)=>{
    req.session.destroy();
})
```
req.session.destroy()만 호출하면 session이 모두 제거된다.

## Saving to Session Store
간혹, session Store과의 처리 속도 문제로 인해 session store에 바로 저장되지 않고 다른 로직들이 먼저 실행되는 경우가 있는데, 이는 session.save을 이용해서 session store에 먼저 저장하고 다른 작업들을 수행할 수 있도록 할 수 있다.

```js
req.session.save(()=>{
    res.redirect("/");
})
```
위와 같은 경우라면, session store에 먼저 저장한 후, redirection을 진행한다.

## References
link: [node.js](https://www.youtube.com/watch?v=jTct6U8VV5E&list=PLuHgQVnccGMCHjWIDStjaZA2ZR-jwq-WU)

link: [node.js doc](https://nodejs.org/dist/latest-v16.x/docs/api/)

link: [cookie](https://developer.mozilla.org/ko/docs/Web/HTTP/Cookies)
