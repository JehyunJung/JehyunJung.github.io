---
title: "Linux 서버에 ssh-server 구성하기"
excerpt: ""

categories:
  - cloud
tags:
  - ssh
  - ubuntu
---

# Ubuntu에 SSH 서버 환경을 구성하는 방법

## ssh 설치

```shell
sudo apt update
sudo apt-get install -y openssh-server
```

> ssh 동작 확인

```shell
systemctl status ssh
```

![ssh_service_status](/assets/images/cloud/ssh_service_status.png)

## SSH key 페어 생성

암호인증을 대신하기 위해 ssh 개인키/공개키를 생성해서, 공개키를 서버쪽에 등록해야한다.

위도우에서는 putty-gen을 이용하면 쉽게 개인키를 생성할 수 있다.

아래의 단계를 수행하여 키를 생성해서 공개키를 획득한다.

![putty-gen](/assets/images/cloud/putty-gen.jpg)

획득한 공개키는 접속하고자 하는 서버에 등록해줘야한다.

## 공개키 등록

1. 우선, 서버의 home 폴더 아래에 .ssh 폴더를 생성한다.

```shell
mkdir .ssh
```

2. 그런 다음 *.pub 형태의 공개키 파일을 생성해준다.

```shell
vi id_rsa.pub
```

3. 그리고 해당 파일에 위에서 복사한 공개키를 저장한다.

4. 그후, authorized_keys 파일에도 공개키를 추가한다.

```shell
cat id_rsa.pub >> authorized_keys
```

## 개인키 저장

아래의 그림과 같이 위에서 생성한 키에 대해서 개인키 파일 형태로 저장할 수 있다.

![save_private_key](/assets/images/cloud/save_private_key.jpg)

이때, openSSH 형태로 저장하여 범용적으로 사용이 가능하다. 아래의 save private key 버튼을 통해 저장하게 되면 putty에서만 사용가능한 ppk 형태로 저장된다.

## ssh 접속

위와 같이 정상적으로 공개키를 등록해줬다면 client에서는 ssh 개인키를 이용해서 해당 서버에 암호인증없이 접속할 수 있다.

ssh 키를 사용하지 않은 경우 아래와 같이 암호인증을 수행하게 된다.

![ssh_without_key](/assets/images/cloud/ssh_without_key.jpg)

하지만 아래와 같이 ssh 키를 활용하는 경우 바로 로그인을 수행할 수 있다.

![ssh_connect](/assets/images/cloud/ssh_connect.jpg)

## ssh config 구성

ssh config을 구성하게 되면 조금 더 간단하게 서버에 접속하는 것이 가능하다.

client 쪽의 .ssh 폴더에 config 파일 생성해서 아래와 같이 구성한다.

```
Host ******
    HostName ******
    Port ******
    User ******
    IdentityFile ******
```

****** 안에 해당 내용을 입력하면 된다.
1. Host 에는 별칭을 지정한다. 나중에 ssh 별칭 형태로 접속할 수 있다.
2. HostName에는 접속 ip를 지정한다
3. Port에는 접속하고자 하는 포트를 등록한다.
4. User는 user을 등록한다
5. Identity File에는 개인키의 경로를 지정한다.

```shell
ssh ssh_server
```

아래와 같이 별칭을 통한 접속이 가능한 것을 확인할 수 있다.
![ssh_config_connect](/assets/images/cloud/ssh_config_connect.jpg)








