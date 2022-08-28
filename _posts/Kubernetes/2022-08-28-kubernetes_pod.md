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


## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=0rYt3PcggzA&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=10)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










