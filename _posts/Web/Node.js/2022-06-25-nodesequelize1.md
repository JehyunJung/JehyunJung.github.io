---
title: "Node.js"
excerpt: "Node.js Sequelize ORM"

categories:
  - Web
tags:
  - node.js
  - MySQL
  - 생활코딩
---

# Sequelize ORM
ORM은 RDBMS DB와 객체로 라이브러리로, 객체 지향형 프로그래밍을 통해 DB 데이터를 접근할 수 있다. 클래스 기반으로 모델을 생성해서 객체 기반의 CRUD 방식으로 쿼리문을 대체 할 수 있다.

## Configuration
> Module Installation

```powershell
npm i morgan sequelize sequelize-cli mysql2
npm i -D nodemon

npx sequelize init
```
init 명령을 실행하게 되면 
config, models, migrations, seeders 폴더가 생성된다.

### config.json

> config/config.json

```json
{
  "development": {
    "username": "",
    "password": "",
    "database": "",
    "host": "",
    "dialect": "mysql"
  },
  "test": {
    "username": "",
    "password": "",
    "database": "",
    "host": "",
    "dialect": "mysql"
  },
  "production": {
    "username": "",
    "password": "",
    "database": "",
    "host": "",
    "dialect": "mysql"
  }
}
```
DB 연결 정보를 config.json에 작성해준다.

### models configuration

> models/index.js

```js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
//연결하고자 하는 DB의 종류를 명시한다. process.env.NODE_ENV를 생성하지 않는 이상 config의 development DB로 접근한다.
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

const User=require('./User');
const Author=require('./Author');
const Topic=require('./Topic');

const sequelize=new Sequelize(config.database,config.username,config.password,config);


db.sequelize=sequelize;
db.Sequelize=sequelize;

module.exports = db;
```
### Attach Sequelize to Express

sequelize를 이용해서 express와 mysql을 연결해준다.

> models/app.js

```java
const morgan=require("morgan");
const {sequelize}= require("./models");
const path=require('path');

sequelize.sync({
    force:false
}).then(()=>{
    console.log("DB Connected");
}).catch((err)=>{
    console.error(err);
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, 'public'))); // 요청시 기본 경로 설정
app.use(express.json()); // json 파싱
app.use(express.urlencoded({ extended: false })); // uri 파싱
```

### Settings for Sequelize-Session

Sequelize ORM을 이용하게 되면서 mysql 방식에서 sequelize 방식으로 바꿔줘야한다.

> Module Installation

```powershell
npm install -S epxress-session-sequelize
```

> main.js

```js
const session=require('express-session');
const session_secret=require('./config/sessionconfig.json')
const SessionStore=require('express-session-sequelize')(session.Store);
 
//Session 정보 할당
const sequelizeSessionStore= new SessionStore({
    db:sequelize
});

app.use(session({
    secret:session_secret.secret,
    resave:false,
    saveUninitialized:true,
    store:sequelizeSessionStore
}))
```

## References
link: [node.js](https://www.youtube.com/watch?v=INUpGK7dTkk&list=PLuHgQVnccGMCBY2wxKYNzFWe6I1gD5xsX)

link: [node.js doc](https://nodejs.org/dist/latest-v16.x/docs/api/)

link: [passport](https://www.passportjs.org/)
