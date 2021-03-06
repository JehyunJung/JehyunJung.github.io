---
title: "Node.js"
excerpt: "Express.js을 이용한 node.js 서버 구성"

categories:
  - Web
tags:
  - node.js
  - express.js
  - 생활코딩
---
# Express.js
순수 javascript 만을 이용해서 webserver을 구성하는 것은 상당히 복잡하고 비효율적이기 때문에, **express.js**와 같은 framework을 이용하는 것이다.

framework: 공통된 기능에 대해 미리 Thrid Party에 구현된 기능을 제공해주는 package이다.

Framework을 이용하므로써, 웹 사이트 개발에 있어서 해당 기능들을 구현해야하는 시간을 아껴서 다른 부분에 집중할 수 있게 된다.

## Module Installation

```powershell
npm install -S express
```

로컬 환경에 express 모듈을 설치한다.

## Simple Server
### Server Initialize

```js
//express 모듈을 import한다.
const express=require('express');
//express 모듈을 이용한 Application 실행
const app=express();

//3000번 포트에 대해 application 실행
app.listen(3000,()=>{
    console.log("App Listening on port 3000");
})
```

### Routing
```js
// '/' 경로에 대한 routing 진행
app.get("/",(req,res)=>{
    //res.send는 html을 client에게 전달하는 역할을 한다.
    res.send("Hello");
})
```
express을 이용하면 routing을 위 처럼 간단하게 수행할 수 있다.

기존의 js을 이용한 routing은 아래와 같이 url을 분석해서, pathname을 가져와야했지만, express을 이용하면 간단하게 get method으로 쉽게 라우팅을 수행할 수 있다.

```js
const http = require('http');
const fs = require('fs');
const url = require('url');
const app = http.createServer((request,response)=>{
    const _url = request.url;
    const queryData=url.parse(_url,true).query;
    const pathName=url.parse(_url,true).pathname;
    let title=queryData.id;
    //루트 경로로 접근 했을 경우 url의 pathname은 /이다.
    if(pathName==="/"){
    });
```

### Path Variable
기존의 서버에서는 url/?id="something" 과 같은 Query Parameter을 이용해서 사용자로부터 paramter을 입력받았다. 하지만 express에서는 Path Variable을 이용하게 된다.


id 와 같은 값을 요청받고자 할때,

사용자는 url/page/"something" 과 같이 parameter을 전달하게 되고, 서버에서는 아래와 같이 id를 읽어들일 수 있다.

```js
app.get("/page/:pageId",(req,res)={
    console.log(req.params);
}
);
```

```json
req.params=
{
"pageId": "1"
}
```

>Path Variable vs Query Parameter

만약 어떤 resource를 식별하고 싶으면 Path Variable을 사용하고,
정렬이나 필터링을 한다면 Query Parameter를 사용하는 것이 좋다.

Path Variable을 사용하면 좋은 상황
- /users  # 사용자 목록을 가져온다.
- /users/123  # 아이디가 123인 사용자를 가져온다.

Query Parameter을 사용하면 좋은 상황
- /users?occupation=programer  # 프로그래머인 사용자 목록을 가져온다.

## HTTP Methods

### Get

```js
app.get("/create",(req,res)=>{
    fs.readdir("./data",(err,files)=>{
        const list=template.list(files);
        const title="WEB - Create";
        const html=template.html(title,list,`
            <form action="/process_create" method="post"?
                <p>
                    <input type="text" name="title" placeholder="title">
                </p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
        `,``);
        res.send(html);
        });
})
```

### Post

```js
app.post("/process_create",(req,res)=>{
    let body="";
    req.on("data",function(data){
        body+=data;
    })
    req.on("end",function(){
        const post=qs.parse(body);
        const title=post.title;
        const description=post.description;

        fs.writeFile(`data/${title}`,description,"utf-8",(err)=>{
            res.redirect(`/page/${title}`);
        })
    })
})
```

### Redirect
다른 페이지로 이동시켜주는 redirect기능은 
app.redirect을 이용하면 된다.

```js
res.redirect(`/page/${title}`);
```

## Middleware

미들웨어라고 하는 것은 소프트웨어 부품으로써, 이미 다른 사람들에 의해 구현된 SW 부품을 나의 프로젝트에 이용하므로써 효율적인 기능 구현이 가능하도록 지원하는 모듈이다.

express.js에서의 미들웨어는 req,res 객체에 접근해서 비지니스 로직에 맞게 잡업 처리가 가능하다.

req -- middle ware --> res

요청,응답 사이에서 작동하는 function이라고 이해해도 좋다.

여태껏 짜왔던 app.get,app.post 안에 구현된 (res,reg) =>{} function도 middleware인 셈이다.

### Example body-parser
HTTP post 형식으로 전달된 http의 body을 분석해주는 body-parser 미들웨어를 사용해보자

>Install

```powershell
npm install -s body-parser
```

>Configure Middleware

```
app.use("path",middleware)
```
app.use function을 이용해서 path으로 들어오는 요청에 대해서 미들웨어가 적용하겠다고 정의한다.

만약 여러 개의 미들웨어가 정의되어 있을 경우 최상의 경로 부터 적용하면서 순차적으로 미들웨어들을 적용한다.

```js
const bodyParser=require('body-parse');
app.use(bodyParser.urlencoded({extended:false}));
```

위 처럼 body-parser 미들웨어를 적용하면 

```js
app.get("/process_create",(req, res)=>{
  res.end(JSON.stringify(req.body, null, 2));
})
```

위의 routing 함수를 통과하면서,아래 처럼 req 객체에 body property로 정보가 넘어오게 된다.

```json
{
    "title":"gg",
    "description":"gg"
}
```
>Comparison - HTTP Server

```js
let body="";
req.on("data",function(data){
    body+=data;
})
req.on("end",function(){
    const post=qs.parse(body);
    const title=post.title;
    const description=post.description;
})
```

>Comparison - Body-parser Middleware

```js
const {
    body:{
        title,description
    }
}=req
```

위와 같이 미들웨어를 이용해서 구현하면 application을 더욱 효율적으로 구현하는 것이 가능하다.

### Making Middleware byself
미들웨어를 직접 작성해서 이를 적용하는 것도 가능하다.

미들웨어는 아래와 같은 구조로 이루어져있는데, 몸체에 로직을 담아서 미들웨어로 적용하면 된다.
```js
const middleWare=function(req,res,next){

    next();
}
```

여기서 next는 다음에 실행해야될 middleware의 정보를 담고 있다.

### Middleware Operation Order

다음과 같은 Middleware 구조가 있을때 어떻게 실행될까?
```js
app.get('/user/:id', function (req, res, next) {
  // if the user ID is 0, skip to the next route
  if (req.params.id == 0) next('route');
  // otherwise pass the control to the next middleware function in this stack
  else next(); //
}, function (req, res, next) {
  // render a regular page
  res.render('regular');
});

// handler for the /user/:id path, which renders a special page
app.get('/user/:id', function (req, res, next) {
  res.render('special');
});
```
/user/:id로 들어온 요청에 대해 첫번째 middle ware가 실행된다.
그런데, req.params.id에 따라서 next('route')가 되기도 하고, next()가 되기도 한다.

next('route')의 경우 다음 router로 넘어간다는 의미인데, 이는 다음 get,use function으로 넘어 간다는 의미이다. 즉, "special"을 출력하는 미들웨어가 실행된다.

next()는 바로 다음에 붙어있는 미들웨어를 실행하는 것으로 "regular"을 출력하는 미들웨어가 실행된다.
그런다음, 해당 미들웨어에 보면 next()가 없는 것을 알 수 있는데, 이는 더 이상 미들웨어의 실행을 하지 않겠다는 의미로, 다음 router 경로로 넘어간다.


## Static Pages

이미지 파일과 같은 파일들을 유저로 하여금 접근 할 수 있도록 하기 위해 폴더를 구성한다.

public/images/coffee.jpg 와 같이 디렉토리를 구성하고

```js
app.use(express.static('public'));
```

위와 같이 설정해주게 되면 url/images/coffee.jpg로 해당 사진 파일에 접속할 수 있다.

## Error Handling

만약 라우팅 과정에서 올바르지 않는 작업에 대한 예외 처리를 하고자 한다면 어떻게 해야되나?

우선 middleware내에서 작업을 처리하다가 예외가 발생하는 부분에 대해서는 next(err)을 이용해서 err 객체를 넘겨주게 되고

```js
//error handling
app.use((err,req,res,next)=>{
    console.log(err.stack)
    res.status(500).send("Something Broke!");
});
```
위의 default error handler가 err 객체를 받아서 처리하게 된다.

## Router

express에서는 모든 것이 미들웨어를 통해 동작하는 것을 알 수 있다. 그러면 공통된 경로에 대한 Router을 만들어서 이를 간략 시킬 수 있다.

> routes/page.js

```js
app.get("/create")
app.post("create_process")
app.get("/update/:updateId")
app.post("/update_process")
...
```
위와 같이 /page로 공통된 경로를 가진 미들웨어들을 서로 묶어서 파일로 관리한다. --> **/pages을 타고 들어오는 router이므로, /page는 없애줘야 경로가 올바르게 동작한다.**

그런 다음 아래와 같이 미들웨어를 등록하게 되면, main.js을 간략화 할 수 있다.

>main.js

```js
const pageRouter=require('./routes/page');
app.use("/page",pageRouter)
```

## Express Generator

express.js을 사용하게 되면 여러 공통적으로 생성해야하는 파일들이 있다 --> generator을 이용하면 이를 자동적으로 만들어줘서 처음에 application을 생성하기 편하다.

> Configuration

```powershell
npm install express-generator -G

express -h
express --view=pug myapp

cd myapp
npm install
```

이렇게 하면 아래와 같은 directory 구조가 자동적으로 생성되는 것을 확인 할 수 있다.

```powershell
.
├── app.js
├── bin
│   └── www
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug
```

7 directories, 9 files

## References
link: [node.js](https://www.inflearn.com/course/web2-node-js)

link: [node.js doc](https://nodejs.org/dist/latest-v16.x/docs/api/)

link: [express.js](https://expressjs.com/)