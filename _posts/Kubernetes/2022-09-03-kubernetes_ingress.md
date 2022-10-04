---
title: "Kubernetes Ingress"
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

# Kubernetes Ingress

cluster 내부의 서비스를 외부에서 사용할 수 있도록 제공하는 기능을 수행한다.

- service에 대해 외부 url 제공
- Traffic Load Balancing
- SSL 인증서 처리
- Virtual Hosting

## 동작 방식

![ingress_controller_mechanism](/assets/images/kubernetes/ingress_controller_mechanism.png)

외부 사용자가 cluster 내부의 서비스를 접근하고자 할때, ingress controller는 위와 같이 각각의 서비스에 대한 매핑을 수행해준다.

가령 Main, Login, Order Service가 있다고 했을 때,

http://www.example.com/ -> svc Main

http://www.example.com/login -> svc Login

http://www.example.com/order -> svc Order

같이 ingress rule을 설정하게 되면 사용자는 외부에서 내부 서비스를 요청하는 것이 가능하다.

## Ingress Controller 설치

[Nginx Ingress Controller 설치](https://kubernetes.github.io/ingress-nginx/deploy/#bare-metal-clusters)

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.3.0/deploy/static/provider/baremetal/deploy.yaml
```

아래의 shell을 확인해보면, ingress controller와 관련된 pod, svc가 생성된 것을 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pod -n ingress-nginx 
NAME                                        READY   STATUS              RESTARTS   AGE
ingress-nginx-admission-create-s9m8q        0/1     Completed           0          16s
ingress-nginx-admission-patch-mlbd9         0/1     Completed           0          16s
ingress-nginx-controller-58448db7f9-ffzfq   0/1     ContainerCreating   0          16s
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get svc -n ingress-nginx 
NAME                                 TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller             NodePort    10.101.243.233   <none>        80:31855/TCP,443:32050/TCP   27s
ingress-nginx-controller-admission   ClusterIP   10.96.176.3      <none>        443/TCP                      27s
```

## Ingress을 통한 Webservice 운영

![ingress_controller_practice](/assets/images/kubernetes/ingress_controller_practice.png)

### Ingress Controller 실행

위에서 생성한 yaml파일을 토대로 controller을 실행하는데, NodePort 부분만 아래와 같이 30100,30200으로 고정 등록해서 수정해서 생성한다.

```yaml
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  ports:
  - appProtocol: http
    name: http
    port: 80
    protocol: TCP
    targetPort: http
    nodePort: 30100
  - appProtocol: https
    name: https
    port: 443
    protocol: TCP
    targetPort: https
    nodePort: 30200
  selector:
    app.kubernetes.io/component: controller
    app.kubernetes.io/instance: ingress-nginx
    app.kubernetes.io/name: ingress-nginx
  type: NodePort
```

그러면 아래와 같이 ingress-nginx-controller 관련 component들이 실행되는 것을 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get all -n ingress-nginx 
NAME                                            READY   STATUS      RESTARTS   AGE
pod/ingress-nginx-admission-create-qnxgv        0/1     Completed   0          4m17s
pod/ingress-nginx-admission-patch-gmzk5         0/1     Completed   1          4m17s
pod/ingress-nginx-controller-58448db7f9-mpkfd   1/1     Running     0          4m17s

NAME                                         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
service/ingress-nginx-controller             NodePort    10.96.101.25    <none>        80:30100/TCP,443:30200/TCP   4m17s
service/ingress-nginx-controller-admission   ClusterIP   10.109.88.165   <none>        443/TCP                      4m17s

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/ingress-nginx-controller   1/1     1            1           4m17s

NAME                                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/ingress-nginx-controller-58448db7f9   1         1         1       4m17s

NAME                                       COMPLETIONS   DURATION   AGE
job.batch/ingress-nginx-admission-create   1/1           5s         4m17s
job.batch/ingress-nginx-admission-patch    1/1           5s         4m17s
```

### namespace switch
작업의 편의를 위해 default namespace를 ingress-nginx으로 고정해서 수행하도록 한다

```shell
#context 생성
kubectl config set-context ingress@kubernetes --cluster=kubernetes --user=kubernetes-admin --namespace ingress-nginx
#생성한 context 사용
kubectl config use-context ingress@kubernetes 
```
default namespace를 고정하는 과정은 아래의 글을 참조하도록 한다.
[switching_namespace]({% post_url 2022-08-26-kubernetes_architecture %})

### Service 실행

> docker container image pull

```shell
docker pull smlinux/marvel
docker pull smlinux/pay
```
#### Main Service

> marvel-home.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: 
  name: marvel-home
spec:
  replicas: 1
  selector:
    matchLabels:
      name: marvel
  template:
    metadata:
      labels:
        name: marvel
    spec:
      containers:
        - name: marvel-container
          image: smlinux/marvel-collection
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata: 
  name: marvel-service
spec:
  ports:
    - port: 80
      protocol: TCP
      targetPort: 80
  selector:
    name: marvel
```

#### Pay Service

> pay.yaml

```yaml
apiVersion: v1
kind: ReplicationController
metadata: 
  name: pay-rc
spec:
  replicas: 3
  selector:
    app: pay
  template:
    metadata: 
      labels:
        app: pay
    spec:
      containers:
        - name: marvel-pay
          image: smlinux/pay
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata: 
  name: pay-service
spec:
  ports:
    - port: 80
      protocol: TCP
      targetPort: 8080
  selector:
    app: pay
```


위의 yaml 파일을 토대로 생성하게 되면 아래와 같이 component들이 생성되는 것을 확인할 수 있다.

![marvel_components](/assets/images/kubernetes/marvel_components.jpg)

### Ingress Rule 설정

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: marvel-ingress
  annotations:
    kubernetex.io/ingress.class : "nginx"
    nginx.ingress.kubernetes.io/rewrite-target: /

spec: 
  rules:
  - http:
      paths:
        - path: /
          pathType: Prefix
          backend: 
            service:
              name: marvel-service
              port:
                number: 80
        - path: /pay
          pathType: Prefix
          backend: 
            service:
              name: pay-service
              port:
                number: 80

```

위의 ingress controller을 실행해보면 아래와 같이, [/,/pay]에 대한 서비스 경로를 제공하고 있음을 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes/webdemo$ kubectl describe ingress marvel-ingress 
Name:             marvel-ingress
Labels:           <none>
Namespace:        ingress-nginx
Address:          
Ingress Class:    <none>
Default backend:  <default>
Rules:
  Host        Path  Backends
  ----        ----  --------
  *           
              /      marvel-service:80 (10.36.0.4:80)
              /pay   pay-service:80 (10.36.0.5:8080,10.36.0.6:8080,10.44.0.3:8080)
Annotations:  <none>
Events:       <none>
```

### WebService 접속

아래와 같이 NodePort을 통한 접속 요청이 원할하게 됨을 확인할 수 있다.

> node1에 대해 접속

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes/webdemo$ curl 10.100.0.102:30100
<html>
<head>
  <title>marvel heroes</title>
</head>
<body>
  <center>
  <img src="images/marvel_logo.png"><br>
  <p style="color:red;">Marvel Entertainment/Marvel Studios</p><br>
  <img src="images/category.png"><br>
  <a href="http://211.253.8.13/pay">[payment]</a></center>

  </center>
</body>
</html>
toojey-master@toojeymaster-VirtualBox:~/kubernetes/webdemo$ curl 10.100.0.102:30100/pay
PAYMENT Page
```

> node 2에 대한 접속

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes/webdemo$ curl 10.100.0.104:30100
<html>
<head>
  <title>marvel heroes</title>
</head>
<body>
  <center>
  <img src="images/marvel_logo.png"><br>
  <p style="color:red;">Marvel Entertainment/Marvel Studios</p><br>
  <img src="images/category.png"><br>
  <a href="http://211.253.8.13/pay">[payment]</a></center>

  </center>
</body>
</html>
toojey-master@toojeymaster-VirtualBox:~/kubernetes/webdemo$ curl 10.100.0.104:30100/pay
PAYMENT Page
```








## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=y5-u4jtflic&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=28)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










