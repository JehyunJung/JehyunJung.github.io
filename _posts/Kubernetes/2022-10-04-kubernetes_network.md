---
title: "Kubernetes Network"
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
# Kubernetes Network

## Docker Netwokring

![docker_network](/assets/images/kubernetes/docker_network.png)

docker0라는 network interface가 생겨서 container에 대한 외부 게이트웨이 역할을 수행하게 된다.
node를 통해 container을 실행하게 되면 docker0에서 해당 pod로의 IP변환이 발생하게 된다.

![docker0_network_interface](/assets/images/kubernetes/docker0_network_interfacejpg.jpg)

하지만 아래와 같이 multihost 환경에서 서로 다른 host에 속한 conatiner 간에 통신을 수행할때 문제가 발생한다. 파란색 container와 초록색 container을 살펴보면 서로 같은 ip를 가지기 때문에 이들간에 통신이 이루어지지 않는다. 

![multihost_container_networking](/assets/images/kubernetes/multihost_container_networking.png)

위의 문제를 해결하기 위해 CNI(Container Network Interface)를 활용하게 된다.

![docker_cni](/assets/images/kubernetes/docker_cni.png)

이러한 CNI를 구성하기 위해 우리는 kubernetes 환경에서 weavenet을 활용하였다.

![docker_weavenet](/assets/images/kubernetes/docker_weavenet.png)

현재 kubernetes 환경을 살펴보면 아래와 같이 master, node1, node2 각각에 대한 weavenet과 kube-proxy가 자동으로 동작하는 것을 확인할 수 있으며, node가 생성/삭제 됨에 따라 유동적으로 변경된다.

![docker_weavenet_daemonsets](/assets/images/kubernetes/docker_weavenet_daemonsets.jpg)

## Kube Proxy

> deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webui
  template:
    metadata:
      name: nginx-pod
      labels:
        app: webui
    spec:
      containers: 
        - name: nginx-container
          image: nginx:1.14
```

> service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: clusterip-service
spec:
  type: ClusterIP
  clusterIP: 10.100.100.100
  selector:
    app: webui
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80

```
위와 같이 deployment와 service를 생성해서 아래와 같은 시스템 구조를 만들게 되면, kube-proxy는 clusterip에 대한 iptable을 만들게 된다. kube-proxy는 iptable을 만들어서, 해당 clusterip로의 요청이 들어왔을 때, 각각의 node로 loadbalancing 하는 역할을 수행한다.

![service_kubeproxy](/assets/images/kubernetes/service_kubeproxy.png)

실제로 load balancing 되는지 iptable 규칙을 통해 알아보자

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ sudo iptables -t nat -S | grep 10.100.100.100
-A KUBE-SERVICES -d 10.100.100.100/32 -p tcp -m comment --comment "default/clusterip-service cluster IP" -m tcp --dport 80 -j KUBE-SVC-KUSV3H3OUX7H3MDQ
```
우선 위의 clusterip에 대한 iptable을 확인해보면 10.100.100.100은 KUBE-SVC-KUSV3H3OUX7H3MDQ으로 연결되는 것을 확인할 수 있다. 

또 이를 다시 iptables에서 조회해보면 아래와 같이 routing되는 것을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ sudo iptables -t nat -S | grep KUBE-SVC-KUSV3H3OUX7H3MDQ
-N KUBE-SVC-KUSV3H3OUX7H3MDQ
-A KUBE-SERVICES -d 10.100.100.100/32 -p tcp -m comment --comment "default/clusterip-service cluster IP" -m tcp --dport 80 -j KUBE-SVC-KUSV3H3OUX7H3MDQ
-A KUBE-SVC-KUSV3H3OUX7H3MDQ -m comment --comment "default/clusterip-service -> 10.36.0.1:80" -m statistic --mode random --probability 0.33333333349 -j KUBE-SEP-KPNE4OMUFKEDG6YL
```
우선 33%의 확률로 KUBE-SEP-KPNE4OMUFKEDG6YL로 routing 되는 것을 확인할 수 있다.
```sh
-A KUBE-SVC-KUSV3H3OUX7H3MDQ -m comment --comment "default/clusterip-service -> 10.36.0.2:80" -m statistic --mode random --probability 0.50000000000 -j KUBE-SEP-QC2YCZLGKU5ER4V3
```
그 다음, 나머지 67%에 대해서, 다시 50%의 확률인 33%에 대해서는 KUBE-SEP-QC2YCZLGKU5ER4V3로 routing 되며

```sh
-A KUBE-SVC-KUSV3H3OUX7H3MDQ -m comment --comment "default/clusterip-service -> 10.36.0.3:80" -j KUBE-SEP-L7WI7M2YKMCGI5ZA
toojey-master@toojeymaster-VirtualBox:~/kubernetes$
```
그외 나머지 33%는 KUBE-SEP-L7WI7M2YKMCGI5ZA로 routing 된다.

위의 routing 정보를 정리하면 아래와 같이 나타낼 수 있다.
|keyword|ip|probability
|--|--|--|
|KUBE-SEP-KPNE4OMUFKEDG6YL|10.36.0.1|33%|
|KUBE-SEP-QC2YCZLGKU5ER4V3|10.36.0.2|33%|
|KUBE-SEP-L7WI7M2YKMCGI5ZA|10.36.0.3|33%|

그리고 이는 아래의 cluster ip에 대한 load-balancing 됨을 확인할 수 있다. 또한, iptable 규칙을 통해 port-forwarding 작업 또한 수행하게 된다.

![cni_clusterip](/assets/images/kubernetes/cni_clusterip.jpg)


## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=EKTq5QaV-w8&list=PLApuRlvrZKohLYdvfX-UEFYTE7kfnnY36&index=7)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










