---
title: "Kubernetes AutoScaling "
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
# Kubernetes AutoScaling

## Cluster Level Scalability

![kubernetes_cluster_autoscaling](/assets/images/kubernetes/kubernetes_cluster_autoscaling.jpg)

위와 같이 pod가 pending 상태에 있는 것을 확인하고 resource 부족으로 실행할 수 있는 node가 없는 경우, node를 확장시켜서 pod가 실행될 수 있도록 한다.

cluster level scalability에서는 worker node를 확장 할 수 있는 기능이 있어야하므로 주로 AWS, GCP와 같은 CSP(Cloud Server Platform) 환경에서 사용된다.

확장된 node가 실행되다가, 장시간 동안 실행되지는 않는 경우, 자동으로 해당 node를 삭제할 수 있도록 한다.

## Pod Level Scalability

pod level의 경우 cluster 처럼 node를 확장 시키는 것이 아니라, pod를 확장시키는 개념이다.

|scaler|description|
|--|--|
|horizontal pod autoscaler|pod의 개수를 확장시키는 개념|
|vertical pod autoscaler|pod의 resource를 추가 하는 개념|

### HPA Horizontal Pod AutoScaler

![kubernetes_hpa](/assets/images/kubernetes/kubernetes_hpa.jpg)

HPA를 이용해서, pod의 resource 사용량에 따라서 유동적으로 pod의 개수를 늘리고 줄일 수 있도록 지원한다.

그렇게 하려면 각각의 pod의 자원 사용량을 모니터링 할 수 있어야하는데, 이를 위해 metrics server라는 것이 동작되어야한다. metrics server는 pod 형태로 동작하게 되며 각각의 pod의 자원 사용량을 체크해서 etcd에 저장한다.
그러면 HPA에서는 자원 사용량을 이용해서 실제 필요한 pod의 개수를 계산하여 deployment을 이용해서 pod 개수를 조정한다.

### VPA Vertical Pod AutoScaler

![kubernetes_vpa](/assets/images/kubernetes/kubernetes_vpa.jpg)

HPA와 동작과정이 유사하지만, pod의 개수를 늘려주는 것이 아니라, pod에 할당된 resource를 확장시키는 개념으로 동작한다.


## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=-9SCEP4bEdk&list=PLApuRlvrZKohLYdvfX-UEFYTE7kfnnY36&index=9)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










