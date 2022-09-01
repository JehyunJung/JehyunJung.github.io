---
title: "kubeadm token 생성"
excerpt: ""

categories:
  - cloud
tags:
  - ssh
  - ubuntu
  - kubernetes
  - troubleshooting
---

# kubeadm token

## 에러 내용

token이 만료되는 경우 아래와 같이 token 정보가 출력되지 않는다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubeadm token list
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ 
```

## 에러 원인

token의 유효기간은 최대 24시간으로, 24시간 이후에는 해당 token이 제거된다.


## 에러 해결방법

> Token 생성

이럴때는, token을 새롭게 만들어주면 된다.

```shell
kubeadm token create
```

**ttl option을 추가하면 만료 시간을 임의로 설정할 수 있다.**

> Token

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubeadm token list
TOKEN                     TTL         EXPIRES                USAGES                   DESCRIPTION                                                EXTRA GROUPS
nxl7z1.qbzrvbc0bc5j3xid   23h         2022-09-02T02:04:00Z   authentication,signing   <none>                                                     system:bootstrappers:kubeadm:default-node-token
```

만약, worker node를 cluster에 추가하고자 하는 경우 아래와 같은 명령어를 수행하면 된다.

> worker node join

```shell
kubeadm join --token <token> <control-plane-host>:<control-plane-port> --discovery-token-ca-cert-hash sha256:<hash>
```

hash 값은 아래의 명령어를 수행하게 되면 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | \
>    openssl dgst -sha256 -hex | sed 's/^.* //'
```


**이미 cluster에 포함된 node에 대해, cluster에서 제거해서 다시 node를 등록하고자 하는 경우 worker  node에서 kubeadm reset으로 정보를 초기화해준 다음에 다시 join을 시도해야한다.**