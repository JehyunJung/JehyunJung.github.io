---
title: "Kubernetes Authentication"
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
# Kubernetes Authentication

쿠버네티스의 모든 명령어는 인증된 사용자만 사용할 수 있도록 한다.

```sh
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
```

현재 동작중인 context을 보면, kubernetes-admin 계정으로 모든 명령어들을 실행하고 있음을 알 수 있다.
쿠버네티스에서는 해당 유저의 진위 여부를 파악하기 위해 인증서를 확인하는 데, 

~/.kube/config 파일을 확인하면 kubernetes-admin의 인증서가 포함되어 있음을 확인할 수 있다.

![kubernetes_admin_certificate](/assets/images/kubernetes/kubernetes_admin_certificate.jpg)

쿠버네티스는 authentication 이외에도 authorization, admission control의 작업 과정을 거쳐서 API에 대한 접근을 제어하게 된다.

![kubernetes_command_flow](/assets/images/kubernetes/kubernetes_command_flow.jpg)

## Authentication

API 인증 작업이 필요한 대상으로는 일반 사용자 및 그룹이 있고, pod 또한 시스템에 대한 요청에 필요한 경우 Service Account을 통해 인증 기반의 API 사용을 진행한다.

kubernetes-admin는 쿠버네티스 시스템의 모든 영역에 접근하는 최고 권한 사용자로, 아무 한테 admin 권한을 할당해서는 안된다.

외부 사용자에게 시스템 제어가 가능하도록 설정하기 위해서는, 특정 권한만 부여한 유저를 새로 생성해야한다.

## User Create 

### Create Certificate

우선 개인키와 인증서 요청 파일(CSR) 생성작업을 진행한다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ openssl genrsa -out myuser.key 2048
Generating RSA private key, 2048 bit long modulus (2 primes)
......+++++
.................................+++++
e is 65537 (0x010001)
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ openssl req -new -key myuser.key -out myuser.csr -subj "/CN=myuser"
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ ls
myuser.csr  myuser.key
```

### Create Certficate Signing Results

```sh
cat myuser.csr | base64 | tr -d "\n"
```
위의 명령어를 통해 출력된 인증서 정보를 토대로 아래의 yaml 파일의 request 정보에 삽입한다.

>csr-myuser.yaml

```yaml
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: myuser
spec:  request: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ1ZqQ0NBVDRDQVFBd0VURVBNQTBHQTFVRUF3d0diWGwxYzJWeU1JSUJJakFOQmdrcWhraUc5dzBCQVFFRgpBQU9DQVE4QU1JSUJDZ0tDQVFFQXc0aGdGOE92TUJ4VmpuMUFzOVRsMklJRkl6TUpYUTh3WmtobHRoWlg0M3l1CmxMOHlCWkk0dHlmM3ZTQk5jMWZDTDhyb3dESlQ3RGJ0Y2FYS3lRTi9xOTBSVGlMclE3ZFFET09FN2R2aXpwKzAKSjQ2dG1oQ1F0Z0c1djh5Q04zVFh4Tngvc0tlYzg1TTg4aXVRbytwOUh3SElEcUNRMGJNcy9CeE1vYTg0aEJnSQp3cXZUV0dRaklidXBmYm1PYkRhZWVoa0RrZHhOSEFqUzRRUHU0VkdGekVKMytQcnFLc2VJN0NzcUY2cHpTNkZGCjJtcGJsUktRc1Q5MHIvNnZ6UnRFb2h2RWM3THU2T2FzeVRIa3pNdTJQUkFQTVR3RjNxU0Y1SmRyOW5RV1p1dGgKQ0oxdDhGdDlwMmcxZmFKU1ZielRxOEFqN21Fblpnb01CbUlqRXBVOHZRSURBUUFCb0FBd0RRWUpLb1pJaHZjTgpBUUVMQlFBRGdnRUJBQzNsR2lGN05qc2IxNSttTTFsY0JyTG0rMU95ckh0RE5ocUU5S3Z4NEViWDV4SlVPUzhpCjluOWwxM2c4UG9nRFZMSVdBWXFQdWd5MVFIQUhQc3U4NWpZM1QwMVc4WWROSXUvSnZCNmFRSVk3clR1b2NadEIKNm9hd0lZcEQ4cWFDRGJ5eVRhTEhpZWJCM1U1Q0FGNDdnMVZ5NGJJdmRLZTVzdTVVL1ZwTllyRU5OZzBETzArbApWSk9VOUVxZ0h3bTZIVkpJZldPRDJtM1I5Sk9XaWdibjVUYWxwbHdLczNmWkJYaUFkb1RUV0M3MzBheit1L3hNCkEycTRxQkZkeUVWYVdUK1UrbzNCTmZ3NnAveVRvVWxMaWREUDYyTGlndTVoY2ZHU29WWjhuSlB5amZWSFRNTXoKeDBldU9TZXVmSy9xNFlyR0grU2kzYVNNVEc3cmVzS3JSVmM9Ci0tLS0tRU5EIENFUlRJRklDQVRFIFJFUVVFU1QtLS0tLQo=
  signerName: kubernetes.io/kube-apiserver-client
  usages:
  - client auth            
```

### Create User

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl create -f csr-myuser.yaml 
certificatesigningrequest.certificates.k8s.io/myuser created
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get csr
NAME     AGE   SIGNERNAME                            REQUESTOR          REQUESTEDDURATION   CONDITION
myuser   34s   kubernetes.io/kube-apiserver-client   kubernetes-admin   <none>              Pending
```

user가 정상적으로 생성되었고, admin으로부터 승인 요청만 기다리는 상황이다. 아래의 명령어를 통해 승인을 진행하면 유저 생성작업이 마무리 된다.

> 승인 

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl certificate approve myuser
certificatesigningrequest.certificates.k8s.io/myuser approved
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get csr
NAME     AGE   SIGNERNAME                            REQUESTOR          REQUESTEDDURATION   CONDITION
myuser   69s   kubernetes.io/kube-apiserver-client   kubernetes-admin   <none>              Approved,Issued
```

### Extract User Certificate

생성된 유저의 인증서를 파일 형태로 출력하기 위해서는 아래의 명령어를 실행하면 된다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get csr myuser -o jsonpath='{.status.certificate}'| base64 -d > myuser.crt
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ ls
csr-myuser.yaml  myuser.crt  myuser.csr  myuser.key
```

## Service Account

이번에는 pod에 대한 인증을 수행하기 위한 Service Account을 생성해보자

모든 pod는 Service Account을 생성하지 않으면 해당 namespace에 정의된 default service account가 자동으로 할당된다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get serviceaccounts
NAME      SECRETS   AGE
default   0         22d
```

임의 pod에 대해서 생성해서 yaml 파일 형태로 확인해보면 아래와 같이 기본적으로 service account에 default가 할당되는 것을 확인할 수 있다.

![kubernetes_service_accounts](/assets/images/kubernetes/kubernetes_service_accounts.jpg)

### Service Account Create

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl create serviceaccount pod-viewer
serviceaccount/pod-viewer created
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get sa
NAME         SECRETS   AGE
default      0         22d
pod-viewer   0         11s
```

### Pod Assign Service Account 

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: testpod
  namespace: default
spec:
  containers:
  - image: nginx:1.14
    name: testpod
  serviceAccount: pod-viewer
```

이후, user, service account에 권한을 할당해서 제한된 기능만 활용할 수 있도록 제어할 수 있다.


## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=kttUVsFEj5A&list=PLApuRlvrZKohLYdvfX-UEFYTE7kfnnY36&index=3)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










