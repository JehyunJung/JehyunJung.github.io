---
title: "Kubernetes Architecture"
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

# Kubernetes Architecture

![kubernetes_architecture](/assets/images/kubernetes/kubernetes_architecture.png)

1. 원하는 컨테이너들을 빌드한다. 
    - mainui, login, pay, 등등
2. 해당 컨테이너들을 docker hub에 올려서 관리하도록 한다.
    - 사대 hub 또는, docker hub에 올려서 관리하게 되면서, 나중에 pull 해서 사용가능하다.

3. kubectl 명령어를 이용해서 해당 컨테이너를 실행하도록 한다.

4. kubectl 명령어를 수행하게 되면, master node에서의 api-server에서는 해당 명령어 요청을 처리한다.

5. scheduler를 통해 worker node의 상태를 분석해서 어떤 노드에서 실행 시킬 지 분석하게 된다.

6. 작업을 실행하게 될 worker node에 작업을 할당하게 된다, 해당 노드는 pod 형태로 작업을 관리하게 된다.

## Component

![kubernetes_components](/assets/images/kubernetes/kubernetes_components.png)

### Master Components

> etcd

    - key:value 형태의 저장소이다. worker node에 대한 정보를 저장하고 있다. kubelet(k8s 데몬)을 통해 수집된 worker node에 대한 정보를 저장하게 된다.
    - 추가로, kubectl 명령어를 실행시킨 container 관련 정보도 가지고 있다.

> kube-apiserver

    - kubectl 명령어를 처리한다.(create, edit, delete, 등의 명령어를 parsing 해서 처리한다.)

> kube-scheduler

    - etcd의 정보를 바탕으로 특정 작업을 처리할 worker node에 작업을 배치하게 된다.

> kube-controller

    - 예기치 못한 시스템 오류에 인해 worker 노드에서 작업을 처리하지 못하게 되는 경우, 다른 worker 노드에 실행시킬 수 있도록 한다. 즉, 실행시키는 작업의 container의 갯수를 보장한다.

### Worker Components

> kubelet

    - 모든 노드에서 실행되는 k8s 에이전트, 데몬
    - worker node에서 실행되게 되면 cAdvisor(container monitoring tool)이 실행되면서 worker node의 정보를 수집해서 master node의 etcd에 저장시킨다.

> kube-proxy

    - k8s의 네트워크 동작 관리

> container runtime

    - container의 실행시키는 엔진으로, 대표적으로 docker을 사용하게 된다.
    - docker, containerd, runc 

### etc

  - network addons
  - dns addon
  - dashboard
  ...

  이외에도 여러 가지 addon을 추가해서, 부가 기능을 활용하도록 할 수 있다.

## namespace

클러스터를 여러개의 논리적인 단위로 나눠서 사용

![kubectl_namespace](/assets/images/kubernetes/kubectl_namespace.png)

여러 개의 pod들을 동작시키는 과정에서, 같은 그룹(namespace)으로 묶어서 관리할 수 있는 것이다. 

가령, 여러 부서가 있는 기업이라고 생각하자.

HR, IT, Finance 와 같은 부서가 있다고 가정했을 때, 각 부서에서 사용하게 되는 작업은 다를것이다. 따라서, 이런 부서 마다 각각 필요한 작업(pod)를 부서 단위로 그룹(namespace)을 만들어 놓게 되면 그룹 단위로 작업을 처리할 수 있게 된다.

실제 물리 장치는 한개이지만 여러개의 논리적인 작업 단위로 나눠서 작업을 처리하는 것이다. 이는 Process 개념과 유사하다고 볼 수 있다.

### namespace 관련 명령어

#### namespace list

```shell
toojey-master@toojeymaster-VirtualBox:~$ kubectl get namespaces 
```

```
NAME              STATUS   AGE
default           Active   39h
kube-node-lease   Active   39h
kube-public       Active   39h
kube-system       Active   39h
```

기본적으로 kubernetes에서 구성해놓은 namespace가 있다.

모든 명령어 처리는 명시하지 않은 default namespace에서 처리하게 된다.

> 특정 namespace에서 동작 중인 pod 목록 조회


```shell
#-n [namespace] 옵션을 통해, 특정 namespace에 대해서 명령어를 수행한다.
kubectl get pods -n kube-system 
```

```
NAME                                              READY   STATUS    RESTARTS       AGE
coredns-565d847f94-7n9bm                          1/1     Running   2 (50m ago)    39h
coredns-565d847f94-w5qhv                          1/1     Running   2 (50m ago)    39h
etcd-toojeymaster-virtualbox                      1/1     Running   4 (50m ago)    39h
kube-apiserver-toojeymaster-virtualbox            1/1     Running   4 (50m ago)    39h
kube-controller-manager-toojeymaster-virtualbox   1/1     Running   2 (50m ago)    39h
kube-proxy-279gw                                  1/1     Running   2 (50m ago)    39h
kube-proxy-gqw97                                  1/1     Running   2 (50m ago)    39h
kube-proxy-qw7lx                                  1/1     Running   2 (50m ago)    39h
kube-scheduler-toojeymaster-virtualbox            1/1     Running   10 (50m ago)   39h
weave-net-9pbxp                                   2/2     Running   4 (50m ago)    39h
weave-net-qbzht                                   2/2     Running   4 (50m ago)    39h
weave-net-w44mx                                   2/2     Running   4 (50m ago)    39h
```

kube-system namespace에서 동작 중인 pod 목록을 조회하면 위와 같이 있는 것을 확인할 수 있다.

#### namespace 생성

> cli 기반

```shell
toojey-master@toojeymaster-VirtualBox:~$ kubectl create namespace blue
```
kubectl create namespace [namespace_name] 와 같은 방식으로 namespace를 생성할 수 있다.

```
namespace/blue created
```

> yaml file을 이용한 namespace 생성

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl create namespace orange --dry-run -o yaml > orange.yaml
```
이때, dry-run 옵션을 추가해서, 실제로 명령어는 실행하지 않고, 실행할 수 있는지 여부만 알 수 있도록 하고, yaml 파일 형태로 해당 결과를 저장한다.

그런 다음, 아래와 같이 yaml 파일을 수정하고 이를 토대로 namespace를 만들어보자

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: orange
```

```shell
kubectl create -f orange.yaml
```

아래와 같이 namespace가 생성된 것을 확인할 수 있다.

```
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get namespaces 
NAME              STATUS   AGE
blue              Active   8m4s
default           Active   39h
kube-node-lease   Active   39h
kube-public       Active   39h
kube-system       Active   39h
orange            Active   4s
```

#### 특정 namespace에 pod 실행

> nginx.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports: 
        - containerPort: 80
        - containerPort: 443
```

nginx pod을 생성하는 yaml 파일을 특정 namespace(blue)에서 실행하도록 해보자

```shell
kubectl create -f nginx.yaml -n blue
```

그러면 아래와 같이 blue namespace에서 실행되는 것을 확인할 수 있다.

```
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pod -n blue 
NAME    READY   STATUS    RESTARTS   AGE
mypod   1/1     Running   0          15s
```

아래와 같이 yaml의 metadata에 namespace를 명시하는 것도 가능하다. 그러면, -n option을 명시하지 않더라도, 해당 namespace에 pod를 실행하게 된다.

> nginx.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
  namespace: blue
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports: 
        - containerPort: 80
        - containerPort: 443
```

#### default namespace 지정

만약, 특정 namespace에 대해서 고정해서 실행하고자 하면, default namespace를 수정해서 해당 namespace에서만 동작하도록 할 수 있다.

default namespace를 수정하기 위해서는 config에 context을 등록해줘야한다.

> kubernetes config 정보 보기

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl config view
```

아래와 같이 config 정보를 확인할 수 있다. 이때, context 정보에 default namespace를 등록하게 되면, default namespace가 해당 namespace로 변경되게 된다.
```
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.100.0.101:6443
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
kind: Config
preferences: {}
users:
- name: kubernetes-admin
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
```

> context 생성

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl config set-context blue@kubernetes --cluster=kubernetes --user=kubernetes-admin --namespace=blue
```

context을 생성하기 위해서는, cluster 정보와 user 정보를 필수로 명시해야한다.

위와 같이, blue@kubernetes 이름을 가지는 context를 생성해서, namespace를 blue로 지정해서 context를 kubernetes config에 등록해준다.

그러면 아래와 같이 config에 context가 추가되는 것을 확인할 수 있다.

![kubectl_config](/assets/images/kubernetes/kubectl_config.jpg)

> 현재 context 보기

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl config current-context
```
현재 사용중인 context 정보를 확인할 수 있다.

```
kubernetes-admin@kubernetes
```

> context switch

다른 context로 변경해보자

```shell
kubectl config use-context blue@kubernetes
```
위와 같이 context를 switch 하게 되면 아래와 같이 context 정보가 바뀌게 되고, 해당 context에 따라 default namespace도 바뀐 것을 확인할 수 있다. --> 이제는 바뀐 namespace로 명령어들이 실행되게 된다.

![kubectl_switch_context](/assets/images/kubernetes/kubectl_switch_context.png)


#### namespace 제거

namespace를 제거하게 되면, 해당 namespace에서 동작하고 있는 pod도 같이 사라지게 된다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl delete namespaces blue
```

위와 같이 blue namespace를 제거하게 되면 아래와 같이 blue namespace에서 동작 중이던 pod도 같이 사라지게 되는 것을 확인할 수 있다.

![kubectl_namespace_delete](/assets/images/kubernetes/kubectl_namespace_delete.jpg)

## yaml

사람이 읽기 쉬운 데이터 직렬화 양식 

- python과 유사하게, 들여쓰기를 기준으로 데이터의 계층을 표기하게 된다.
- key:value 형태로 관리하게 된다.
- 아래의 yaml의 경우는, kubernetes에서 사용가능한 api를 이용해서 만든 yaml이라고 보면 된다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
  namespace: blue
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports: 
        - containerPort: 80
        - containerPort: 443
```

아래와 같이 하나의 parent에 같은 child를 여러 개 명시하기 위해 아래와 같이 -를 이용해서 여러 개의 항목을 명시할 수 있다.

```yaml
ports:
  - containerPort: 80
  - containerPort: 443
```

## API version

kubernetes resource를 활용하기 위해서는 항상 API의 version을 명시해줘야한다. 만약, kubernetes resource를 생성하려고 하는데, api version이 맞지 않은 경우 제대로 실행이 되지 않는다.

각각의 Resource에 대해서 api version 정보가 아래와 같다

|Resources|Version|
|--|--|
|Deployment|appls/v1|
|Pod|v1|
|ReplicaSet|apps/v1|
|ReplicationController|v1|
|Service|v1|
|PersistentVolume|v1|

만약, 아래와 같이 API version v2 인 pod를 등록하려고 하면 어떻게 될까?

> temp.yaml

```yaml
apiVersion: v2
kind: Pod
metadata:
  name: mypod
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports: 
        - containerPort: 80
        - containerPort: 443
```

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl create -f temp.yaml 
error: resource mapping not found for name: "mypod" namespace: "" from "temp.yaml": no matches for kind "Pod" in version "v2"
ensure CRDs are installed first
```

위와 같이 api version 정보가 맞지 않다고 에러가 발생하게 된다.

### API version 정보 확인

그러면 각각의 resource에 대한 api version을 모두 외워야 하나? 그렇지 않다

아래의 명령어를 수행하게 되면 해당 resource의 api version 정보를 확인할 수 있다.

가령, pod 의 api version을 확인하고자 하면 아래와 같이 실행하면 된다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl explain pod
```

![kubectl_explain_pod](/assets/images/kubernetes/kubectl_explain_pod.jpg)


## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=Iue9TC13vPQ&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=7)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










