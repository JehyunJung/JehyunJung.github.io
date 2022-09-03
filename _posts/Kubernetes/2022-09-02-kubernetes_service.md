---
title: "Kubernetes Service"
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

# Kubernetes Service

## What is Service??

![service_structure](/assets/images/kubernetes/service_structure.png)

위와 같이 여러 개의 node에 동일한 webserver pod가 생성되서 실행되는데, pod가 제각각이므로 각각의 webserver가 가지는 ip는 달라지게 된다. 하지만, 사용자 입장에서는 어떠한 webserver에 접속하면 될지 모르기 때문에, 이에 대해서 서비스는 해당 IP들을 묶어서 하나의 가상 ip로 관리해서 pod에 대한 단일 진입점을 제공한다. 쉽게 말해, Load Balancing을 기능을 통해 여러 서버에 대해 균등하게 실행될 수 있도록 하는 것이다.

> Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webui
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webui
  template:
    metadata: nginx-pod
    labels:
      app: webui
    spec:
      containers:
        -name: nginx-container
        version: nginx:1.14
```

> Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webui-svc
spec:
  type: ClusterIP
  clusterIP: 10.96.100.100
  selector:
    app: webui
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

deployment으로 생성된 3개의 웹서버에 대해서 service는 clusterIP를 통한 단일 진입점을 제공한다. 그러면 clusterIP를 통해 요청을 수행하게 되면 각각의 서버에 대해서 균등하게 작업을 요청할 수 있다.

## Service Types

아래의 Service에 대한 예제를 확인하기 위해 위에서 정의한 deployment을 통해 웹서버 3개를 실행하도록 한다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods -o wide
NAME                            READY   STATUS    RESTARTS   AGE     IP          NODE                     NOMINATED NODE   READINESS GATES
deploy-nginx-5cfbcf5f65-7ks45   1/1     Running   0          5m25s   10.36.0.2   toojeynode2-virtualbox   <none>           <none>
deploy-nginx-5cfbcf5f65-9fkrf   1/1     Running   0          5m25s   10.44.0.2   toojeynode1-virtualbox   <none>           <none>
deploy-nginx-5cfbcf5f65-l2lsf   1/1     Running   0          5m25s   10.36.0.1   toojeynode2-virtualbox   <none>           <none>

```

### ClusterIp

![service_clusterip](/assets/images/kubernetes/service_clusterip.png)

위에서 설명한대로, clusterIP를 이용해서 각각의 node를 연결하는 시켜준다.
selector의 label을 활용해서 동일한 pod를 그룹으로 만들어서 하나의 clusterIP로 관리한다, 보통 clusterIP는 10.96.0.0./12 대역에서 기본적으로 할당되는데, 필요하면 고정적으로 설정해서 사용할 수 있다. 

#### Practice

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

![clusterip_describe](/assets/images/kubernetes/clusterip_describe.jpg)

위의 clusterip service를 확인해보면 cluster ip 10.100.100.100에 대해서 위의 node들이 연결된 상태이다.

실제로 load balancing 하게, 랜덤하게 접근하지 테스트하기 위해 위의 웹서버들에 대한 홈페이지를 조작한 후 테스트를 진행해보자 --> homepage 변경은 직접 해당 container에 접근해서 index.html을 수정하면 된다.

아래와 같이 Random 하게 접근하는 것을 확인할 수 있다.
```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #1
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #3
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #2
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #3
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #3
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #2
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #3
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #2
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #3
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #3
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.100.100
Website #2
```

**deployment은 scaling을 진행하는데, 그렇게 되면 유동적으로 clusterip에 연결된 node 개수가 자동적으로 조정된다.**


### NodePort

![service_nodeport](/assets/images/kubernetes/service_nodeport.png)

각각의 node에 대해서, 특정 port을 통일해서 node + port로 접속하게 되면, 연결되어 있는 pod 중에 임의로 선택해서 요청을 보내도록 한다. Node 단위의 Load Balancing을 수행한다. 

#### Practice

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nodeport-service
spec:
  type: NodePort
  clusterIP: 10.100.100.200
  selector:
    app: webui
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30200
```

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get service nodeport-service 
NAME               TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
nodeport-service   NodePort   10.100.100.200   <none>        80:30200/TCP   21s
```

Nodeport를 통해 노드 IP에 대한 port을 열어놓게 되면 아래와 같이 node IP를 통해 접속했을 때, 웹서버 중에서 임의로 선택되어서 접속하는 것이 가능하다 

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.0.102:30200
Website #1
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.0.104:30200
Website #3
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.0.102:30200
Website #1
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.0.104:30200
Website #3
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.0.102:30200
Website #1
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.100.0.104:30200
Website #2
```

외부에서의 접속을 허용하기 위해 NodePort을 활용한다.

### LoadBalancer

![service_loadbalancer](/assets/images/kubernetes/service_loadbalancer.png)

clusterip, nodepart 방식에 추가록 LB를 구성해서 LB의 port와 Nodeport을 연결해서 LB를 통한 Pod로의 요청을 진행한다. 단, AWS, GoogleCloudPlatform과 같은 플랫폼에서만 활용가능하다.

외부의 Load Balancer에서 내부의 Node Port에 대해 대응되서 연결을 수행할 수 있다.

#### Practice

```yaml
apiVersion: v1
kind: Service
metadata:
  name: loadbalancer-service
spec:
  type: LoadBalancer
  selector:
    app: webui
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```
아래와 같이 Load Balancer type의 service가 생성되며, 기존의 생성한 nodeport와 달리 External IP 부분에 값이 들어가는 것을 확인할 수 있다.(현재는 LB 장비가 없어서 pending 상태로 설정된다.)
![loadbalancer_service](/assets/images/kubernetes/loadbalancer_service.jpg)

### ExternalName

![service_externalname](/assets/images/kubernetes/service_externalname.png)

cluster안에서 외부에 접속 시 사용할 도메인을 등록해서 사용할 수 있다. 그렇게 되면 클래스 도메인이 실제 외부 도메인으로 치환되어 동작하게 된다.

클러스터 내에서 pod에 대한 DNS 서비스를 제공한다고 생각하면 된다. 아래의 동작과정을 통해 자세히 알아보자

#### Practice

```yaml
apiVersion: v1
kind: Service
metadata:
  name: externalname-svc
spec:
  type: ExternalName
  externalName: google.com
```

위와 같이 externalname을 구성하고 난뒤, extername-svc.default.svc.cluster.local 으로 접속하게 되면 아래와 같이 실제 google.com 홈페이지에 접속하는 것을 확인할 수 있다. 

|value|description|
|--|--|
|externalname-svc|external name의 서비스 이름|
|default.svc.cluster.local|kubernetes의 default domain|

![externalname-service](/assets/images/kubernetes/externalname-service.jpg)

## Headless Service

![headless_service](/assets/images/kubernetes/headless_service_mechansim.png)

cluster ip가 없는 서비스를 의미한다. 다만, pod들에 대한 endpoint로 DNS record가 생성되어, control plane의 coreDNS에 저장된다. 이에 따라, Pod의 Endpoint에 대한 DNS resolving Service를 지원한다.

### Practice

```yaml
apiVersion: v1
kind: Service
metadata:
  name: headless-service
spec:
  type: ClusterIp
  clusterIP: None
  selector:
    app: webui
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

위와 같이 clusterIp를 None으로 설정하게 되면 headless-service로 생성되게 된다. 아래의 결과를 확인해보면 endpoint는 묶여있지만, clusterIp는 설정되지 않은 것을 확인할 수 있다.

![headless-service_description](/assets/images/kubernetes/headless_service_description.png)

하지만 headless service의 핵심 기능은 coreDNS을 통한 DNS resolving service를 제공한다는 점이다.

```shell
^Ctoojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl run testpod --image=centos:7 -it /bin/bash
If you dont see a command prompt, try pressing enter.
[root@testpod /]cat /etc/resolv.conf
search default.svc.cluster.local svc.cluster.local cluster.local
nameserver 10.96.0.10
options ndots:5
[root@testpod /]curl 10-36-0-2.default.pod.cluster.local
Website #1
```

pod를 하나 생성해서, resolv.conf을 통해 DNS 서버를 확인해보면 실제 control plane의 coreDNS IP에 대해 알아낼 수 있다.

이에 대해, pod-ip.default.pod.cluster.local을 요청을 보내게 되면 실제 해당 pod에 접속을 진행하게 된다. 위의 경우는 node1에 접속한 결과이다.

## Kube Proxy

Kubernetes Service의 Backend을 구현하는 역할을 수행한다. 

아래의 get pods 결과를 보면 총 3개의 kube-proxy가 동작하는데,모든 노드(master,worker1,worker2)에 대해서 동작하게 되며, cluster IP, nodeport와 같은 service를 요청하게 되면 kube-proxy가 동작하여 각각의 노드에 대한 IP table rules을 생성하게 된다. 

![kubeproxy](/assets/images/kubernetes/kubeproxy.png)

아래의 그림을 확인해보면 pod에 대해 ip table이 생성되는 것을 확인할 수 있다.

![kubeproxy_iptables](/assets/images/kubernetes/kubeproxy_iptables.jpg)




## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=b457Nrk9GKk&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=25)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










