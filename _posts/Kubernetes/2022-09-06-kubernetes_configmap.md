---
title: "Kubernetes ConfigMap"
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

# Kubernetes ConfigMap

컨테이너 동작과정에서 필요한 구성 정보들을 한 곳에서 관리할 수 있도록 한다. 만약, 각각의 컨테이너에서 개별적으로 구성파일을 관리하게 되면, 구성 정보를 수정하기 위해 개별적인 수정이 요구되는데, 컨테이너 갯수가 많아지게 되면 수정해야될 부분이 많아지게 된다.

변경의 여지를 한 곳으로 모으는 역할을 수행하게 된다. SRP 느낌?

## ConfigMap 생성

```shell
kubectl create configmap [NAME] [--from-file=source] [--from-literal=key=value]
```
|options|descriptions|
|--|--|
|--from-file|텍스트 파일의 내용을 value로 지정하기 위해 사용, 만약 key를 명시하지 않으면 텍스트 파일의 이름이 key가 된다.|
|--from-literal|key=value 형태로 저장하기 위해 사용되는 옵션|

### Practice
아래와 같이 config파일을 구성하고 해당 config 파일을 configmap에 구성해보자

> config.conf

```
server {
    listen   80;
    server_name  www.example.com;

    gzip on;
    gzip_types text/plain application/xml;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

```

```shell
kubectl create configmap test-config --from-literal=INTERVAL=2 --from-literal=OPTION=body --from-file=config.dir/
```

아래와 같이 configmap이 제대로 생성된 것을 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl describe configmaps test-config 
Name:         test-config
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
INTERVAL:
----
2
OPTION:
----
body
nginx-config.conf:
----
server {
    listen   80;
    server_name  www.example.com;

    gzip on;
    gzip_types text/plain application/xml;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }


BinaryData
====

Events:  <none>
```

#### 특정 Container에 configmap 일부분 적용해보기

>smlinux/genid:env container

```shell
#기본 옵션
#INTERVAL=5
#OPTION STONE
do
  /usr/bin/rig | /usr/bin/boxes -d $OPTION > /webdata.index.html
  sleep $INTERVAL
done
```
위의 container는 INTERVAL 마다 fake id를 만든 rig 명령어가 반복해서 실행되는 구조이다.

위의 container image에 대해 아래와 같이 pod를 구성해서 configmap의 구성 정보를 환경변수로 전달하도록 한다. 그렇게 하면 configmap의 값을 이용해서 해당 container의 환경변수 정보로 등록할 수 있다.

> genid

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: genid-stone
spec:
  containers:
    - image: smlinux/genid:env
      name: fakeid
      env:
        - name: INTERVAL
          valueFrom:
            configMapKeyRef:
              name: test-config
              key: INTERVAL
      volumeMounts:
        - name: html
          mountPath: /webdata
    - image: nginx:1.14
      name: web-server
      volumeMounts:
        - name: html
          mountPath: /usr/share/nginx/html
          readOnly: true
      ports: 
      - containerPort: 80
  volumes: 
    - name: html
      emptyDir: {}
```

|propery|description|
|--|--|
|valueFrom|환경변수의 값의 source 명시|
|configMapKeyRef|configmap의 정보 등록|


그런 다음, 해당 container을 curl 명령어를 통해 접속 시도를 하는 경우 매 2초마다 fake id를 출력하는 것을 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.44.0.1
+-----------------+
| Beryl Delgado   |
| 436 Sharon Rd   |
| Ames, IA  50010 |
| (515) xxx-xxxx  |
+-----------------+
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.44.0.1
+----------------------+
| Dominick Smith       |
| 55 Brandy Run        |
| Sunnyvale, CA  94086 |
| (408) xxx-xxxx       |
+----------------------+
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ curl 10.44.0.1
+-------------------+
| Tim Combs         |
| 928 Beley Rd      |
| Albany, NY  12212 |
| (518) xxx-xxxx    |
```

#### 특정 Container에 configmap 전체 적용해보기

> genid-whole

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: genid-boy
spec:
  containers:
    - image: smlinux/genid:env
      name: fakeid
      envFrom:
        - configMapRef:
            name: test-config
      volumeMounts:
        - name: html
          mountPath: /webdata
    - image: nginx:1.14
      name: web-server
      volumeMounts:
        - name: html
          mountPath: /usr/share/nginx/html
          readOnly: true
      ports: 
      - containerPort: 80
  volumes: 
    - name: html
      emptyDir: {}
```

전체를 적용하고자 할때는 env 부분을 envFrom으로 수정한다.

해당 container의 env을 확인해보면 configmap의 정보가 모두 환경변수로 등록된 것을 확인할 수 있다.

![config_map_whole](/assets/images/kubernetes/config_map_whole.jpg)

#### ConfigMap을 container에 volume 마운트 

![config_map_volume_mount](/assets/images/kubernetes/config_map_volume_mount.png)

config 파일 형태로 pod에 전달해서 container의 volume에 마운트 시키는 작업도 수행할 수 있다.

> genid-volume

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: genid-volume
spec:
  containers:
    - image: smlinux/genid:env
      name: fakeid
      envFrom:
        - configMapRef:
            name: test-config
      volumeMounts:
        - name: html
          mountPath: /webdata
    - image: nginx:1.14
      name: web-server
      volumeMounts:
        - name: html
          mountPath: /usr/share/nginx/html
          readOnly: true
        - name: config
          mountPath: /etc/nginx/conf.d
          readOnly: true
      ports: 
      - containerPort: 80
  volumes: 
    - name: html
      emptyDir: {}
    - name: config
      configMap:
        name: test-config
        items:
          - key: nginx-config.conf
            path: nginx-config.conf
```

위와 같이 config을 구성하게 되면 nginx-config.conf 가 /etc/nginx.conf.d로 volume mount 되게 된다.

해당 container에 접속해서 확인해보면, config 정보가 추가된 것을 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods
NAME           READY   STATUS    RESTARTS   AGE
genid-boy      2/2     Running   0          3h16m
genid-stone    2/2     Running   0          3h25m
genid-volume   2/2     Running   0          4s
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl exec genid-volume -c web-server -it -- /bin/bash
root@genid-volume:/# cd /etc/nginx/conf.d/
root@genid-volume:/etc/nginx/conf.d# ls
nginx-config.conf
root@genid-volume:/etc/nginx/conf.d# cat nginx-config.conf 
server {
    listen   80;
    server_name  www.example.com;

    gzip on;
    gzip_types text/plain application/xml;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }
}
root@genid-volume:/etc/nginx/conf.d# 

```

## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=b457Nrk9GKk&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=28)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










