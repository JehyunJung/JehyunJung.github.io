---
title: "Node.js"
excerpt: "Node.js Sequelize ORM Model Mapping"

categories:
  - Web
tags:
  - node.js
  - MySQL
  - 생활코딩
---

# Sequelize ORM

Sequelize 라이브러리를 사용하기 위한 기본 설정들을 했으니, 이제는 DB 테이블에 매핑되는 모델들을 정의해보자

## Model Mappings
각각의 모델은 models 폴더 아래 개별적으로 js 파일로 저장한다.


### DataTypes

MySQL DB에서 쓰이는 Data Type은 Sequelize ORM에서 아래와 같이 제공한다.

|MySQL DataTypes|Sequelize DataTypes|
|--|--|
|VARCHAR(100)|STRING(100)|
|INT|INTEGER|
|TINYINT|BOOLEAN|
|DATETIME|DATE|
|NOT NULL|allowNull: false|
|UNIQUE|unique: true|
|DEFAULT value|defaultValue: value|

이외에도 여러가지 DataType을 지원한다.

[sequelize data types](https://sequelize.org/api/v7/modules/datatypes)

### Sequelize Options

|Options|Descriptions|
|--|--|
|sequelize|생성한 Sequelize 객체를 전달한다|
|timestamps|객체 생성 및 수정시 createdAt, updatedAt 컬럼을 자동적으로 추가하는 지 여부를 설정|
|underscored|java, javascript 와 객체지향형 언어에서는 기본적으로 camel case 방식으로 변수이름을 설정한다. 해당 옵션을 True로 설정하면 createdAt -> create_at 처럼 언더바 표기법으로 설정한다|
|modelName|모델 이름을 지정한다|
|tableName|테이블 이름을 지정한다.|
|paranoid|실제 DB에서 데이터를 삭제하는 것이 아닌, deletedAt를 통해 삭제된 시각을 기록한다.이를 통해 나중에 삭제된 데이터를 복원할 수 있도록 설정할 수 있다.
|charset: 'utf8',collate: 'utf8_general_ci'|해당 설정을 통해 한글 입력이 가능하도록 설정한다.|

이외에도 다양한 옵션들이 있다.

[model options](https://sequelize.org/api/v7/interfaces/modeloptions)

### User

> MySQL

```sql
CREATE TABLE USERS(
  ID INTEGER AUTO_INCREMENT PRIMARY KEY,
  SNS_ID VARCHAR(20),
  PROVIDER VARCHAR(20),
  NICKNAME VARCHAR(20) NOT NULL,
  EMAIL VARCHAR(20),
  PASSWORD VARCHAR(20)
)
```
위의 테이블 구조를 만들기 위해 아래와 같은 클래스를 구성해준다.

> Model

```js
const Sequelize= require('sequelize');

class User extends Sequelize.Model{
    static init(sequelize){
        return super.init(
            {
                id: {
                    type: Sequelize.INTEGER,
                    autoIncrement:true,
                    primaryKey:true
                 },            
                 sns_id: {
                    type: Sequelize.STRING(20),
                    allowNull: true,
                 },
                 provider: {
                    type: Sequelize.STRING(20),
                    allowNull: true,
                 },
                 nickname: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                 },
                 email: {
                    type: Sequelize.STRING(20),
                    allowNull: true,
                 },
                 password: {
                    type: Sequelize.STRING(20),
                    allowNull: true,
                 },
              },
              {
                    sequelize,
                    timestamps: false,
                    underscored: false,
                    modelName: 'User', 
                    tableName: 'Users', 
                    paranoid: false, 
                    charset: 'utf8',
                    collate: 'utf8_general_ci'

              });
    }
}
module.exports=User;
```

### Relationship Mapping

테이블간의 연관관계는 어떻게 표현할까?

#### 1:N, N:1 관계

1:N에 입장에서 보면 1에 속한 테이블은 여러 tuple 연관 있고, N의 입장에서 보면 하나의 tuple와 연관 있다.

1의 테이블은 hasMany 메소드를 정의하고, N 입장에서는 belongsTo 메소드를 정의해서 연관관계를 표현할 수 있다.

Child 와 Parent 간의 테이블 관계를 표현해보면 아래와 같이 할 수 있다.

> Parent

```js
static associate(db) {
        db.Parent.hasMany(db.Child, { foreignKey: 'parent_id', sourceKey: 'id', onDelete: 'cascade', onUpdate: 'cascade' });
    }
```

>Child

```js
static associate(db) {
        db.Comment.belongsTo(db.User, { foreignKey: 'parent_id', targetKey: 'id', onDelete: 'cascade', onUpdate: 'cascade'});
    }
```

위와 같이 연관관계를 표현하면 된다.

|Options|Description|
|--|--|
|foreignKey|외래키를 지정해준다(보통의 경우 N 쪽에 외래키 존재)|
|targetKey|외래키에 대응되는 기본키 지정|
|onDelete|연관관계에 있는 엔티티 삭제시 진행되는 로직 (NULL, CASCADE 값을 설정할 수 있다.)|
|onUpdate|연관관계에 있는 엔티 수정시 진행되는 로직 (NULL, CASCADE 값을 설정할 수 있다.)|

#### 1:1 관계

1:1 관계를 나타내기 위해서는 
hasOne 과 belongsTo 메소드를 사용한다. 

#### M:N 관계

M:N 연관관계를 표현하게 되면, DB에서는 중간에 연결 엔티티를 생성해서 연결 엔티티를 이용해서 N:1, 1:N 관계 2개로 풀어낸다.

그래서 Sequelize 에서는 belongsToMany를 이용하게 되면 자동으로 연결 엔티티를 생성해서 연관관계를 맺어준다.

가령 Item 과 Category는 다대다 연관관계를 가지는데, 이를 sequelize로 표현하게 되면 아래와 같다

```js
// Item
db.Item.belongsToMany(db.Category는, { through: 'ItemCategory' });
 
// Category는
db.Category는.belongsToMany(db.Item, { through: 'ItemCategory' });
```
위와 같이 through option에 연결 엔티티명을 명시해주면 자동으로 엔티티를 생성해준다.

### Model Initialization

위와 같이 모델을 생성해주고 나면, 모델을 초기화 해주는 작업을 해야하는 이는 models/index.js 파일에서 진행하게 된다.

> models/index.js

```js
//모델 정보 추가
db.User=User;
db.Author=Author;
db.Topic=Topic;

//모델과 테이블 간 연결
User.init(sequelize);
Author.init(sequelize);
Topic.init(sequelize);

//연관관계 형성
Topic.associate(db);
Author.associate(db);
```
위와 같이 모듈에 모델 정보를 추가하고, 각각의 모델에 대해 init 함수 실행 및 연관관계를 이어주면 정상적으로 DB 연동 시 테이블이 생성된다.

## CRUD

Sequelize ORM을 이용해서 DB에 쿼리를 하는 법을 알아보자
Sequelize에서는 DB에 fetch하는 작업 수행하기 때문에 query에 대한 return type이 Promise이다. 따라서, .then/.catch 나 async/await를 이용해서 Promise를 처리해야한다.

### Attributes, Where 조건에 따른 쿼리 수행

쿼리에는 여러 옵션 값을 설정할 수 있는데, 
attributes을 이용해서 반환되는 컬럼의 종류를 명시할 수 있다.

where property를 추가하게 되면 조건에 따른 쿼리 수행이 가능하다.

```js
const {User} user=require("../models");
const { Op } = require('sequelize');

const user=await User.findAll({
  attributes: ['id','nickname','age'],
  where:{
    email:"user",
    password:"1234",
    age:{
      [Op.gt]:30
    }
  }
})
```

```sql
SELECT ID, NICKNAME,AGE FROM USERS WHERE EMAIL="1234" AND PASSWROD = "1234" AND AGE >30
```

#### Operators

|Operators|Description|
|--|--|
|Op.gt|초과|
|Op.gte|이상|
|Op.lt|미만|
|Op.lte|이하|
|Op.ne|같지 않음|
|Op.or|또는|
|Op.in|리스트에 포함 여부
|Op.notIn|리스트 불포함 여부|

#### Order by

order 속성을 추가해서 정렬을 수행 할 수 있다.

```js
User.findAll({
  order:[['ID','DESC'],['NICKNAME','ASC']]
});
```

```sql
SELECT * FROM USERS ORDER BY ID DESC, NICKNAME
```


### Create

데이터를 넣기 위한 함수는 아래의 create를 이용한다.

> Create

```js
User.Create({
  nickname:"user",
  email:"user",
  password:"1234"
    }
).then().catch();
```

```sql
INSERT INTO USER(NICKNAME,EMAIL,PASSWORD) VALUES("user","user","1234");
```

> findOrCreate

조회해서 없으면 추가하는 메소드도 있다.

```js
User.findOrCreate({
    where:{
        email:email,
        nickname:nickname,
        password:password}
}).then((result)=>{
    const user=result[0];
    const isCreated=result[1];
    if(isCreated){
    }
    else if(user){

    }
}).catch((err)=>{
    throw err;
});
```
findOrCreate에 추가한 where column에 있는 정보를 이용해서 테이블에서 row를 검색해서 없으면 해당 정보를 이용해서 엔티티에 추가한다.

findOrCreate의 반환하는 정보를 이용해서 create 되었는지, 조회가 정상적으로 되었는 지 확인할 수 있다.

### Read

조회 함수에는 2가지가 있다.

> findAll

```js
const {User} = require("../models");

const user=User.findAll({
  where:{

  }
}).then().catch

//async await을 이용해서 받을 수도 있다.

const user=await User.findAll({

})
```

```sql
SELECT * FROM USERS:
```

findAll을 이용하면 조건에 맞는 여러 개의 row가 반한된게 된다.

> findOne

```js
const {User} = require("../models");

const user=User.findOne({
  where:{

  }
}).then().catch

//async await을 이용해서 받을 수도 있다.

const user=await User.findOne({

})
```

```sql
SELECT * FROM USER LIMIT 1
```

findOne 수행 결과, 1개의 row만 반환된다.

### Update

```js
User.update({
    email:"user1",
    password:"1234567890"
},
{
    where:{
        id:1
    }
}).then().catch();
```

```sql
UPDATE USER SET EMAIL="user1", PASSWORD="1234567890" WHERE ID=1
```

Update 함수를 이용해서 수정을 진행하며, 첫번째 인자에 수정하고자 하는 값을 전달하고, 두번째 인자를 통해 조건을 명시한다.

### Delete

```js
User.destroy({
  where:{
    id:1
  }
})

User.destroy({
  where:{
    id:{
      [Op:in]:[1,2,3]
    }
  }
})

```

```sql
DELETE FROM USERS WHERE ID=1;
DELETE FROM USERS WHERE ID IN (1,2,3);
```

### Join Query

>Topic class

```js
static associate(db){
  db.Topic.belongsTo(db.Author,{
      foreignKey:"author_id",
      targetKey:'id',
      onDelete:'cascade',
      onUpdate:'cascade'
  });
};
```

> Author class

```js
static associate(db) {
  db.Author.hasMany(db.Topic, { 
    foreignKey: 'author_id', 
    sourceKey: 'id', 
    onDelete: 'cascade', 
    onUpdate: 'cascade' 
    });
}
```

현재 Topics 테이블과 Authors 테이블은 N:1 연관관계가 맺어져 있다.
이때, Topic에 대한 join query를 하고자 하면 아래와 같이 includes 속성에 연관되어 있는 테이블을 명시한다.

> include

```js
Topic.findOne({
    where:{id:1},
    include:[{
        model:Author,
        required:true
    }]
}).then().catch();
```

```sql
SELECT * FROM TOPIC INNER JOIN AUTHOR ON TOPIC.AUTHOR_ID=AUTHOR.ID WHERE TOPIC.ID=1;
```
위의 include 에 보면 required 속성이 있는 이를 true로 지정하면 INNER JOIN이 false로 지정하면 OUTER JOIN으로 수행된다.

> getModel_Name

하나의 모델에 대해 getModel_Name을 이용해서 연관된 모델에 대한 조회를 수행할 수도 있다.

```js
const author=await Author.findOne({
  where:{
    id:1
  }
})
const topics= await author.getTopics();
```

위와 같이 getModel_Name 방식으로도 조인 쿼리를 수행할 수 있다.

### sql query

ORM을 이용하지 않고 SQL문을 이용한 쿼리도 수행할 수 있다.

```js
const [results,metadata]=await sequeilze.quert("SELECT * FROM USERS");
```


## References
link: [node.js](https://www.youtube.com/watch?v=INUpGK7dTkk&list=PLuHgQVnccGMCBY2wxKYNzFWe6I1gD5xsX)

link: [node.js doc](https://nodejs.org/dist/latest-v16.x/docs/api/)

link: [sequelize doc](https://sequelize.org/docs/v6/getting-started/)
