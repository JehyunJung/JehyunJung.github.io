---
title: "MySQL Commands 1"
excerpt: "mysql 계정 생성 및 권한 부여"

categories:
  - Tip
tags:
  - mysql
---

# MySQL Users, Privileges

## User

> create user

```sql
create user '[userid]'@'[host]' identified by '[password]'

--localhost
create user 'test_user'@'localhost' identified by '1234'

--특정 ip값에 대한 허용
create user 'test_user'@'111.222.333.444' identified by '1234'

--특정 ip 대역에 대한 허용
create user 'test_user'@'111.222.333.%' identified by '1234'

--모든 ip에 대한 허용
create user 'test_user'@'%' identified by '1234'
```

여기서 설정하는 host 값에 따라 해당 계정으로의 접근가능한 ip 대역대를 설정할 수 있다.

외부 IP 대역대에 대한 접근은 외부에서 접근을 허용해주는 만큼 제한적으로 적용해야 된다.

> delete user

```sql
drop user '[userid]'@'[host]'
```

> change password

```sql
alter user '[userid]'@'[host]' identified with mysql_native_password '[password]'
```

## Privileges

위의 단계에서 계정을 생성을 하였지만, 막상 해당 유저로 접근해보면 할 수 있는 작업이 아무것도 없다. 이는 해당 계정에 대한 권한을 부여해준 것이 없기 때문이다. 

> grant privileges

```sql
grant [type of privilege] on [db_name].[table_name] to '[userid]'@'[host]';

--모든 db, 테이블에 대해 모든 접근 권한 부여
grant all privileges on *.* to 'test_user'@'%'

--test_db schema에 대해 모든 테이블에 대한 모든 권한 허용
grant all privileges on test_db.* to 'test_user'@'%'

--test_db schema에 대해 test 테이블에 대한 모든 권한 허용
grant all privileges on test_db.test to 'test_user'@'%'
```

특정 db, table에 대하여 특정 권한들을 부여하는 것이 가능하다.

all, alter, create 등 다양한 권한들을 부여하는 것이 가능하다. mysql privilege에 대한 정보는 [mysql_privilege](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html)을 참고하면 된다.

> revoke privileges

```sql
revoke [type of privilege] on [db_name].[table_name] from '[userid]'@'[host]';
```

유저에게 부여된 권한을 제거하기 위해 revoke을 활용한다.

> show grants

```sql
show grants for '[user_id]'@'[host]';
```






