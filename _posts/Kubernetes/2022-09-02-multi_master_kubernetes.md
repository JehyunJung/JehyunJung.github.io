---
title: "Multi-Master Kubernetes 구성"
excerpt: ""

categories:
  - kubernetes
tags:
  - ssh
  - ubuntu
  - vm
  - kubernetes
  - docker
---

# Multi-Master Kubernetes 구성

HA(Highly Available) cluster 환경을 구성하도록 한다. 기존의 control-plane이 1개였던 환경과는 달리 여러 개의 control-plane을 구성해서 시스템 다운에 대응할 수 있다.

![multi_master_structure](/assets/images/kubernetes/multi_master_structure.png)

기존의 Single master 환경에서 아래의 component들이 추가된다.

1. control planes
2. load balancer

load balancer을 통해 여러 개의 control plane이 한 개의 control plane 인것 처럼 동작하도록 한다. 또한, etcd 간에 데이터를 동기화 해서 각각의 etcd는 같은 정보를 가지고 있을 수 있도록 한다.

 

## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=b457Nrk9GKk&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=24)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










