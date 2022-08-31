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

![deployment_rolling_update_annotation2](/assets/images/kubernetes/deployment_rolling_update_annotation)

3. rollout history 정보

```shell
toojey-master@toojeymaster-VirtualBox:~/kubernetes$ kubectl rollout history deployment deploy-nginx 
deployment.apps/deploy-nginx 
REVISION  CHANGE-CAUSE
1         version 1.14
2         version 1.15
```



## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=0rYt3PcggzA&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=17)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










