---
title: "Kubernetes persistent Volume"
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
# Kubernetes persistent Volume

![kubernetes_persistent_volume](/assets/images/kubernetes/kubernetes_persistent_volume.jpg)

스토리지 담당을 관리하는 사람이 Volume을 생성해놓으면, 운영자는 만들어놓은 volume을 사용하면 된다. volume의 종류는 매우 다양하고, 이들을 모두 알기에는 한계가 있기 때문에 스토리지를 전문적으로 관리하는 사람이 persistent Volume 형태로 만들어서 개발자는 persistent volume claim을 통해 원하는 volume을 할당받아서 사용할 수 있다.


## persistent Volume

persistnce volume을 생성해서 persistent volume pool을 구성한다

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv1
spec:
  capacity:
    storage: 20Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteMany
  storageClassName: manual
  persistentVolumeReclaimPolicy: Delete
  nfs:
    server: 10.100.0.101
    path: /nfsdir
```

|accessmodes|description|
|--|--|
|ReadWriteOnce|읽기-쓰기를 지원하지만, 한번에 하나의 모드만 지원이 가능하다|
|ReadOnlyMany|다수의 노드에서 읽기 전용으로 마운트|
|ReadWriteMany|다수의 노드에서 쓰기 전용으로 마운트|
|ReadWriteOncePod|단일 pod에서 읽기-쓰기로 마운트|

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/persistentvolume$ kubectl create -f pv.yaml 
persistentvolume/pv1 created
toojey-master@toojeymaster-VirtualBox:~/kubernetes/persistentvolume$ kubectl get pv
NAME   CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM   STORAGECLASS   REASON   AGE
pv1    20Gi       RWX            Delete           Available           manual                  2s
```

## persistent Volume Claim

PersistnceVolume pool이 구성이 되면 운영자/개발자는 persistent volume claim을 통해 요구사항에 맞는 persistent volume을 할당받아서 사용할 수 있다.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-web
spec:
  accessModes:
    - ReadWriteMany
  volumeMode: Filesystem
  resources:
    requests:
      storage: 10Gi
  storageClassName: manual
```

아래의 실행 결과를 확인해보면 pvc에 따라, pv가 정상적으로 할당된 것을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/persistentvolume$ kubectl get pvc --watch
NAME      STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
pvc-web   Pending                                      manual         0s
pvc-web   Pending   pv1      0                         manual         0s
pvc-web   Bound     pv1      20Gi       RWX            manual         0s
```

## Pod

생성한 pvc를 토대로 pod에 pvc 형태로 volume mount을 해주면 해당 pod에서 persistent volume을 사용할 수 있게 된다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: web
spec:
  containers:
    - name: nginx
      image: nginx:1.14
      volumeMounts:
      - mountPath: /usr/share/nginx/html
        name: html
  volumes:
    - name: html
      persistentVolumeClaim:
        claimName: pvc-web
```

![kubectl_pod_pvc](/assets/images/kubernetes/kubectl_pod_pvc.jpg)

위의 pod를 describe 했을 때, mount, volume이 포함된 것을 확인할 수 있다.
또한, 컨테이너를 통해 확인해보면 nfs server의 공유 디렉토리가 PVC에 의해 volume mount 된 것을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/persistentvolume$ kubectl exec web -it -- /bin/bash
root@web:/# ls
bin  boot  dev	etc  home  lib	lib64  media  mnt  opt	proc  root  run  sbin  srv  sys  tmp  usr  var
root@web:/# cd /usr/share/nginx/html 
root@web:/usr/share/nginx/html# ls
index.html
root@web:/usr/share/nginx/html# cat index.html 
This is NFS Server Shared Directory
```


## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=b457Nrk9GKk&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=28)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










