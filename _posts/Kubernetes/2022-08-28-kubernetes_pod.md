---
title: "Kubernetes Pod"
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

# Kubernetes Pod

## Pod란, 무엇인가?

> Docker Container

![docker_container](/assets/images/kubernetes/docker_container.png)

docker에서는 위와 같이 application 하나에 대해서, container 형태로 구성해서 실행하는 것이 가능하다.

> Kubernetes Pod

kubernetes 시스템에서 container을 표현하는 k8s API의 최소단위를 의미한다. pod을 이용해서 container을 실행하게 된다. pod 안에는 container 하나 또는 여러 개를 포함해서 실행할 수 있다.

![kubernetes_pod](/assets/images/kubernetes/kubernetes_pod.png)

그래서 이전에 yaml를 통해 pod을 생성하는 과정을 살펴보면, nginx.yaml 파일 안에 container가 포함되어 있는 것을 확인할 수 있다.

>nginx.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  namespace: blue
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports: 
        - containerPort: 80
          protocol: TCP
```

## Pod 생성하기

> kubectl 기반

```shell
kubectl create web1 image=nginx:1.14 --port 80
```
> yaml 파일 기반

```shell
kubectl create -f nginx.yaml
```

> 생성 결과

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods
NAME        READY   STATUS    RESTARTS   AGE
nginx-pod   1/1     Running   0          2m52s
web1        1/1     Running   0          5m5s
```

+ 리눅스의 watch 명령어를 이용하게 되면 2초마다 명령어를 반복해서 실행시켜주게 된다. 보통 상태 변화를 확인하기 위해 watch 명령어를 함께 사용해주기도 한다.

> watch

```shell
watch kubectl get pods
```

### Mutiple Container Pod 생성하기

#### Pod 생성 

이전에는 container가 1개인 pod를 생성해보았다면, multiple container가 구성되어 있는 pod를 생성해보자

보통, 웹서버 + 로그 분석 서버, web-server, web-agent와 같이 여러 개의 container가 유기적인 관계를 형성하는 경우 multiple container을 구성한다.

> pod-multi.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: multipod
spec:
  containers:
    - image: nginx:1.14
      name: nginx-container
      ports: 
        - containerPort: 80
    - image: centos:7
      name: centos-container
      command:
        - sleep
        - "10000"
```

> Single vs Multi

![single_multi_comparison](/assets/images/kubernetes/single_multi_comparison.jpg)

보면 READY 상태의 숫자가 다른 것을 확인할 수 있는데, 이를 통해 READY 컬럼의 값은 container의 갯수임을 확인할 수 있다.

#### multiple container pod의 container에 접속해보기

1. nginx container

kubectl exec 명령어를 이용해서, container에 접속을 할 수 있다.

```shell
kubectl exec multipod -c nginx-container -it -- /bin/bash
```
|options|values|description|
|--|--|--|
|-c|container|특정 컨테이너|
|--it|interactive|가상의 터미널 생성|
|--|/bin/bash|셸실행|

위의 명령어를 통해, multipod pod 안에서 nginx-container container에 접속하는 것을 확인할 수 있다.

이 부분은 이전 시간의 nginx pod의 메인 홈페이지를 변경해보는 과정을 통해 알아보았다.

2. centos container

이번에는 centos container에 접속해보자

```shell
kubectl exec multipod -c centos-container -it -- /bin/bash
```

```shell
[root@multipod /]# ps -ef
UID          PID    PPID  C STIME TTY          TIME CMD
root           1       0  0 08:21 ?        00:00:00 sleep 10000
root           6       0  0 08:33 pts/0    00:00:00 /bin/bash
root          20       6  0 08:33 pts/0    00:00:00 ps -ef
```

그러면, 만약에 해당 centos-container에서 curl localhost:80을 실행하면 어떻게 될까?, ps-ef 를 통해 실행되는 프로세스를 확인해보면 웹서버는 없는 것을 확인할 수 있다. 그래서 80 포트로 요청을 보내더라도 아무런 반응이 없을 것 같다 하지만 아래와 같이 실행해보게 되면 nginx 서버가 응답 페이지를 보내게 된다.

```shell
[root@multipod /]# curl localhost:80
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```

**이는, centos container와 nginx container가 같은 pod 내에 구성되어 같은 ip를 할당받아서 실행되기 때문이다.**
따라서, localhost:80으로 요청을 보내게 되면 이는 nginx container로 요청을 보내는 것과 같은 결과를 보이게 되는 것이다.

### Pod 로그 출력

#### single container pod

```shell
kubectl logs web1
```

위와 같이 실행해보게 되면, container에 대해 아무런 작업 요청을 수행하지 않는 경우 로그가 생성되지 않는다.

따라서 아래와 같이 해당 container에 요청을 보내보자(kubectl get pods -o wide를 통해 해당 pod의 ip를 알아낸다.)

1. 로그 생성

```shell
curl 10.44.0.4
curl 10.44.0.4
```

2. 로그 출력

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl logs web1
10.32.0.1 - - [28/Aug/2022:08:42:05 +0000] "GET / HTTP/1.1" 200 612 "-" "curl/7.68.0" "-"
10.32.0.1 - - [28/Aug/2022:08:42:07 +0000] "GET / HTTP/1.1" 200 612 "-" "curl/7.68.0" "-"
```

#### muliti-container pod

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl logs multipod
Defaulted container "nginx-container" out of: nginx-container, centos-container
127.0.0.1 - - [28/Aug/2022:08:33:57 +0000] "GET / HTTP/1.1" 200 612 "-" "curl/7.29.0" "-"
```

container을 명시하지 않으면 default container로 설정된 nginx container에 대한 로그를 출력하게 된다.

특정 container의 로그를 출력하기 위해서는 이전에 container 접속 방식하는 방법과 동일하게 -c 옵션을 이용한다.

> centos container 로그 출력

```shell
kubectl logs multipod -c centos-container
```

## Kubernetes Pod Flow

![kubernetes_pod_flow](/assets/images/kubernetes/kubernetes_pod_flow.jpg)

그러면, 실제 위와 같이 동작하는 지 shell을 통해 살펴보자.

이를 위해, 마스터 노드의 세션을 2개 생성하자.

1. 하나의 세션에서는 pod의 상태 정보 출력

```shell
kubectl get pods -o wide --watch
```
wide의 watch 옵션을 이용해서 pod 정보를 출력하게 되면 한 줄 단위로 계속해서 보여주게 된다. (리눅스의 watch가 아닌, kuberntes에서 지원해주는 watch option이다.)

2. 하나의 세션에서는 pod 생성 및 종료 과정 진행

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl create -f pod-nginx.yaml 
pod/nginx-pod created
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl delete pod nginx-pod
pod "nginx-pod" deleted
```

> Results

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods -o wide --watch
NAME        READY   STATUS    RESTARTS   AGE   IP       NODE     NOMINATED NODE   READINESS GATES
nginx-pod   0/1     Pending   0          0s    <none>   <none>   <none>           <none>
nginx-pod   0/1     Pending   0          0s    <none>   toojeynode2-virtualbox   <none>           <none>
nginx-pod   0/1     ContainerCreating   0          0s    <none>   toojeynode2-virtualbox   <none>           <none>
nginx-pod   1/1     Running             0          1s    10.36.0.1   toojeynode2-virtualbox   <none>           <none>
nginx-pod   1/1     Terminating         0          26s   10.36.0.1   toojeynode2-virtualbox   <none>           <none>
nginx-pod   0/1     Terminating         0          27s   10.36.0.1   toojeynode2-virtualbox   <none>           <none>
nginx-pod   0/1     Terminating         0          27s   10.36.0.1   toojeynode2-virtualbox   <none>           <none>
nginx-pod   0/1     Terminating         0          27s   10.36.0.1   toojeynode2-virtualbox   <none>           <none>
```

위의 그림에서 설명한 Pod flow의 과정을 통해 pod가 생성 및 제거된다.

## Self-Healing 

### Liveness Probe

> nginx-pod-liveness.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
    - image: nginx:1.14
      name: nginx-container
      livenessProbe:
        httpGet:
          path: /
          port: 80
```

livenessProbe을 설정해서, 해당 pod에 대해 self-healing 기능을 활용한다. 
웹 기반의 서버에 대해서, 해당 포트(80)에 대한 요청 시도를 통해 해당 서비스가 제대로 동작 중인 지 여부를 점검할 수 있도록 한다.

응답이 제대로 오면 건강한 pod임을 의미하게 된다.

그러면, kubernetes에서는 어떠한 flow로 해당 서버에 대한 건강검진(즉, 제대로 동작하고 있는 지 여부를 검사할까?)

### LivenessProbe Mechanism

아래의 메카니즘을 토대로, 주기적으로 검사를 진행해서, 만약 제대로 동작하고 있지 않은 컨테이너가 있으면, 해당 컨테이너는 docker hub으로 부터 새로운 이미지를 다시 받아와서 새롭게 컨테이너를 시작해주는 과정을 통해 self-healing을 제공한다.(**pod를 재시작하는 것이 아닌, 컨테이너를 재시작 하는 것이므로, IP는 유지된다.**)

> httpGet

지정한 ip, port, path에 대해 HTTP GET 요청을 보내서, 해당 컨테이너가 응답하는 지 여부를 검사하게 된다. -> 응답코드가 200이 나오면 정상임을 의미한다.

```yaml
livenessProbe:
  httpGet:
    path: /
    port: 80
```

> tcpSocket

지정한 포트에 TCP 연결을 시도한다. (ex: sshd)

```yaml
livenessProbe:
  tcpSocket:
    port: 22
```

> exec

container에 명령어 실행에 따른 검사 (ex: 특정 서버에 대해 명령어 수행 여부에 따른 검사)

```yaml
livenessProbe:
  exec:
    command:
      - ls
      - /data/file
```

### LivenessProbe 생성

위의 nginx-pod-liveness.yaml 파일을 통해 container을 생성하자

그리고, kubectl desribe를 이용해서 해당 pod에 대한 상세정보를 확인해보면 아래와 같이 liveness관련 property가 추가 되는 것을 확인할 수 있다.

![liveness_probe](/assets/images/kubernetes/liveness_probe.jpg)

또한, 우리가 yaml 파일을 통해서 지정한 path,port 이외에도 기본적으로 생성되는 property가 있는데, 이는 yaml 파일에 지정해주게 되면 우리가 원하는 값으로 변경해서 실행할 수 있다.

|Arguments|Description|
|--|--|
|InitialDelaySeconds|health-check을 시작하기 까지의 delay|
|periodSeconds|health-check 반복 주기|
|timeoutSeconds|최대 응답 대기 시간|
|successThreshold|성공으로 인정하기 까지의 응답 개수|
|failureThreshold|연속해서 응답이 없으면 실패로 간주|

위의 argument을 모두 외워야하냐? 그렇지는 않다.

```shell
kubectl get pod nginx-pod-liveness -o yaml
```

위의 명령어와 같이 yaml 형태로 출력해달라고 하면, 해당 동작하는 pod의 상태를 보여주게 되는데, 아래와 같이, liveness 관련 부분이 설정되어 있는 것을 확인할 수 있다. 이와 같이, 이러한 yaml 형태를 파일 형태로 저장해서 template로 활용하도록 한다.

![describe_liveness_probe](/assets/images/kubernetes/describe_liveness_probe.jpg)

### Practice

> pod-liveness.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: liveness-pod
spec:
  containers:
    - image: smlinux/unhealthy
      name: unhealthy-container
      ports:
        - containerPort: 8080
          protocol: TCP
      livenessProbe:
        httpGet:
          path: /
          port: 8080
```

smlinux/unhealthy 이미지는 처음 5번의 요청에 대해서는 정상 응답을 반환하지만, 이후 부터는 오류를 반환하게 된다. 따라서, 해당 이미지를 통해 self-healing을 테스트 해볼 수 있다.(periodSeconds=10)가 기본값으로 설정되어 있기 때문에 50초이후부터는 실패 응답을 반환받게 된다.

위의 yaml을 토대로 pod을 생성해보자

1. 정상적으로 container가 생성된 것을 확인할 수 있다.

![self_healing1](/assets/images/kubernetes/self_healing1.jpg)

2. 50초 이후부터 응답이 실패하며, 3번의 응답 실패 이후 컨테이너가 재시작 된다.

![self_healing2](/assets/images/kubernetes/self_healing2.jpg)

중점으로 볼것
- RESTARTS 횟수가 증가한다는 점
- IP가 유지된다는 점(즉, container만 재시작함)

3. 컨테이너가 재시작하고, 다시 응답 실패가 3번이 발생하게 되면, 다시 컨테이너 재시작한다.

![self_healing3](/assets/images/kubernetes/self_healing3.jpg)

self-healing은 위와 같이 동작하는 것을 확인할 수 있다.

## Init Container

![init_container](/assets/images/kubernetes/kubernetes_init_container.jpg)

위와 같이 pod에 init container을 구성하게 되면, init container가 정상적으로 동작을 수행하기 전까지는 main container을 실행하지 않는다. 이 처럼, 메인 로직을 수행하기 전에 사전에 환경을 구성해야하는 경우 init-container 개념을 이용한다.

> myapp-pod.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app.kubernetes.io/name: MyApp
spec:
  containers:
  - name: myapp-container
    image: busybox:1.28
    command: ['sh', '-c', 'echo The app is running! && sleep 3600']
  initContainers:
  - name: init-myservice
    image: busybox:1.28
    command: ['sh', '-c', "until nslookup myservice.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for myservice; sleep 2; done"]
  - name: init-mydb
    image: busybox:1.28
    command: ['sh', '-c', "until nslookup mydb.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for mydb; sleep 2; done"]
```

### Practice

#### Pod Create

위의 yaml에 따르면 init-conatiner에서는 아래의 명령어들을 수행하게 되는데, 해당 명령어들은 특정 서비스가 완료되기 전까지 무한 루핑을 진행하게 된다. 해당 서비스가 올라와야, 정상적으로 명령어 실행이 완료되고, 이에 따라 init-container 실행도 완료된다.

> init-myservice

```shell
until nslookup myservice.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for myservice; sleep 2; done
```

> init-mydb

```shell
until nslookup mydb.$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace).svc.cluster.local; do echo waiting for mydb; sleep 2; done
```

![get_pod_init_container](/assets/images/kubernetes/init_container_get_pods.png)

위와 같이, init container의 실행을 대기하는 것을 확인할 수 있다.

#### init services for init container

그러면, init container가 정상적으로 실행될 수 있도록, container에 서비스들을 실행해보자.

우선, myservice를 먼저 실행해보자

> myservice-yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myservice
spec:
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9376
```

```shell
kubectl create -f myservice-yaml
```

해당 서비스를 정상적으로 실행하고 나게 되면 아래와 같이 init-container 2개중 1개가 running 되는 것을 알 수 있다.


![init_myservice](/assets/images/kubernetes/init_myservice.jpg)

마찬가지로, mydb service에 대해서도 실행을 해보자

> mydb-yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mydb
spec:
  ports:
  - protocol: TCP
    port: 80
    targetPort: 9377
```

```shell
kubectl create -f mydb-yaml
```

init container가 모두 정상적으로 실행되고 나니, main-container가 정상적으로 실행되는 것을 확인할 수 있다.

![init_mydb](/assets/images/kubernetes/init_mydb.jpg)

## Infra Container

```shell
kubectl run webserver --image=nginx:1.14 --port 80
```

pod를 생성하게 되면 아래의 그림처럼 pod 에는 container가 1개만 동작하는 것으로 알고 있다.

![pod_container](/assets/images/kubernetes/pod_container.jpg)

하지만, 실제로보면 기본으로 생성되는 container가 있는데, 이를 pause container라고 하며 이는 infra container이다. 이 container는 pod에 대한 infra 정보를 관리하게 된다. ip, port와 같은 정보가 이에 해당된다.

![pause_container](/assets/images/kubernetes/pause_container.jpg)

실제로 pause container가 생성되는 지 알아보기 위해, 해당 pod를 실행시키고 있는 node에 접속해서, 확인해본다.

> ps 명령어를 통해 실행 중인 컨테이너 확인

```shell
ps aux
```

![ps_aux_pause_container](/assets/images/kubernetes/ps_aux_pause_container.png)

## Static Pod

pod는 기본적으로 control plane, master node에 kubectl 명령어를 이용해서 pod 생성 요청을 통해 생성된다. 이에 따라, api 서버에서 kubectl 명령어를 받아서, etcd에 저장되어 있는 정보에 따라 scheduler가 적절한 worker node를 할당해서 pod를 실행하게 된다.

하지만, static pod는 이와 다르게 동작하게 된다. 우선, api 서버로의 요청을 진행하지 않는다. 

worker node 별로 kubelet이 관리하는 static directory가 있는데, 해당 directory에 yaml 파일을 추가하게 되면, kubelet는 이를 보고 static pod 를 생성하게 된다. yaml 파일을 삭제하게 되면 저절로 pod를 삭제한다.

정리해보면,api 서버 없이 kubelet 데몬에 의해서 관리되는 pod를 static pod라고 한다.

> static directory

/var/lib/kubernetes/config.yaml 파일을 살펴보게 되면, kubernetes의 환경설정을 확인할 수 있다.

```yaml
toojey-node1@toojeynode1-VirtualBox:~$ sudo cat /var/lib/kubelet/config.yaml
apiVersion: kubelet.config.k8s.io/v1beta1
...
staticPodPath: /etc/kubernetes/manifests
...
```

해당 파일을 자세히 보면, staticPodPath라는 변수에 대한 부분이 있는데, 이게 해당 노드에 설정되어 있는 static directory이다.

### static pod 생성 예제

node1의 /etc/kubernetes/manifests 폴더에 아래의 yaml 파일을 추가해보자

> nginx.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports: 
        - containerPort: 80
          protocol: TCP
```

해당 파일을 추가하는 것만으로도 아래의 get-pod 결과를 살펴보면 pod가 node1에서 실행되는 것을 확인할 수 있다. 또한, 해당 파일을 삭제하게 되면 pod가 terminate 되는 것도 확인할 수 있다.

![static_pod_node1](/assets/images/kubernetes/static_pod_node1.png)

![static_pod_master](/assets/images/kubernetes/static_pod_master_node.png)

### master의 static directory

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ ls /etc/kubernetes/manifests/
etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml
```

master node의 static directory를 보면 위와 같이 yaml 파일들을 확인할 수 있는데, 이들은 master node에서 구동되는 component이다. 이를 통해, master node의 component들이 static pod 형태로 구동되는 것을 확인할 수 있다.

## Pod Resource 할당

1. limit (최대 리소스양)

pod도 cpu,memory와 같은 system resource를 할당받아서 사용한다. 만약, resource limit을 제한하지 않게 되면, 특정 pod는 system resource를 모두 다 사용하는 경우가 발생할 수 있다. limit는 이러한 시스템 자원에 대해 최대 사용량을 지정하는 것이다.

2. request (최소 리소스양)

이는, pod를 실행할 worker node를 할당하게 될때, system resource에 대한 최소 여유량을 정의하는 것이다. 이는, system resource가 부족한 worker node에 pod를 배치 하는 것을 방지하는 역할을 한다. 최소 자원 요구량을 request 함으로써, scheduler는 worker node 중에 해당 요구량 이상의 자원을 가지고 있는 worker node를 찾아서 pod를 해당 노드에 할당하게 된다.

### Kubernetes resource 단위 표현법

- Memory
memory는 Ki/Mi/Gi 단위로 표현하게 된다.

- Cpu
cpu는 core 개수로 표현하게 된다.

![cpu_resource](/assets/images/kubernetes/cpu_resource.jpg)

코어 단위로 표현하게 되는데, 1 core는 1000 mili core이다.

cpu는 코어 개수, 혹은 mili core 단위로 사용한다.

### Practice

> nginx-resource.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod-resource
spec:
  containers:
    - image: nginx:1.14
      name: nginx
      ports: 
        - containerPort: 80
          protocol: TCP 
      resources:
        requests:
          cpu: 200m
          memory: 250Mi
        limits:
          cpu: 1
          memory: 500Mi
```

위의 yaml를 토대로 pod를 생성해서 describe를 통해 pod 정보를 살펴보면 아래와 같이 resource 정보가 할당된 것을 확인할 수 있다.

![describe_resources](/assets/images/kubernetes/describe_resources.jpg)

만약, system resources를 넘어서도록 system resourec를 설정해서 pod를 생성하면 어떻게 될까?

> nginx-resource-over.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod-over-resources
spec:
  containers:
    - image: nginx:1.14
      name: nginx-container
      ports: 
        - containerPort: 80
          protocol: TCP 
      resources:
        requests:
          cpu: 4
          memory: 250Mi

```

아래와 같이 pod를 실행할 node를 찾지 못해서, 계속해서 pending 상태를 유지하게 된다.

```shell
NAME                       READY   STATUS    RESTARTS   AGE   IP       NODE     NOMINATED NODE   READINESS GATES
nginx-pod-over-resources   0/1     Pending   0          0s    <none>   <none>   <none>           <none>
nginx-pod-over-resources   0/1     Pending   0          0s    <none>   <none>   <none>           <none>
```

## Pod 환경 변수

container을 실행하게 되면, 해당 container 내부에는 환경변수를 가지고 있다. 이는 기존의 Linux, Windows에서 저장하는 환경변수와 동일한 개념이다. 우리는 pod를 실행하게 될 때, yaml 파일에 환경변수를 지정함으로써, 새로운 환경변수를 추가할 수 있고, 또는 기존의 환경변수의 값을 재정의할수도 있다.

> nginx-env

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod-env
spec:
  containers:
    - image: nginx:1.14
      name: nginx-container
      ports: 
        - containerPort: 80
          protocol: TCP 
      env:
      - name: MYVAR
        value: "testValue"
```
아래와 같이 해당 container에 접속해서, env 목록을 살펴보면 위에서 설정한 환경변수가 추가되어 있는 것을 확인할 수 있다.

![env_list](/assets/images/kubernetes/env_list.jpg)

## Pod Design Pattern

![pod_design_pattern](/assets/images/kubernetes/pod_design_pattern.jpg)

> sidecar

웹서버에서 만들어낸 로그 정보를 sidecar container로 넘겨줘서, 해당 sidecar container는 로그 정보를 분석하게 된다. 즉, 하나의 container는 다른 container가 만들어낸 정보를 이용하게 된다. 이렇게 되면 두 개의 container는 유기적으로 동작하기 때문에, 하나의 container는 단독으로 동작할 수 없다.

> adapter

외부의 리소스 정보를 받아서, 웹서버 container로 전달한다. 외부의 정보를 받아서 다른 컨테이너에 넘겨주는 adaptor 역할을 수행한다. 가령, 정보의 소스마다 포맷이 다른데, 이러한 포맷을 일관성 있게 변환해주게 되면, webserver에서는 해당 포맷 대로 데이터를 처리할 수 있게 된다.

> ambassador

웹서버에서 생성된 데이터(고객 데이터??)를 넘겨서 캐시 형태로 저장시키는 형태이다. 즉 하나의 컨테이너에서 발생한 정보를 받아서 외부에 분배해서 저장하는 패턴이다. ambassador container을 통해 외부로 데이터를 전달하게 되는 것이다. ambassador container는 main container에 대한 네트워크 연결을 전담하는 프록시 역할을 수행하게 된다.

[link](https://seongjin.me/kubernetes-multi-container-pod-design-patterns/)

## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=0rYt3PcggzA&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=10)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










