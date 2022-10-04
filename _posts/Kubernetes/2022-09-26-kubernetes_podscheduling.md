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

## Taint & Toleration

node에 taint을 설정하면, toleration을 가진 pod는 동일한 taint을 가지는 모든 node에 pod가 배치된다.

master node를 보면 아래와 같이 taint가 설정되어 있는데, NoSchedule option을 통해 taint을 설정한 경우, toleration이 맞지 않는 경우 해당 노드에는 pod가 배치되지 않는다. 따라서, 항상 pod를 실행하게 되면 master node을 제외하고 실행되게 된다.

```sh
toojey-master@toojeymaster-VirtualBox:~$ kubectl describe node toojeymaster-virtualbox | grep -i taint
Taints:             node-role.kubernetes.io/control-plane:NoSchedule
```

|Effects|Description|
|--|--|
|NoSchedule|toleration이 맞지 않으면 배치하지 않는다|
|preferNoSchedule|toleration이 맞지 않으면 배치되지 않으나, 리소스가 부족한 경우 할당된다.|
|NoExecute|toleration이 맞으면 동작중인 pod 종료|


> Taint 설정

```sh
toojey-master@toojeymaster-VirtualBox:~$ kubectl taint nodes toojeynode1-virtualbox role=web:NoSchedule
```

```sh
toojey-master@toojeymaster-VirtualBox:~$ kubectl taint nodes toojeynode1-virtualbox role-
```
생성/삭제 작업은 label을 붙이는 작업과 유사하다.

### Practice

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-nginx
spec:
  replicas: 4
  selector:
    matchLabels:
      app: webui
  template:
    metadata:
      name: nginx-pod
      labels:
        app: webui
    spec:
      containers: 
        - name: nginx-container
          image: nginx:1.14
```
위와 같이 toleration이 없는 pod에 대해서는, NoSchedul taint을 가지는 node에 실행되지 않는다.
아래를 보면, Taint가 없는 node2에서만 실행되는 것을 확인할 수 있다.

```sh
deploy-nginx-5cfbcf5f65-d8z92   1/1     Running   0             3s    10.44.0.3   toojeynode2-virtualbox   <none>           <none>
deploy-nginx-5cfbcf5f65-hq7mt   1/1     Running   0             3s    10.44.0.4   toojeynode2-virtualbox   <none>           <none>
deploy-nginx-5cfbcf5f65-rtzd8   1/1     Running   0             3s    10.44.0.1   toojeynode2-virtualbox   <none>           <none>
deploy-nginx-5cfbcf5f65-sxcmm   1/1     Running   0             2s    10.44.0.2   toojeynode2-virtualbox   <none>           <none>
```

아래와 같이 Pod에 toleration을 추가하게 되면 같은 taint을 가지는 node에서도 실행되는 것을 확인할 수 있다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-nginx
spec:
  replicas: 4
  selector:
    matchLabels:
      app: webui
  template:
    metadata:
      name: nginx-pod
      labels:
        app: webui
    spec:
      containers: 
        - name: nginx-container
          image: nginx:1.14
      toleration:
        - key: "role"
          operator: "Equal"
          value: "web"
          Effect: "NoSchedule"
```

```sh
deploy-nginx-78b99b44b-2zggg   1/1     Running   0          7s    10.36.0.2   toojeynode1-virtualbox   <none>           <none>
deploy-nginx-78b99b44b-5pmzc   1/1     Running   0          7s    10.44.0.2   toojeynode2-virtualbox   <none>           <none>
deploy-nginx-78b99b44b-dt6qx   1/1     Running   0          7s    10.36.0.1   toojeynode1-virtualbox   <none>           <none>
deploy-nginx-78b99b44b-zh986   1/1     Running   0          7s    10.44.0.1   toojeynode2-virtualbox   <none>           <none>
```

## Cordon

cordon을 설정하게 되면 해당 노드에는 pod가 배치되지 않도록 할 수 있다.

![cordon_nodes](/assets/images/kubernetes/cordon_nodes.png)

> Cordon 설정

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get nodes
NAME                      STATUS   ROLES           AGE   VERSION
toojeymaster-virtualbox   Ready    control-plane   21d   v1.25.0
toojeynode1-virtualbox    Ready    <none>          21d   v1.25.0
toojeynode2-virtualbox    Ready    <none>          21d   v1.25.0
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl cordon toojeynode1-virtualbox 
node/toojeynode1-virtualbox cordoned
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get nodes
NAME                      STATUS                     ROLES           AGE   VERSION
toojeymaster-virtualbox   Ready                      control-plane   21d   v1.25.0
toojeynode1-virtualbox    Ready,SchedulingDisabled   <none>          21d   v1.25.0
toojeynode2-virtualbox    Ready                      <none>          21d   v1.25.0
```

> Uncordon

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl uncordon toojeynode1-virtualbox 
node/toojeynode1-virtualbox uncordoned
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get nodes
NAME                      STATUS   ROLES           AGE   VERSION
toojeymaster-virtualbox   Ready    control-plane   21d   v1.25.0
toojeynode1-virtualbox    Ready    <none>          21d   v1.25.0
toojeynode2-virtualbox    Ready    <none>          21d   v1.25.0
```

### Practice

deployment을 실행하게 되면 아래의 결과를 확인해보면, cordon이 설정된 node1에는 pod가 실행되지 않음을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get pods -o wide
NAME                            READY   STATUS    RESTARTS   AGE   IP          NODE                     NOMINATED NODE   READINESS GATES
deploy-nginx-5cfbcf5f65-tvzsc   1/1     Running   0          6s    10.44.0.2   toojeynode2-virtualbox   <none>           <none>
deploy-nginx-5cfbcf5f65-w2nwc   1/1     Running   0          6s    10.44.0.3   toojeynode2-virtualbox   <none>           <none>
deploy-nginx-5cfbcf5f65-xn8pv   1/1     Running   0          6s    10.44.0.1   toojeynode2-virtualbox   <none>           <none>
```

## Drain

특정 노드의 모든 pod를 제거하도록 한다.

> Drain 설정

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl drain toojeynode2-virtualbox --ignore-daemonsets --force
node/toojeynode2-virtualbox cordoned
Warning: deleting Pods that declare no controller: default/db; ignoring DaemonSet-managed Pods: kube-system/kube-proxy-fhfw2, kube-system/weave-net-k726r
evicting pod default/deploy-nginx-5cfbcf5f65-gsjnm
evicting pod default/db
pod/db evicted
pod/deploy-nginx-5cfbcf5f65-gsjnm evicted
node/toojeynode2-virtualbox drained
```

|options|descriptions|
|--|--|
|--ignore-daemonsets|Contoller에 의해 실행되는 pod를 제거할 수 있도록 한다.(controller에 의해서 관리되는 pod는 제거되어도, controller에 의해 다시 실행되기 때문에, 해당 옵션을 설정하지 않으면 해당 node에 대한 drain이 불가능하다.|
|--force|controller가 아닌 pod 자체만으로 실행되는 경우, drain 되지 않는데, 이는 중요한 pod가 삭제되는 것을 방지하기 때문이다. 하지만 이를 삭제하기 위해 --force 옵션을 지정하면 된다.|

Drain 설정을 하게 되면 아래와 같이 cordon 설정과 동일한 형태로, status가 표기된다.
```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get nodes
NAME                      STATUS                     ROLES           AGE   VERSION
toojeymaster-virtualbox   Ready                      control-plane   21d   v1.25.0
toojeynode1-virtualbox    Ready                      <none>          21d   v1.25.0
toojeynode2-virtualbox    Ready,SchedulingDisabled   <none>          21d   v1.25.0
```


**Drain을 제거하기 위해서는, uncordon을 활용하면 된다.**

### Practice

![drain_get_pods1](/assets/images/kubernetes/drain_get_pods1.jpg)

위와 같이 pod가 동작중인 상황에서, node2에 대해서, drain을 설정하게 되면 아래와 같이 node2에서 실행되는 모든 pod가 제거된다. controller에 의해서 관리되는 pod는 다른 node에 pod를 배치하게 된다.

![drain_node](/assets/images/kubernetes/drain_node.jpg)











## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=kyUH3HvIVCg&list=PLApuRlvrZKohLYdvfX-UEFYTE7kfnnY36)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










