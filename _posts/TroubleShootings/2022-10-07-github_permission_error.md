---
title: "Github Permission Error"
excerpt: "SSH key 등록"

categories:
  - Trouble_Shooting
tags:
  - ssh
  - ubuntu
  - git
  - troubleshooting
---

# Github Permission Error

## 에러 내용

github는 이전에 user/password 방식에서 ssh 인증방식으로 변경되면서 ssh public key가 github에 등록되어 있지 않은 경우 아래와 같은 에러가 발생하게 된다.

```sh
toojey-master@toojeymaster-VirtualBox:~/.ssh$ ssh -T git@github.com
git@github.com: Permission denied (publickey).
```
## 에러 원인

github에 해당 pc의 ssh public key가 등록되어 있지 않아 인증이 되지 않는 문제가 발생한 것이다.

## 에러 해결방법

> ssh public key 생성

```sh
ssh-keyen -t rsa -b 4096
```

rsa 암호화 방식의 4096비트 크기의 private_key, public_key pair을 만들어준다.

> ssh public key를 github에 등록

생성된 id_rsa.pub파일의 내용을 복사해서 github에 등록한다.

![add_ssh_key](/assets/images/tips/add_ssh_key.png)


이렇게 public key를 등록하게 되면 정상적으로 github server와의 인증이 완료된다.

아래의 명령어를 통해 test을 수행하면 ssh 인증이 정상적으로 이루어지는 것을 확인할 수 있다.
```sh
toojey-master@toojeymaster-VirtualBox:~/.ssh$ ssh -T git@github.com
Hi JehyunJung! You've successfully authenticated, but GitHub does not provide shell access.
```

> 만약 id_rsa 이외의 공개키를 사용하고자 하는 경우

기본적으로 id_rsa 개인키를 이용해서 ssh 접속을 시도하게 되지만, 개인키가 여러 개 있는 경우, 한 PC에 여러 github 계정을 활용하는 경우도 있을때는 ssh config file을 구성해야한다.

아래와 같이 각 host, 유저, private key에 대해 ssh config file을 구성하게 되면 한 pc에서 여러 user, private key가 동작하는 환경에 대해서도 정상적으로 github ssh 인증이 동작하게 된다.

```
toojey-master@toojeymaster-VirtualBox:~/.ssh$ cat config
Host github
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_ssh
```