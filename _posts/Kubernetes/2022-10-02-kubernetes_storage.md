---
title: "Kubernetes Storage"
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
# Kubernetes Storage

![kubernetes_storage](/assets/images/kubernetes/kubernetes_storage.jpg)

쿠버네티스 환경에서는 위와 같이 여러 storage가 존재하는데, 이러한 storage들을 pod에서 사용할 수 있도록 해야한다. 이럴때, volume과 mount을 활용해서 저장소를 할당해준다.

## Volume

쿠버네티스에 포함되어 있는 스토로지의 추상화 개념으로, 컨테이너에 공간을 할당하는 개념이다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: volume-pod
spec:
  volumes: 
  - name: html
    hostPath:
      path: /webdata
  containers:
  - image: nginx:1.14
    name: volume-pod
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
```

volumne에는 kubernetes storage 정보를 입력하고, volumeMounts을 이용해서 해당 volume을 mount 해줘야한다.

![kubernetes_volumemount](/assets/images/kubernetes/kubernetes_volumemount.jpg)

그러기 위해, 각 node에는 path에 등록된 경로가 존재해야한다. 위에서는, /webdata를 사용하고 있으니, 각각의 node /webdata에 index.html을 만들어서 해당 노드의 이름을 할당한다.

> /webdata/index.html

```html
node1
```

이후, pod yaml 파일을 생성해보면 아래와 같이 해당 컨테이너에 volume이 mount 된것을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/volume$ kubectl exec volume-pod -it -- /bin/bash
root@volume-pod:/# cd /usr/share/nginx/html/
root@volume-pod:/usr/share/nginx/html# cat index.html 
node1
```

## HostPath

노드의 파일시스템의 directory 혹은 파일을 컨테이너에 마운트 하기 위한 저장소이다

```yaml
volumes: 
  - name: html
    hostPath:
      path: /webdata
      type: DirectoryOrCreate
```

위와 같이 hostPath에 path을 등록해서 노드의 파일 시스템을 컨테이너에 연결할 수 있는데, 이때, 추가로 type을 지정할 수 있따.

|type|descrption|
|--|--|
|DirectoryOrCreate|해당 경로에 디렉토리가 있어야 하며, 없으면 새로 만든다.|
|Directory|해당 경로에 디렉토리가 있어야 하며, 없으면 에러가 발생한다.|
|FileOrCreate|해당 경로에 파일이 있어야 하며, 없으면 새로 만든다.|
|File|해당 경로에 파일이 있어야 하며, 없으면 에러가 발생한다.|

## emptydir

![kubernetes_emptydir](/assets/images/kubernetes/kubernetes_emptydir.png)

pod을 생성할 때, 임시 저장소를 생성해서, pod 내부에 container들이 해당 저장소를 share하는 형태이다. multi-container 환경으로 구성된 pod에서 하나의 container에서 생성한 정보를 다른 컨테이너가 이를 활용하는 방식이다.

**pod가 생성될 때 생기고, pod가 삭제되면 해당 임시 저장소는 삭제된다.**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: empty-pod
spec:
  volumes:
  - name: html
    emptyDir: {}
  containers:
  - image: nginx:1.14
    name: volume-pod
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
```

컨테이너가 동작하는 것을 확인해보면, 아래와 같이, 해당 경로에 대해 mount가 되어 있으며, 현재는 빈 공간이 할당되는 것을 확인할 수 있다.

```sh
root@empty-pod:/# mount | grep usr/share/nginx/html
/dev/sda5 on /usr/share/nginx/html type ext4 (rw,relatime,errors=remount-ro)
root@empty-pod:/# cd /usr/share/nginx/html/
root@empty-pod:/usr/share/nginx/html# ls
root@empty-pod:/usr/share/nginx/html# 
```

## NFS

NFS 서버가 공유하고 있는 shared Storage를 nfs client 내에 동작중인 worker node 내부의 pod에서 해당 storage를 접근해서 사용할 수 있도록 한다.

![kubernetes_nfsserver](/assets/images/kubernetes/kubernetes_nfsserver.jpg)


```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nfs-pod
spec:
  volumes:
  - name: html
    nfs: 
      server: 10.100.0.101
      path: /nfsdir
  containers:
  - image: nginx:1.14
    name: volume-pod
    volumeMounts:
    - name: html
      mountPath: /usr/share/nginx/html
```

위의 pod를 생성해서 curl 명령어를 통해 pod가 실행되는 node에 접근해보면 아래와 같이 실행되는 것을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/volume$ kubectl get pods -o wide
NAME      READY   STATUS    RESTARTS   AGE   IP          NODE                     NOMINATED NODE   READINESS GATES
nfs-pod   1/1     Running   0          51s   10.36.0.3   toojeynode1-virtualbox   <none>           <none>
toojey-master@toojeymaster-VirtualBox:~/kubernetes/volume$ curl 10.36.0.3
<html>
<head><title>403 Forbidden</title></head>
<body bgcolor="white">
<center><h1>403 Forbidden</h1></center>
<hr><center>nginx/1.14.2</center>
</body>
</html>
```

nfs server의 공유폴더에서 index.html을 생성해서, 다시 curl 명령어를 실행하면 해당 index.html 파일이 출력되는 것을 확인할 수 있다.

> /nfsdir/index.html

```html
This is NFS Server Shared Directory
```

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/volume$ curl 10.36.0.3
This is NFS Server Shared Directory
```

이렇게, nfs을 통해 공유되는 폴더를 통한 storage를 mount 하는 것을 확인해 볼 수 있다.

### NFS 서버 구성

NFS는 같은 네트워크 상에서 저장공간을 공유하기 위한 서버이다.

> 1. NFS 패키지 설치

```sh
sudo apt install -y nfs-kernel-server 
```

> 2. 공유 디렉토리 생성

```sh
mkdir /nfsdir
chmod 777 /nfsdir
```
아래의 /etc/exports 파일에 해당 공유 디렉토리를 등록한다.
```
# /etc/exports: the access control list for filesystems which may be exported
#               to NFS clients.  See exports(5).
#
# Example for NFSv2 and NFSv3:
# /srv/homes       hostname1(rw,sync,no_subtree_check) hostname2(ro,sync,no_subtree_check)
#
# Example for NFSv4:
# /srv/nfs4        gss/krb5i(rw,sync,fsid=0,crossmnt,no_subtree_check)
# /srv/nfs4/homes  gss/krb5i(rw,sync,no_subtree_check)
#
/nfsdir *(rw,sync)                                 
```

> 3. nfs-server.service 재기동

```sh
sysmtectl restart nfs-server.service
```

> 4. client에 nfs-server 관련 패키지 설치

```
sudo apt install -y nfs-common portmap
```







## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=b457Nrk9GKk&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=28)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










