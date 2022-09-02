---
title: "Kubernetes Controller"
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

# Controller

실행한 pod 개수를 보장해주는 역할을 진행한다. 

만약 웹서버 3개를 운영하고 있는 상태에서, 웹서버 1개가 떨어지게 되면, controller는 api 서버로 pod 추가 생성을 요청하게 된다.

![kubernetes_controller](/assets/images/kubernetes/kubernetes_controller.png)

## ReplicationController

가장 기본적으로 pod의 개수를 보장하며 pod 실행을 안정적으로 유지해주는 역할 수행

>Replication-Controller

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name:
spec:
  replicas: <pod 개수>
  selector:
    key:value
  template:
    <template>
```

ReplicationController는 위와 같이 구조로 구성되는 데, replicas, selector, template이 controller의 핵심 요소이다.

|Property|Description|
|--|--|
|replicas|실행하는 pod의 개수|
|selector|key:value 형태의 라벨을 가지고 있는 container의 동작 여부 파악 -> 이를 통해 pod 개수를 추가할지 삭제할지 판단|
|template|pod 개수가 모자란 경우, template를 이용해서 pod 생성|

selector를 통해 실행되고 있는 pod 개수의 보장을 하고 부족하면 template를 이용해서 추가생성하고, pod 개수가 replicas보다 많게되면 삭제해주게 된다.

![replication_controller_mechanism](/assets/images/kubernetes/replication_controller_mechanism.png)

### Practice

#### Creating Replication Controller

> rc-nginx.yaml

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: rc-nginx
spec:
  replicas: 3
  selector:
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
위의 replication controller을 실행하게 되면 아래와 같이 pod container가 3개 생성되는 것을 확인할 수 있다.

![replication_controller_auto_create](/assets/images/kubernetes/replication_controller_auto_create.jpg)

> replication controller 정보 보기

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get replicationcontrollers 
NAME       DESIRED   CURRENT   READY   AGE
rc-nginx   3         3         3       2m18s
```

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl describe rc rc-nginx 
Name:         rc-nginx
Namespace:    default
Selector:     app=webui
Labels:       app=webui
Annotations:  <none>
Replicas:     3 current / 3 desired
Pods Status:  3 Running / 0 Waiting / 0 Succeeded / 0 Failed
Pod Template:
  Labels:  app=webui
  Containers:
   nginx-container:
    Image:        nginx:1.14
    Port:         <none>
    Host Port:    <none>
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Events:
  Type    Reason            Age    From                    Message
  ----    ------            ----   ----                    -------
  Normal  SuccessfulCreate  3m20s  replication-controller  Created pod: rc-nginx-5gwgl
  Normal  SuccessfulCreate  3m20s  replication-controller  Created pod: rc-nginx-v24nl
  Normal  SuccessfulCreate  3m20s  replication-controller  Created pod: rc-nginx-76fbr
```

#### Testing Replication Controller

그러면, 이러한 상황에서 label이 app=webui인 pod를 추가하게 되면 어떻게 될까?

> redis.yaml

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    app: webui
  name: redis
spec:
  containers:
  - image: redis
    name: redis
```

아래와 같이 container는 생성되자마자 삭제되게 된다. 이는 controller에서 pod 개수를 3개로 보장하고 있기 때문에, 그 이상의 container가 실행되게 되면 최근에 생성한 container을 삭제하게 된다.

![replication_controller_mechanism2](/assets/images//kubernetes/replication_controller_mechanism2.jpg)

#### Editing Replication Controller

```shell
kubectl edit rc rc-nginx
```

> replication 확장

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  creationTimestamp: "2022-08-31T02:23:38Z"
  generation: 1
  labels:
    app: webui
  name: rc-nginx
  namespace: default
  resourceVersion: "86420"
  uid: b3af6fa3-465d-4e6e-90ae-eba657a64366
spec:
  replicas: 4
```

아래와 같이 container가 추가 생성되게 된다.

![replication_controller_mechanism_increase](/assets/images/kubernetes/replication_controller_mechanism_increase.jpg)

> replication 축소

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  creationTimestamp: "2022-08-31T02:23:38Z"
  generation: 2
  labels:
    app: webui
  name: rc-nginx
  namespace: default
  resourceVersion: "86773"
  uid: b3af6fa3-465d-4e6e-90ae-eba657a64366
spec:
  replicas: 2
```

아래의 결과를 확인해보면, 2개가 줄어드는 것을 확인할 수 있다.

![replication_controller_mechanism_decrease](/assets/images/kubernetes/replication_controller_mechanism_decrease.jpg)

이렇게 replication controller의 yaml 파일을 수정해서 replicas를 수정할 수 있지만, 아래의 명령어를 통해 replicas를 수정할 수 있다.

```shell
kubectl scale rc rc-nginx --replicas=3
```

![replication_controller_mechanism_increase2](/assets/images/kubernetes/replication_controller_mechanism_increase2.jpg)

## ReplicaSet

ReplicationController와 유사하지만, selector를 조금 더 세밀하게 조절하는 것이 가능하다.

```yaml
selector:
  matchLabels:
    component: redis
  matchExpressions:
    {key: value, operator: , values:[]}

```

matchLabels의 경우 ReplicationController의 selector와 동일한 기능을 수행한다.

matchExpressions을 활용하게 되면, In, NotIn, Exists, DoesNotExist 와 같은 연산을 활용할 수 있다.

아래와 같은 expression을 생성할 수 있다.

가령, app=webui이고, version이 2.1 혹은 2.2인 label을 가진 pod에 대해 controller을 동작시키고자 하면 replication controller을 이용해서는 다중 값에 대한 설정이 불가능하다. 하지만 replicaset을 통해 아래와 같이 표현할 수 있다.

```yaml
selector:
  matchLabels:
    app: webui
  matchExpressions:
    {key: version, operator: In, values:["2.1","2.2"]}
```

**label을 설정할 때는 반드시 세밀하게 값을 지정해야는데, 이는 controller가 해당 label selector을 기반으로 pod 개수를 유지하기 때문이다. 다른 pod 정보는 다르더라도, label 정보만 같다면 label selector로 인식되기 때문에, pod에 대한 label 지정을 철저히 해야하며, selector 또한 세밀한 label 값 조정이 필요하다.**

### Practice

#### Creating ReplicaSet

> rs-nginx.yaml

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: rs-nginx
spec:
  replicas: 3
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

해당 controller을 생성해서 실행하게 되면 아래와 같이 container을 자동으로 생성해주게 된다.

![replicaset_auto_create](/assets/images/kubernetes/replicaset_auto_create.jpg)

이외에도 기존의 replication controller을 통해 수행했던 명령어들을 활용가능하다.

#### Deleting ReplicaSet

원래는, controller을 삭제하게 되면, controller을 통해 생성된 container는 삭제 되게 된다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl delete rc rc-nginx 
replicationcontroller "rc-nginx" deleted
```

![delete_controller](/assets/images/kubernetes/delete_controller.jpg)


하지만, --cascade=false 옵션을 추가하게 되면 controller만 삭제하는 것이 가능하다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl delete rs rs-nginx --cascade=false
warning: --cascade=false is deprecated (boolean value) and can be replaced with --cascade=orphan.
replicaset.apps "rs-nginx" deleted
```

아래와 같이 container은 삭제되지 않고 계속 동작하는 것을 확인할 수 있다.

![replicaset_delete_result](/assets/images/kubernetes/replicaset_delete_result.jpg)

## Deployment

deployment은 replicaset을 제어하는 부모 역할을 수행한다.

Deploment -> ReplicaSet -> Pod을 형태로 동작하게 되는데, Deployment을 생성하게 되면 내부적으로 ReplicaSet이 동작하게 되며 Pod가 생성된다.

![deployment](/assets/images/kubernetes/deployment.jpg)

Deployment을 사용하는 주된 이유는 바로 RollingUpdate 때문이다. RollingUpdate는 서비스 중단 없이 pod의 버전을 update할 수 있도록 지원하는 것을 의미한다. 가령, 서비스 중단 없이, nginx 1.14 버전을 1.15 버전으로 update 하는 식의 버전 업데이트를 지원한다.

deployment의 구조는 아래와 같은데, replicaset의 모체 역할을 한다는 점에서 구조가 매우 유사하다.

> deploy-nginx.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rs-nginx
spec:
  replicas: 3
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

### Practice

위의에서 정의한 deploy-nginx.yaml를 통해 deployment을 생성해보면 아래와 같은 결과를 확인할 수 있다.

```
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get deploy,rs,pod
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/deploy-nginx   3/3     3            3           22s

NAME                                      DESIRED   CURRENT   READY   AGE
replicaset.apps/deploy-nginx-5cfbcf5f65   3         3         3       22s

NAME                                READY   STATUS    RESTARTS   AGE
pod/deploy-nginx-5cfbcf5f65-57w9w   1/1     Running   0          22s
pod/deploy-nginx-5cfbcf5f65-78cbm   1/1     Running   0          22s
pod/deploy-nginx-5cfbcf5f65-fvchv   1/1     Running   0          22s
```

보면 알듯이, Deployment 생성 과정을 통해 ReplicaSet이 자동으로 생성되는 것을 확인할 수 있다.

**Deployment는 ReplicaSet을 ReplicaSet은 Pod를 관리하는 구조를 취하기 때문에, Pod를 삭제하게 되면 ReplicaSet에 의해 Pod가 다시 생성되게 되고, ReplicaSet 자체를 삭제하게 되면 Pod도 삭제되는데, 다시 Deployment에 의해 ReplicaSet이 생성되며, Pod 또한 다시 생성된다.**

### RollingUpdate

```
kubectl set image deployment <deploy_name> <container_name>=<new_image_name>
```

위와 같은 명령어 실행을 통해 아래와 같이, deployment에서 관리되는 pod에 대한 버전 업데이트를 수행할 수 있다. rolling update를 수행하게 되면 기존의 pod는 그대로 둔 상태에서 새로운 버전의 pod를 추가로 생성해서, 기존의 pod를 삭제하는 방식으로 진행해서 무중단 서비스를 제공한다.

![deployment_rolling_update](/assets/images/kubernetes/deployment_rolling_update.jpg)

#### Practice

> deploy-exam1.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deploy
spec:
  replicas: 3
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
        - name: web
          image: nginx:1.14                                 
```

```shell
kubectl create -f deploy-exam1.yaml --record
```

위와 같은 deployment을 실행해보자. 우선은 처음에는 nginx:1.14 버전의 container가 생성되는 것을 확인할 수 있다.

![describe_deployment_version](/assets/images/kubernetes/describe_deployment_version.jpg)

> record option

위의 deployment을 --record 옵션을 추가해서 생성해야한다. 그렇게 해야 아래와 같이 rollout history에 기록되는 정보를 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout history deployment app-deploy 
deployment.apps/app-deploy 
REVISION  CHANGE-CAUSE
1         kubectl create --filename=deploy-exam1.yaml --record=true
```

> rolling update

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl set image deployment app-deploy web=nginx:1.15 --record
```
web container에 대해 새로운 image를 지정해주게 되면 아래와 같이, 기존의 container은 삭제되며, 새로운 버전의 container가 생성된다.

![deployment_rolling_update2](/assets/images/kubernetes/deployment_rolling_update2.jpg)

> rollout status

rollout status을 통해 rollingupdate의 상태 정보도 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl set image deployment app-deploy web=nginx:1.16 --record
Flag --record has been deprecated, --record will be removed in the future
deployment.apps/app-deploy image updated
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout status deployment app-deploy 
Waiting for deployment "app-deploy" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "app-deploy" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "app-deploy" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "app-deploy" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "app-deploy" rollout to finish: 2 out of 3 new replicas have been updated...
Waiting for deployment "app-deploy" rollout to finish: 2 old replicas are pending termination...
Waiting for deployment "app-deploy" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment "app-deploy" rollout to finish: 1 old replicas are pending termination...
deployment "app-deploy" successfully rolled out
```

> rollout pause/resume

pause 와 resume을 통해 rolling update의 상태를 일시정지 및 재개할 수도 있다.

> rollout history

rollout history를 통해 rolling update를 적용한 기록 정보를 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout history deployment app-deploy 
deployment.apps/app-deploy 
REVISION  CHANGE-CAUSE
1         kubectl create --filename=deploy-exam1.yaml --record=true
2         kubectl set image deployment app-deploy web=nginx:1.15 --record=true
3         kubectl set image deployment app-deploy web=nginx:1.16 --record=true
```

#### Rolling Undo

undo 명령어를 통해 이전 버전으로 되돌리는 것도 가능하다. rollback 하는 것을 의미한다. 

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout history deployment app-deploy 
deployment.apps/app-deploy 
REVISION  CHANGE-CAUSE
1         kubectl create --filename=deploy-exam1.yaml --record=true
2         kubectl set image deployment app-deploy web=nginx:1.15 --record=true
3         kubectl set image deployment app-deploy web=nginx:1.16 --record=true
4         kubectl set image deployment app-deploy web=nginx:1.17 --record=true
5         kubectl set image deployment app-deploy web=nginx:1.18 --record=true
```

우선 위와 같은 rollout history 정보가 있을 때, 아래와 같이 undo를 수행하면 바로 직전의 version으로 돌아간다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout undo deployment app-deploy 
deployment.apps/app-deploy rolled back
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout history deployment app-deploy 
deployment.apps/app-deploy 
REVISION  CHANGE-CAUSE
1         kubectl create --filename=deploy-exam1.yaml --record=true
2         kubectl set image deployment app-deploy web=nginx:1.15 --record=true
3         kubectl set image deployment app-deploy web=nginx:1.16 --record=true
5         kubectl set image deployment app-deploy web=nginx:1.18 --record=true
6         kubectl set image deployment app-deploy web=nginx:1.17 --record=true
```

pod 정보를 확인해보면 1.17 버전의 container가 동작되는 것을 확인할 수 있다.

![deployment_rolling_undo1](/assets/images/kubernetes/deployment_rolling_undo1.jpg)

아래와 같이 특정 버전으로 돌아가는 것도 가능하다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout history deployment app-deploy 
deployment.apps/app-deploy 
REVISION  CHANGE-CAUSE
1         kubectl create --filename=deploy-exam1.yaml --record=true
2         kubectl set image deployment app-deploy web=nginx:1.15 --record=true
3         kubectl set image deployment app-deploy web=nginx:1.16 --record=true
5         kubectl set image deployment app-deploy web=nginx:1.18 --record=true
6         kubectl set image deployment app-deploy web=nginx:1.17 --record=true

toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout undo deployment app-deploy --to-revision=2
deployment.apps/app-deploy rolled back
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout history deployment app-deploy 
deployment.apps/app-deploy 
REVISION  CHANGE-CAUSE
1         kubectl create --filename=deploy-exam1.yaml --record=true
3         kubectl set image deployment app-deploy web=nginx:1.16 --record=true
5         kubectl set image deployment app-deploy web=nginx:1.18 --record=true
6         kubectl set image deployment app-deploy web=nginx:1.17 --record=true
7         kubectl set image deployment app-deploy web=nginx:1.15 --record=true
```

#### Another type of Rolling Update

> deploy-exam2.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-nginx
  annotations:
    kubernetes.io/change-cause: version 1.14
spec:
  progressDeadlineSeconds: 600
  revisionHistoryLimit: 10
  strategy:
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
    type: RollingUpdate
  replicas: 3
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
        - name: web
          image: nginx:1.14                                 
```

|Properties|Description|
|--|--|
|annotations|kubernetes의 동작 방식을 제어할 수 있다.|
|progressDeadlineSeconds|update 최대 대기 시간, 해당 시간이 지나도 update이 완료되지 않으면 자동으로 update를 취소한다|
|revisionHistoryLimit|rollout history entry 개수를 제한한다.|
|maxSurge|rolling update를 수행할때, 추가 생성되는 pod 개수를 조절 할 수 있다.|
|maxUnavailable|rolling update를 수행할때, 한번에 삭제되는 pod 개수를 조절 할 수 있다.|
|type=RollingUpdate|당장 업데이트를 수행하는 것을 의미한다|

rolling update는 기존의 pod외에 새로운 version의 pod을 생성해서 기존의 pod를 삭제하는 방식으로 진행되는데, 이때, maxSurge 값은 한번에 구동되는 최대 pod 개수를 의미하며, 이는 추가로 생성되는 pod 개수를 뜻한다. 즉 maxSurge 값을 늘리게 되며 update 진행 속도를 빨리 할 수 있게 된다.  

maxSurge:25% 라는 의미는  기존의 pod 3개에 1(round(3*0.25))추가로 생성할 수 있음을 의미한다.

> change-cause

- kubernetes.io/change-cause: version 1.14
위와 같이 annotation을 지정하게 되면 해당 deployment을 생성할때 version 1.14 이름으로 history가 생성된다.

그러면, 추후에 아래와 같은 새로운 버전을 지정해서 apply 했을 때, rolling update를 수행할 수 있도록 할 수 있다.

> deploy-exam2.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deploy-nginx
  annotations:
    kubernetes.io/change-cause: version 1.15
  < 생략 >
      containers:
        - name: web
          image: nginx:1.15                                 
```

1. deployment 실행

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl apply -f deploy-exam2.yaml 
deployment.apps/deploy-nginx created
```

![deployment_rolling_update_annotation1](/assets/images/kubernetes/deployment_rolling_update_annotation1.jpg)

2. deployment 파일 수정 및 apply

![deployment_edit_annotation](/assets/images/kubernetes/deployment_edit_annotation.jpg)

위와 같이 version 정보를 수정하게 되면 아래와 같이 rolling update가 진행 되는것 을 확인할 수 있다.

![deployment_rolling_update_annotation2](/assets/images/kubernetes/deployment_rolling_update_annotation2.jpg)

3. rollout history 정보

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout history deployment deploy-nginx 
deployment.apps/deploy-nginx 
REVISION  CHANGE-CAUSE
1         version 1.14
2         version 1.15
```

## DaemonSet

노드 당 1개씩의 pod를 보장해준다.

![daemon_set_mechanism](/assets/images/kubernetes/daemon_set_mechanism.png)

보통 로그 수집기와 같이 모든 노드에서 필요한 서비스의 경우 DaemonSet을 통해 모든 node에서 실행될 수 있도록 보장한다.

> daemonset-nginx.yaml

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: daemonset-nginx
spec:
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

### Practice

위의 daemonset을 생성해서 실행해보면 worker node가 한 개만 동작하는 상황에서 아래와 같이 1개의 pod가 생성됨을 확인할 수 있다.

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get nodes
NAME                      STATUS   ROLES           AGE     VERSION
toojeymaster-virtualbox   Ready    control-plane   7d13h   v1.25.0
toojeynode1-virtualbox    Ready    <none>          7d13h   v1.25.0
```

![daemon_set_result](/assets/images/kubernetes/daemon_set_result.png)


여기서, worker node를 1개 추가시키면 어떻게 되는 지 확인해 보자.
worker node를 추가하는 방법은 kubeadm의 join option을 활용하면 되는데, 이는 여기를 참조하자 [kubeadm_join]({% post_url 2022-08-24-installdocker_kunernetes %})

> 여기서 worker node를 추가한 이후에 어떻게 변하는 지 확인해보자

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl get nodes
NAME                      STATUS   ROLES           AGE     VERSION
toojeymaster-virtualbox   Ready    control-plane   7d13h   v1.25.0
toojeynode1-virtualbox    Ready    <none>          7d13h   v1.25.0
toojeynode2-virtualbox    Ready    <none>          2m42s   v1.25.0
```

![daemon_set_result2](/assets/images/kubernetes/daemon_set_result2.png)

worker node가 추가됨에 따라 pod가 1개 추가로 생성되는 것을 확인할 수 있다.

### Rolling Update

Daemonset을 이용하게 되면, Rolling Update를 수행할 수 있다.

![daemon_set_rolling_update1](/assets/images/kubernetes/daemon_set_rolling_update1.jpg)

위와 같이 kubectl edit 명령어를 통해 version 정보를 1.14에서 1.15로 수정하게 되면 아래의 결과를 확인할 수 있다.

![daemon_set_rolling_update2](/assets/images/kubernetes/daemon_set_rolling_update2.jpg)

Deployment와 달리 기존의 pod를 제거하고 새로운 버전의 pod가 생성되는 방식이다.

### RollBack

rolling update와 마찬가지로, roll back도 가능하다.

```shell
toojey-master@toojeymaster-VirtualBox:~$ kubectl rollout undo daemonset daemonset-nginx 
daemonset.apps/daemonset-nginx rolled back
```

![daemon_set_rollback](/assets/images/kubernetes/daemon_set_rollback.jpg)

## Stateful Set

Pod의 상태를 유지해주는 controller이다.

기존의 replicationcontroller, set, 와 같은 controller는 pod를 생성할 때, pod의 이름을 임의로 생성하였다.

가령 daemont set이 실행하는 pod의 이름은 아래와 같다. daemonset-nginx까지는 동일하게 유지하고, 이후에는 hash값을 붙여서 pod 이름을 달리하게 된다. hash 값은 랜덤하게 적용하기 때문에 pod name에 대해 보장이 되지 않는다.


```
toojey-master@toojeymaster-VirtualBox:~$ kubectl get pods
NAME                    READY   STATUS    RESTARTS   AGE
daemonset-nginx-94gvr   1/1     Running   0          7m3s
daemonset-nginx-tbp4z   1/1     Running   0          7m1s
```

하지만, stateful set을 활용하면 pod의 이름을 유지할 수 있게된다. 

![stateful_set_mechanism](/assets/images/kubernetes/stateful_set_mechanism.png)

위와 같이, pod에 대한 index을 유지하므로써, pod의 이름을 보장해주게 된다.


### Practice

> sf-nginx.yaml

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: sf-nginx
spec:
  replicas: 3
  serviceName: sf-service
  podManagementPolicy: Parallel
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

아래의 생성 결과를 확인해보면 pod 이름이 0,1,2로 보장되는 것을 확인할 수 있다. 여기서는 podManagementPolicy를 parallel하게 설정했는데, 이렇게 하면 pod를 동시에 생성된다.

![stateful_set_parallel](/assets/images/kubernetes/stateful_set_parallel.png)

podManagementPolicy를 OrderedReady로 설정하게 되면 0,1,2가 순서대로 만들어지게 된다.

![stateful_set_ordered](/assets/images/kubernetes/stateful_set_ordered.png)


만약 1번 pod를 제거하면 어떻게 될까? --> 아래와 같이 pod1 이 지워지고 새로운 pod1이 생성되게 된다. 이처럼 pod name에 대한 보장을 해주는 것이 StatefulSet이다.

![stateful_set_guarantee_pod_name](/assets/images/kubernetes/stateful_set_guarantee_pod_name.png)

**scale 혹은 rolling update를 적용하는 것도 가능하다.**


## Job Controller

kubernetes의 경우 pod에 대해서 running 상태를 유지하려고 한다.

아래의 command을 실행하는 centos container을 만들어주게 되면, 5초 동안에는 container가 동작하지만 그 이후에는 종료된다. 하지만, kubernetes는 running pod를 유지하려는 경향이 있어, 아무것도 하지 않는 container에 대해 다시 재시작해주는 작업을 계속해서 진행한다. 즉, 작업이 완료된 container에 대해서 종료된 상태로 놔두지 않고, 애플리케이션이 끊나는 5초마다 container가 재기동하게 된다.

```shell
kubectl run testpod --image=centos:7 --command sleep 5
```

![running_container](/assets/images/kubernetes/running_container.png)

하지만, 매번 pod가 동작하는 경우만 있는 것은 아니다. 경우에 따라서는 정상적으로 종료하는 pod도 존재한다. 이를 위해 Job Controller라는 것이 존재한다.

Job Controller을 통해 Pod가 정상적으로 작업을 처리한 경우 작업을 완료하게 되고, 비정상적으로 종료된 경우는 pod를 재시작하게 된다.

![job_controller](/assets/images/kubernetes/job_controller.png)

### Practice

> job-exam.yaml

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: centos-job
spec:
#  completions: 5
#  parallelism: 2
#  activeDeadlineSeconds: 15
  template:
    spec:
      containers:
      - name: centos-container
        image: centos:7
        command: ["bash"]
        args:
        - "-c"
        - "echo 'Hello World'; sleep 50; echo 'Bye'"
      restartPolicy: Never
```

위와 같이 JobController을 통해 pod를 생성하게 되면, batch 처리가 정상적으로 완료되고 나면 해당 pod는 정상적으로 종료된다.

하지만 아래와 같이 중간에 비정상적으로 종료하게 되면 어떻게 될까?

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl create -f job-exam.yaml 
job.batch/centos-job created
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl delete pod centos-job-dphg5 
```

결과를 살펴보면, 작업(sleep 50) 진행 중이던 pod를 중간에 강제로 제거하였으므로 이는 비정상적인 종료에 해당한다. 잘 보면 pod가 제거되고 나서, 새로운 pod를 실행하는 것을 확인할 수 있다.

![job_controller_mechanism](/assets/images/kubernetes/job_controller_mechanism.jpg)

#### restartPolicy

never으로 설정되어 있으면 pod을 재시작하게 되고, OnFailure으로 명시되어 있으면 container만 재시작된다.

restartPolicy를 OnFailure로 사용하게 되면, backOffLimit도 같이 지정해주게 되는데, 이는 container 최대 재시작 횟수를 의미한다. 설정한 최대값 이상으로 재시작되게 되면 pod가 제거된다.


```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: centos-job
spec:
#  completions: 5
#  parallelism: 2
#  activeDeadlineSeconds: 15
  template:
    spec:
      containers:
      - name: centos-container
        image: centos:7
        command: ["bashc"]
        args:
        - "-c"
        - "echo 'Hello World'; sleep 50; echo 'Bye'"
      restartPolicy: OnFailure
  backoffLimit: 3
```

backoffLimit으로 설정한 3을 통해 총 3번의 재시작 이후에 pod가 재시작되는 것을 확인할 수 있다.

![job_controller_retry](/assets/images/kubernetes/job_controller_retry.jpg)


restartPolicy를 Never(기본값)으로 설정하게 되면 container가 restart되는 것이 아니라, pod 자체가 재시작된다.

![job_controller_retry_pod](/assets/images/kubernetes/job_controller_retry_pod.png)

#### Completions

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: centos-job
spec:
  completions: 5
#  parallelism: 2
#  activeDeadlineSeconds: 15
  template:
    spec:
      containers:
      - name: centos-container
        image: centos:7
        command: ["bashc"]
        args:
        - "-c"
        - "echo 'Hello World'; sleep 50; echo 'Bye'"
      restartPolicy: OnFailure
  backoffLimit: 3
```
job controller의 replicas를 수행하는 것이 Completions이다. completions을 통해 작업을 수행할 횟수를 지정할 수 있다. 

![job_controller_completions](/assets/images/kubernetes/job_controller_completions.png)

위의 경우를 보면 completed 과정이 총 3번 연달아서 수행되게 된다. 

여기에 추가로 parallelism property도 추가하게 되면 한번에 수행 되는 batch 작업의 횟수를 지정할 수 있다. 즉 아래와 같이 하게 되면 동시에 2개씩 작업이 처리 되며, 총 5번의 작업이 수행된다.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: centos-job
spec:
  completions: 5
  parallelism: 2
#  activeDeadlineSeconds: 15
  template:
    spec:
      containers:
      - name: centos-container
        image: centos:7
        command: ["bashc"]
        args:
        - "-c"
        - "echo 'Hello World'; sleep 50; echo 'Bye'"
      restartPolicy: OnFailure
  backoffLimit: 3
```

![job_controller_completions_parallelism](/assets/images/kubernetes/job_controller_completions_parallelism.png.jpg)

#### ActiveDeadlineSeconds

해당 property를 설정하게 되면 최대 어플리케이션 동작 시간을 설정할 수 있다. 즉, 아래와 같이 5로 지정한 경우 애플리케이션이 종료되지 않더라도 5초가 지나게 되면 강제로 작업을 종료하게 된다.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: centos-job
spec:
        #  completions: 5
        #  parallelism: 2
  activeDeadlineSeconds: 5
  template:
    spec:
      containers:
      - name: centos-container
        image: centos:7
        command: ["bash"]
        args:
        - "-c"
        - "echo 'Hello World'; sleep 25; echo 'Bye'"
      restartPolicy: Never
      # backoffLimit: 3
```

![job_controller_activedeadlineseconds](/assets/images/kubernetes/job_controller_activedeadlineseconds.png)

## CronJob

CronJob는 Job를 제어해서, job에 대한 제어를 할 수 있다. 리눅스에서 주기적으로 실행해야하는 명령에 대해서 처리하는 cron과 같은 역할을 수행한다고 보면 된다.

주기는 아래와 같이 나타낼 수 있다.

CronJob "0 3 1 * *"

|properties|description|
|--|--|
|Minutes|0~59|
|Hours|0~23|
|Day|1~31|
|Month|1~12|
|Day of Week|0~6|

> CronJob Schedule 예시

1. 0 9 1 * * -> 매월 1일 아침 9시에 job을 실행하도록 한다.

2. 매주 일요일 새벽 3시에 job를 실행해줘 -> 0 3 * * 0

3. 주중 새벽 3시에 job 실행 -> 0 3 * * 1-5

4. job을 5분마다 반복 실행 -> */5 * * * *

5. 2시간마다 정각에 실행 -> 0 */2 * * *


아래와 같이 job controller로 동작되는 작업에 대해서, cronjob을 활용하면 job에 대한 주기를 설정해서 반복적으로 job를 실행할 수 있도록 한다.

![cron_job_mechanism](/assets/images/kubernetes/cron_job_mechanism.png)

### Practice

> CronJob 

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cronjob-exam
spec:
  schedule: "* * * * *"
  jobTemplate:
  spec:
    template:
      spec:
        containers:
        - name: centos-container
          image: centos:7
          command: ["bashc"]
          args:
          - "-c"
          - "echo 'Hello World'; sleep 50; echo 'Bye'"
        restartPolicy: Never
```

보면, cronjob 의 jobTemplate에 들어가는 부분이 job의 spec과 똑같은 것을 확인할 수 있다. 이를 통해 cronjob이 job을 통해서 pod를 관리하는 것을 알 수 있다.

위의 schedule을 토대로 job을 실행하게 되면 매분 job이 반복해서 실행된다. 아래의 결과를 확인해보면 매분 00초에 job을 실행하는 것을 확인할 수 있다.

![cron_job_practice1](/assets/images/kubernetes/cron_job_practice1.png)


```yaml
spec:
  schedule: "* * * * *"
  startingDeadlineSeconds: 500
  concurrencyPolicy: Forbid
  successfulJobHistoryLimit: 3
```

추가로, CronJob에 추가할 수 있는 속성이 있는데, 아래와 같다.

|Property|Description|
|--|--|
|startingDeadlineSeconds|설정한 초 이내에 job이 실행되지 않으면 job을 취소시킨다. |
|concurrencyPolicy|동시에 작동될 수 있는 job의 개수 지정, 작업에 따라 소요되는 시간은 다양하다. 하지만 schedule 정책의 주기를 넘어서는 job도 존재할 수 있는데, 이때 Forbid로 설정하게 되면, 이전의 job이 처리되어야 새로운 job을 실행할 수 있게 하고, Allow으로 설정하면 동시에 여러개의 job이 실행하는 것을 허용한다.|
|successfulJobHistoryLimit|job 기록을 몇개까지 남길 것인지에 대한 설정으로, 해당 값만 큼 job 기록이 남게 되고, 넘어서는 작업에 대해서는 가장 오래전에 실행된 기록을 제거한다.|

아래의 결과를 보면 successfulJobHistoryLimit가 3으로 설정되어 있기 때문에 job이 추가로 실행되면서 가장 오래된 history가 1개 삭제된다.

![cron_job_practice2](/assets/images/kubernetes/cron_job_practice2.jpg)



## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=0rYt3PcggzA&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=17)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










