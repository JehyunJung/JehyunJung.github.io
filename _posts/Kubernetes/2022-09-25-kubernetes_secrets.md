---
title: "Kubernetes Secrets"
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

# Kubernetes Secrets

ConfigMap과 유사하지만 저장되는 데이터의 종류 및 저장 방식이 다르다. password, auth token, ssh key와 같은 중요한 정보를 base64를 encoding 해서 저장하게 된다.

민감하지 않는 일반 정보는 ConfigMap에 저장하고, 사용자에 민감한 데이터는 secret으로 관리한다.

## Creating Secret

kubectl create secret [Avaiable Commands] name [flags][options]

### Avaiable Commands

> docker-registry:

```sh
kubectl create secret tls my-secret --cert=path/to/cert/file --key=path/to/key/file
```
> generic

```sh
kubectl create secert docker-registry reg-secret --docker-username=tiger --docker-password=pass --docker-email=tiger@acme.com
```

> tls

ConfigMap를 만드는 것과 유사한 형식

```sh
kubectl create secret generic tls-secret --from-literal=INTERVAL=2 --from-file=./genid-web-config
```

### Practice

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get secrets
NAME         TYPE     DATA   AGE
tls-secret   Opaque   2      4s
```

> describe

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl describe secret tls-secret
Name:         tls-secret
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
INTERVAL:           1 bytes
nginx-config.conf:  216 bytes
```

> yaml format

```yaml
apiVersion: v1
data:
  INTERVAL: Mg==
  nginx-config.conf: c2VydmVyIHsKICAgIGxpc3RlbiAgIDgwOwogICAgc2VydmVyX25hbWUgIHd3dy5leGFtcGxlLmNvbTsKCiAgICBnemlwIG9uOwogICAgZ3ppcF90eXBlcyB0ZXh0L3BsYWluIGFwcGxpY2F0aW9uL3htbDsKCiAgICBsb2NhdGlvbiAvIHsKICAgICAgICByb290ICAgL3Vzci9zaGFyZS9uZ2lueC9odG1sOwogICAgICAgIGluZGV4ICBpbmRleC5odG1sIGluZGV4Lmh0bTsKICAgIH0K
kind: Secret
metadata:
  creationTimestamp: "2022-09-25T14:07:51Z"
  name: tls-secret
  namespace: default
  resourceVersion: "78433"
  uid: 5e49832f-e244-417e-883f-1731daeef19b
type: Opaque
``` 

보면, INTERVAL, nginx-config.conf의 value가 알아볼 수 없는 형태로 저장되어 있는 것을 확인할 수 있다. --> 이를 통해 secret는 data를 저장할 때, encoding 되서 저장됨을 확인할 수 있다.

생성된 secret의 type를 보면 opaque라고 되어 있는 것을 확인할 수 있는데, 이는 사용자 정의 secret임을 나타낸다.

secret에는 아래와 같은 type들이 존재한다.

![secret_type](/assets/images/kubernetes/secret_type.png)

## Using Secrets

> env 형태로 전달하기

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: genid-env-secret
spec:
  containers:
    - image: smlinux/genid:env
      name: fakeid-generator
      env:
        - name: INTERVAL
          valueFrom:
            secretKeyRef:
              name: tls-secret
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

configmap 적용방식과 유사하며, configMapKeyRef 대신에 secretKeyRef를 사용한다.

> volume mount 형태로 전달하기

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: genid-volume-secret
spec:
  containers:
    - image: smlinux/genid:env
      name: fakeid-generator
      env:
        - name: INTERVAL
          valueFrom:
            secretKeyRef:
              name: tls-secret
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
        - name: config
          mountPath: /etc/nginx/conf.d
          readOnly: true
      ports: 
      - containerPort: 80
  volumes: 
    - name: html
      emptyDir: {}
    - name: config
      secret:
        secretName: tls-secret
        items:
          - key: nginx-config.conf
            path: nginx-config.conf
```

config 파일 형태로 전달하고자 할때 사용하는 방식으로, 이 방식또한 configmap에서 다룬 방식과 유사하다. ConfigMap를 secret으로 변경해주면 된다

아래의 결과를 통해 volume Mount가 정상적으로 수행되었음을 확인할 수 있다. Secret이 container에 적용될 때는 decoding 되서 전달되기 때문에 정상적으로 보인다.

```sh
root@genid-volume-secret:/etc/nginx/conf.d# cat nginx-config.conf 
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
```

## Secret Size Limit

Secret etcd에 텍스트 형태로 데이터가 저장되기 때문에, secret value가 커지면 메모리 용량을 많이 차지하게 된다. 따라서, 1MB의 최대 용량 제한이 있다.

## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=aW2RAVnOHFY&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=35)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










