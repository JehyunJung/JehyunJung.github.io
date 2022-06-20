---
title: "Node.js"
excerpt: "Node.js Passport.js"

categories:
  - Web
tags:
  - node.js
  - MySQL
  - 생활코딩
---

# Passport.js

OAuth을 통해 아이디/비밀번호를 제공하지 않고 다른 3rd party에서 제공하는 정보들을 활용할 수 있다. 

passport.js는 oauth을 구현해놓은 라이브러리로, passport.js를 이용해서 3rd party 로그인을 통한 인증, 3rd party 서비스를 제공한다.

## Installation

> Module Installation

```powershell
npm install -S passport
```

>Id/PW based module

```powershell
npm install -S passport-local
```

> Configuration

```js
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
//앱에서 passport을 사용하겠다고 명시
app.use(passport.initialize());
//passport 내부적으로 세션을 유지하겠다고 명시
app.use(passport.session());
```

## Authentication

> 로그인 버튼 클릭시 아래로 라우팅 되도록 설정

```js
app.post('/auth/login_process',
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/auth/login'
    })
)
```

위처럼 middle ware을 등록해서 id/password 기반의 인증을 수행한다.
여기서는, ID/PW 방식의 local 방식을 사용해서 'local'를 인자로 받게 되는데, 이는 다른 전략으로 바꿀 수도 있다.

> 인증 구현

```js
const authData={
    email:'hello',
    password:'1234',
    nickname:'hi'
}

passport.use(new LocalStrategy(
    //login form 의 id/password name
    {
        usernameField:'email',
        passwordField:'password'
    },
    //실제 인증 로직 수행
     (username,password,done)=>{
        if(username === authData.email){
            if(password===authData.password){
                return done(null,authData)
            }else{
                return done(null,false,{
                    message:"Incorrect Password"
                })
            }
        }else{
            return done(null,false,{
                message:"Incorrect Username"
            })
        }
    }
));

```
기존의 authentication을 수행했던 login_process 라우터 함수를 다음과 같이 passport.js에서 관리하게 된다.

done(null,false)를 호출하게 되면 해당하는 회원 정보가 없음을 뜻하며, 에러 메세지를 출력하게 된다.
done(null,authData)를 호출하게 되면 인증에 성공한 회원 정보를 반환하게 된다.

## Session 관련 설정

passport의 session을 활용하기 위해 다음의 두 함수에 대한 처리를 진행해야한다.
```js
//로그인에 성공하게 되면 serializeUser로 user인자가 넘어 오도록 설정되어 있다.
passport.serializeUser((user,done)=>{
    //done 함수 실행을 통해 user.email의 값이 session에 저장되게 된다.
    done(null,user.email);
})
```

```json
"passport":{
    "user":"hello"
}'
```
로그인에 성공하게 되면 1번만 실행되며 세션 객체에 유저 정보가 입력되게 된다. 즉, serializeUser 호출을 통해 session에 user의 정보가  저장되게 된다. 

```js
passport.deserializeUser((user,done)=>{
    //done 함수 실행을 통해 request에 유저정보가 property가 등록된다.
    done(null,authData);
})
```
홈페이지를 접속할 때마다 매번 deserializeUser가 호출되면서 user가 로그인 되어 있는지 확인을 하고 user정보를 전달하게 된다. 이를 통해, request.user 객체에 값이 등록되어 있으면 이는 로그인이 성공적으로 되었음을 확인시켜주는 것이다.

## Logout 

```js
router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            throw err;
        }
        req.session.save(()=>{
            res.redirect("/");
        });
    });
    
    
    return false;
})
```

로그아웃은 위의 req.logout()를 이용해서 수행하고, session 값을 save해준 뒤, 다시 홈으로 이동한다.

## Flash Message 출력
일회성 메세지를 출력하기 위해 flash message 모듈을 활용할 수 있다.


>Install connect-flash 모듈

```powershell
npm install -S connect-flash
```

> Utilization

```js
const flash=require('connect-flash');
//flash 또한 session을 활용하기 때문에, session middleware 이후에 설정해줘야한다.
app.use(flash());

app.get('/flash', function(req, res){
  //다음과 같이 /flash 로 routing 하게 되면 , req.flash() 함수가 실행되면서 req.sessions.flash 객체에 flash message가 담기게 된다.
  req.flash('info', 'Flash is back!')
  res.redirect('/');
});
 
app.get('/', function(req, res){
  //이후에 req.flash를 한번더 호출하게 되면 기존에 등록되어 있는 flash message가 출력되고, 저장되어 있던 flash message는 삭제된다.
  res.render('index', { messages: req.flash('info') });
});
```

```js
//로그인 시 호출 되는 라우팅 처리
app.post('/auth/login_process',
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/auth/login',
        //passport 설정 부분에 failureFalsh를 처리하게 되면, error log를 flash message로 저장할 수 있다.
        failureFlash:true
        //success log 또한 flash message로 등록할 수 있는데, 이는 successFalsh를 true로 설정하면 된다.
    })
);
```




우선 아이디/패스워드 기반의 인증을 먼저 수행해 본 후, 추후에 facebook, twitter, kakao와 같은 인증 서비스를 통한 로그인을 구현해보자

## References
link: [node.js](https://www.youtube.com/watch?v=INUpGK7dTkk&list=PLuHgQVnccGMCBY2wxKYNzFWe6I1gD5xsX)

link: [node.js doc](https://nodejs.org/dist/latest-v16.x/docs/api/)

link: [passport](https://www.passportjs.org/)
