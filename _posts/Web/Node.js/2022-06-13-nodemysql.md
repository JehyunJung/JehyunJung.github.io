---
title: "Node.js"
excerpt: "Node.js을 이용해서 My-SQL DB 연결 및 활용"

categories:
  - Web
tags:
  - node.js
  - MySQL
  - 생활코딩
---
# Node-js & MySql

기존에 사용자가 생성한 동적 콘텐츠를 파일로 저장해서 관리하면서 프로젝트를 진행했다.

하지만, 이런식으로 파일을 통한 저장하는 방식은 매우 비효율적이며, 보안에 취약하다.

파일의 개수가 늘어남에 따라, 사용자가 원하는 파일에 접근하는 데 걸리는 시간이 늘어나고, 제한된 기능만 제공할 수 있다.

이러한 파일 저장방식의 문제점을 해결하기 위해 DB를 이용하게 된다. DB를 이용해 데이터를 저장함으로써, Performance을 극대화 할 수 있으며, SQL을 통한 다양한 쿼리를 통해 사용자의 요구조건을 충족 시킬 수 있다.

## Node.js mysql module

MySQL에 접속 및 MySQL DB을 조작하기 위해 Node.js의 mysql 모듈을 활용

### Installation

```powershell
npm install -S mysql
```

>package.json

```json
"dependencies": {
    "mysql": "^2.18.1",
    "sanitize-html": "^2.7.0"
  }
```

설치를 하면 위 처럼 dependency가 등록되는 것을 확인 할 수 있다.

### Connection

```js
const mysql=require('mysql');
const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'******',
    database:'******'
})

connection.connect();
```
>Results

```powershell
Debugger attached.
```
와 함께 connection이 정상적으로 동작함을 확인할 수 있다.

### Connection Errors

**Client does not support authentication protocol requested by server** 
위와 같은 에러로 DB 연결이 안되는 경우 MYSQL에 아래의 코드를 실행해서 password authentication protocol을 변경해준다.

```sql
-- mysql_native_password 사용하도록 변경
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourRootPassword';
```
## SQL Queries 

```js
const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'******',
    database:'******'
})
connection.connect()
```

```js
connection.query("SQL",[parameters],(err,results)=>{

})
```

connection 객체의 query function을 이용해 sql을 통한 DB에 query하는 것이 가능하다. query가 성공적으로 이루어지면 results에 값이 담기고, 실패하면 err 객체에 에러가 전달된다.

> Example of results

```js
[
RowDataPacket {
  id: 1,
  title: 'MySQL',
  description: 'MySQL is...',
  created: 2018-01-01T03:10:11.000Z,
  author_id: 1
},
RowDataPacket {
  id: 2,
  title: 'Oracle',
  description: 'Oracle is ...',
  created: 2018-01-03T04:01:10.000Z,
  author_id: 1
},
RowDataPacket {
  id: 3,
  title: 'SQL Server',
  description: 'SQL Server is ...',
  created: 2018-01-20T02:01:10.000Z,
  author_id: 2
},
RowDataPacket {
  id: 4,
  title: 'PostgreSQL',
  description: 'PostgreSQL is ...',
  created: 2018-01-22T16:03:03.000Z,
  author_id: 3
},
RowDataPacket {
  id: 5,
  title: 'MongoDB',
  description: 'MongoDB is ...',
  created: 2018-01-30T03:31:03.000Z,
  author_id: 1
}
]
```

다음과 같이 배열에 sql의 결과물이 담긴다.
 
이처럼 DB 관련 부분은 위와 같이 Connection 연결만 잘 되면, 나머지는 SQL query문을 통한 수정을 구현하면 된다.


## SQL Injections

만약 MySQL에 쿼리를 보낼때 아래와 같이 parameter 방식이 아닌 sql 자체로 쿼리를 보내게 되면 어떻게 될까?

```js
connection.query(`DELETE FROM TOPIC WHERE ID=${id}`,(error,results)=>{
    ...
})
```

쿼리에 포함되는 id 값은 사용자로 부터 입력받는 id 값이다. 그런데, 악의적인 사용자가 id를 통해 SQL 문을 입력하게 되면 해당 SQL 문은 실행되게 된다.

>/delete?id=1;DROP TABLE TOPIC;

예를 들어 위와 같은 요청을 했다고 가정하면

```sql
DELETE FROM TOPIC WHERE ID=1;
DROP TABLE TOPIC;
```
위 처럼 2개의 sql문이 실행되게 된다. 이러한 sql injection 문제를 방지하기 위해서 parameter 형식으로 query문을 설계하면 된다.

```js
connection.query(`DELETE FROM TOPIC WHERE ID=?`,[id],(error,results)=>{
    ...
})
```
>/delete?id=1;DROP TABLE TOPIC;

```sql
DELETE FROM TOPIC WHERE ID='1;DROP TABLE TOPIC';
```
와 같이 실행되면서 SQL문 자체가 실행이 되지 않는다.



## References
link: [node.js](https://www.youtube.com/watch?v=1ee5vAou2Y0&list=PLuHgQVnccGMAicFFRh8vFFFtLLlNojWUh)

link: [node.js doc](https://nodejs.org/dist/latest-v16.x/docs/api/)
