---
title: "Kubernetes Pod Scheduling"
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

# Pod Scheduling

## Node Selector

특정 Label을 가지는 Node에서 pod를 실행할 수 있도록 Node Selector을 이용해서 지정할 수 있다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tensorflow-gpu
spec:
  containers:
  - image: tensorflow/tensorflow:nightly-jupyter
    name: tensorflow-gpu
    ports:
    - containerPort: 8888
      protocol: TCP
  nodeSelector:
    gpu: "true"
```

위와 같이 tensorflow는 gpu가 있는 환경에서만 실행이 가능한데, 이를 위해 NodeSelector을 활용해서 GPU Label을 가진 node에서 실행될 수 있도록 설정한다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get nodes -L gpu
NAME                      STATUS   ROLES           AGE   VERSION   GPU
toojeymaster-virtualbox   Ready    control-plane   21d   v1.25.0   
toojeynode1-virtualbox    Ready    <none>          21d   v1.25.0   true
toojeynode2-virtualbox    Ready    <none>          21d   v1.25.0   
```

아래의 pod 실행 결과를 확인해보면 gpu=true인 node1에서 pod가 실행되는 것을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods -o wide
NAME             READY   STATUS              RESTARTS   AGE   IP       NODE                     NOMINATED NODE   READINESS GATES
tensorflow-gpu   0/1     ContainerCreating   0          33s   <none>   toojeynode1-virtualbox   <none>           <none>
```

## Affinity & antiAffinity

### Node Affinity

특정 label 집합을 가지는 노드에 대해서, required, preferred option을 적용하여 pod 실행여부를 결정할 수 있다. 

|NodeAffinity options|description|
|--|--|
|requiredDuringSchedulingIgnoredDuringExecution|엄격한 요구 (모든 조건이 만족해야함)
|preferredDuringSchedulingIgnoredDuringExecution|선호도 요구 (라벨을 가지고 있는 경우, 가중치를 부여한다,즉 가중치가 높은 노드에 pod가 실행되는 것이다.)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tensorflow-gpu-ssd
spec:
  containers:
  - image: tensorflow/tensorflow:nightly-jupyter
    name: tensorflow-gpu
    ports:
    - containerPort: 8888
      protocol: TCP
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
            - {key: gpu, operator: Exists}
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 10
          preference:
            matchExpressions:
            - {key: gpu, operator: In, values: ["true"]}
            - {key: disktype, operator: In, values: ["ssd"]}
```

위의 방식대로, NodeAffinity를 적용하고 pod를 생성해서 실행해보면, Gpu label이 있는 node에 대해서, gpu=true, disktype=ssd를 만족하는 경우에 대해서 각각 가중치를 부여해서 가중치의 총합이 가장 높은 노드에 pod를 실행하도록 한다.

아래와 같이 node label이 구성되어 있다고 하면 node2에서 pod가 실행된다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get nodes -L gpu,disktype
NAME                      STATUS   ROLES           AGE   VERSION   GPU    DISKTYPE
toojeymaster-virtualbox   Ready    control-plane   21d   v1.25.0          
toojeynode1-virtualbox    Ready    <none>          21d   v1.25.0   true   
toojeynode2-virtualbox    Ready    <none>          21d   v1.25.0   true   ssd

```
```sh
tensorflow-gpu-ssd   1/1     Running   0          4s    10.44.0.1   toojeynode2-virtualbox   <none>           <none>
```

### Pod Affinity

위에서는 Node에 대한 Affinity를 적용하였지만, Pod에 대한 Affinity를 구성할 수 있다.

PodAffinity를 구성하면, 해당 pod와 같은 node에 실행되도록 유도할 수 있고, PodAntiAffinity의 경우, 해당 pod가 실행되는 node와 같은 node에 실행되지 않도록 유도할 수 있다.

> 임의 pod 실행

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl run backend --image=busybox -l app=backend -- sleep 9999999
pod/backend created

toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods -o wide
NAME      READY   STATUS    RESTARTS   AGE   IP          NODE                     NOMINATED NODE   READINESS GATES
backend   1/1     Running   0          34s   10.36.0.1   toojeynode1-virtualbox   <none>           <none>
```
> pod affinity 설정으로 위의 pod가 실행되는 node에 pod가 실행되도록 유도

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: frontend
  name: frontend
spec:
  replicas: 5
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      affinity:
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchLabels:
                app: backend
            topologyKey: kubernetes.io/hostname
      containers:
      - image: busybox
        name: busybox
```

아래의 결과를 확인해보면 모두 같은 node에 실행되는 것을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods -o wide
NAME                        READY   STATUS      RESTARTS   AGE     IP          NODE                     NOMINATED NODE   READINESS GATES
backend                     1/1     Running     0          6m53s   10.36.0.1   toojeynode1-virtualbox   <none>           <none>
frontend-688cf765c4-7qlwt   0/1     Completed   0          13s     10.36.0.6   toojeynode1-virtualbox   <none>           <none>
frontend-688cf765c4-8vxkx   0/1     Completed   0          13s     10.36.0.2   toojeynode1-virtualbox   <none>           <none>
frontend-688cf765c4-rbcxm   0/1     Completed   0          13s     10.36.0.5   toojeynode1-virtualbox   <none>           <none>
frontend-688cf765c4-sksst   0/1     Completed   0          13s     10.36.0.3   toojeynode1-virtualbox   <none>           <none>
frontend-688cf765c4-zsrqh   0/1     Completed   0          13s     10.36.0.4   toojeynode1-virtualbox   <none>           <none>
```

> pod anti affinity 설정으로 위의 pod가 실행되는 node와 같은 node에서 실행되지 않도록 유도

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: frontend
  name: frontend
spec:
  replicas: 5
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchLabels:
                app: backend
            topologyKey: kubernetes.io/hostname
      containers:
      - image: busybox
        name: busybox
```
아래의 결과를 통해 pod가 node1이 아닌 node2에서 모두 실행되는 것을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods -o wide
NAME                        READY   STATUS      RESTARTS   AGE     IP          NODE                     NOMINATED NODE   READINESS GATES
backend                     1/1     Running     0          9m20s   10.36.0.1   toojeynode1-virtualbox   <none>           <none>
frontend-56b5c75f78-8kh7z   0/1     Completed   0          13s     10.44.0.3   toojeynode2-virtualbox   <none>           <none>
frontend-56b5c75f78-fkf9r   0/1     Completed   0          13s     10.44.0.4   toojeynode2-virtualbox   <none>           <none>
frontend-56b5c75f78-g55w2   0/1     Completed   0          13s     10.44.0.2   toojeynode2-virtualbox   <none>           <none>
frontend-56b5c75f78-k2kqc   0/1     Completed   0          13s     10.44.0.1   toojeynode2-virtualbox   <none>           <none>
frontend-56b5c75f78-x5d6q   0/1     Completed   0          13s     10.44.0.5   toojeynode2-virtualbox   <none>           <none>
```

## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=b457Nrk9GKk&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=28)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










