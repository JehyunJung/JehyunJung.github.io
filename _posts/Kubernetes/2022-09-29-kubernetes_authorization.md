---
title: "Kubernetes Authorization"
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
# Kubernetes Authorization

특정 유저, serviceaccount가 API 접근이 가능할 권한이 있는지 확인하는 작업이다.
Authorization은 권한을 설정하는 role이 있고, user,service account과 role을 이어주는 role binding 작업이 존재한다.

![kubectl_authorization](/assets/images/kubernetes/kubectl_authorization.png)

## Role & RoleBiding

### Role

role은 아래와 같이 구성할 수 있으며, resources, verbs를 조절하여 원하는 resource에 대한 작업 권한을 부여한다.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
 namespace: default       
 name: developer
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs:
  - create
  - get
  - list
  - update
  - delete       
```
apiGroups에는 사용하는 api에 종류를 명시해야된다.
가령, deployments에 대한 권한을 설정하는 경우 deployments은 apps api를 사용하기 때문에, apiGroups에 apps를 추가해야 한다.

resources에 작업하고자하는 resource의 종류를 명시한다.

|verbs|descriptions|
|--|--|
|create|새로운 리소스 생성|
|get|개별 리소스 조회|
|list|여러건의 리소스 조회|
|update|기존 리소스 내용 전체 업데이트|
|patch|기존 리소스 중 일부 내용 변경|
|delete|개별 리소스 삭제|
|deletecollection|여러 리소스 삭제|

### RoleBinding

user에 role을 할당해주는 작업을 진행한다.

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  creationTimestamp: null
  name: developer-binding-myuser
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: developer
subjects:
- apiGroup: rbac.authorization.k8s.io
  kind: User
  name: myuser                                     
```

|property|descriptions|
|--|--|
|roleRef|role 설정|
|subjects|role을 사용하는 주체에 대한 설정|

### Practice

> Adding new user credentials

```sh
#새로운 유저 정보를 할당해준다.
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl config set-credentials myuser --client-key=myuser.key --client-certificate=myuser.crt --embed-certs=true
User "myuser" set.
#해당 유저로 동작하는 context를 생성한다.
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl config set-context myuser --cluster=kubernetes --user=myuser
Context "myuser" created.
#새로운 context으로 실행한다.
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl config use-context myuser 
Switched to context "myuser".
```
위의 명령어를 수행하고 나면 아래의 config를 정보를 통해, context와 credential이 생성된점을 확인할 수 있다.

![kubectl_new_context](/assets/images/kubernetes/kubectl_new_context.jpg)

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get pods
NAME                            READY   STATUS    RESTARTS      AGE
deploy-nginx-5cfbcf5f65-5577v   1/1     Running   2 (26m ago)   2d1h
deploy-nginx-5cfbcf5f65-9xqvm   1/1     Running   2 (26m ago)   2d
deploy-nginx-5cfbcf5f65-wzgjk   1/1     Running   2 (26m ago)   2d1h
testpod                         1/1     Running   1 (26m ago)   23h
```
pod에 대한 접근권한만 있기 때문에, pod에 대한 api는 정상적으로 동작하는 것을 확인할 수 있지만, 아래의 service에대한 요청을 진행하는 경우 권한이 없음을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get services
Error from server (Forbidden): services is forbidden: User "myuser" cannot list resource "services" in API group "" in the namespace "default"
```

## Cluster Role, RoleBinding

Role의 경우, 특정 namespace에 대한 resouce 요청만 가능했었는데, clusterrole을 설정하게 되면 다른 namespace에 있는 resource에 대해서 접근을 가능하게끔 한다.

![kubectl_clusterole](/assets/images/kubernetes/kubectl_clusterole.png)

기존의 role을 가진 myuser가 kube-system namespace에 있는 pod에 대해 조회를 수행하면 아래와 같이 오류가 뜨는 점을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get pods
NAME                            READY   STATUS    RESTARTS      AGE
deploy-nginx-5cfbcf5f65-5577v   1/1     Running   2 (30m ago)   2d1h
deploy-nginx-5cfbcf5f65-9xqvm   1/1     Running   2 (30m ago)   2d1h
deploy-nginx-5cfbcf5f65-wzgjk   1/1     Running   2 (30m ago)   2d1h
testpod                         1/1     Running   1 (30m ago)   24h
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get pods -n kube-system
Error from server (Forbidden): pods is forbidden: User "myuser" cannot list resource "pods" in API group "" in the namespace "kube-system"
```

ClusterRole, ClusterRoleBinding을 생성하는 작업은 Role을 생성하는 작업과 매우 유사하다, 이름만, Role에서 ClusterRole로 바꿔주면 된다.

### Practice

ClusterRole, ClusterRoleBinding을 설정하고 pod에 대한 API를 수행하게 되면 아래와 같이 현재 namespace 이외의 다른 namespace에 존재하는 pod에 대한 API 수행이 가능함을 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get pods
NAME                            READY   STATUS    RESTARTS      AGE
deploy-nginx-5cfbcf5f65-5577v   1/1     Running   2 (38m ago)   2d1h
deploy-nginx-5cfbcf5f65-9xqvm   1/1     Running   2 (38m ago)   2d1h
deploy-nginx-5cfbcf5f65-wzgjk   1/1     Running   2 (38m ago)   2d1h
testpod                         1/1     Running   1 (38m ago)   24h
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get pods -n kube-system
NAME                                              READY   STATUS    RESTARTS       AGE
coredns-565d847f94-6grt6                          1/1     Running   6 (38m ago)    24d
coredns-565d847f94-fcckb                          1/1     Running   6 (38m ago)    24d
etcd-toojeymaster-virtualbox                      1/1     Running   22 (38m ago)   24d
kube-apiserver-toojeymaster-virtualbox            1/1     Running   23 (38m ago)   24d
kube-controller-manager-toojeymaster-virtualbox   1/1     Running   22 (38m ago)   24d
kube-proxy-9tgps                                  1/1     Running   7 (38m ago)    24d
kube-proxy-fhfw2                                  1/1     Running   7 (39m ago)    24d
kube-proxy-x6tv7                                  1/1     Running   7 (38m ago)    24d
kube-scheduler-toojeymaster-virtualbox            1/1     Running   30 (38m ago)   24d
weave-net-drzqb                                   2/2     Running   15 (38m ago)   24d
weave-net-jbw7p                                   2/2     Running   14 (38m ago)   24d
weave-net-k726r                                   2/2     Running   12 (39m ago)   24d
```

### Extra

kubernetes에서 기본적으로 제공해주는 clusterrole이 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl get clusterrole
NAME                                                                   CREATED AT
admin                                                                  2022-09-05T02:19:50Z
cluster-admin                                                          2022-09-05T02:19:50Z
developer                                                              2022-09-29T02:19:39Z
edit                                                                   2022-09-05T02:19:50Z
ingress-nginx                                                          2022-09-05T02:24:54Z
ingress-nginx-admission                                                2022-09-05T02:24:54Z
kubeadm:get-nodes                                                      2022-09-05T02:19:52Z
system:aggregate-to-admin                                              2022-09-05T02:19:50Z
system:aggregate-to-edit                                               2022-09-05T02:19:50Z
system:aggregate-to-view                                               2022-09-05T02:19:50Z
system:auth-delegator                                                  2022-09-05T02:19:50Z
system:basic-user                                                      2022-09-05T02:19:50Z
system:certificates.k8s.io:certificatesigningrequests:nodeclient       2022-09-05T02:19:50Z
system:certificates.k8s.io:certificatesigningrequests:selfnodeclient   2022-09-05T02:19:50Z
system:certificates.k8s.io:kube-apiserver-client-approver              2022-09-05T02:19:50Z
system:certificates.k8s.io:kube-apiserver-client-kubelet-approver      2022-09-05T02:19:50Z
system:certificates.k8s.io:kubelet-serving-approver                    2022-09-05T02:19:50Z
system:certificates.k8s.io:legacy-unknown-approver                     2022-09-05T02:19:50Z
system:controller:attachdetach-controller                              2022-09-05T02:19:50Z
system:controller:certificate-controller                               2022-09-05T02:19:50Z
system:controller:clusterrole-aggregation-controller                   2022-09-05T02:19:50Z
system:controller:cronjob-controller                                   2022-09-05T02:19:50Z
system:controller:daemon-set-controller                                2022-09-05T02:19:50Z
system:controller:deployment-controller                                2022-09-05T02:19:50Z
system:controller:disruption-controller                                2022-09-05T02:19:50Z
system:controller:endpoint-controller                                  2022-09-05T02:19:50Z
system:controller:endpointslice-controller                             2022-09-05T02:19:50Z
system:controller:endpointslicemirroring-controller                    2022-09-05T02:19:50Z
system:controller:ephemeral-volume-controller                          2022-09-05T02:19:50Z
system:controller:expand-controller                                    2022-09-05T02:19:50Z
system:controller:generic-garbage-collector                            2022-09-05T02:19:50Z
system:controller:horizontal-pod-autoscaler                            2022-09-05T02:19:50Z
system:controller:job-controller                                       2022-09-05T02:19:50Z
system:controller:namespace-controller                                 2022-09-05T02:19:50Z
system:controller:node-controller                                      2022-09-05T02:19:50Z
system:controller:persistent-volume-binder                             2022-09-05T02:19:50Z
system:controller:pod-garbage-collector                                2022-09-05T02:19:50Z
system:controller:pv-protection-controller                             2022-09-05T02:19:50Z
system:controller:pvc-protection-controller                            2022-09-05T02:19:50Z
system:controller:replicaset-controller                                2022-09-05T02:19:50Z
system:controller:replication-controller                               2022-09-05T02:19:50Z
system:controller:resourcequota-controller                             2022-09-05T02:19:50Z
system:controller:root-ca-cert-publisher                               2022-09-05T02:19:50Z
system:controller:route-controller                                     2022-09-05T02:19:50Z
system:controller:service-account-controller                           2022-09-05T02:19:50Z
system:controller:service-controller                                   2022-09-05T02:19:50Z
system:controller:statefulset-controller                               2022-09-05T02:19:50Z
system:controller:ttl-after-finished-controller                        2022-09-05T02:19:50Z
system:controller:ttl-controller                                       2022-09-05T02:19:50Z
system:coredns                                                         2022-09-05T02:19:52Z
system:discovery                                                       2022-09-05T02:19:50Z
system:heapster                                                        2022-09-05T02:19:50Z
system:kube-aggregator                                                 2022-09-05T02:19:50Z
system:kube-controller-manager                                         2022-09-05T02:19:50Z
system:kube-dns                                                        2022-09-05T02:19:50Z
system:kube-scheduler                                                  2022-09-05T02:19:50Z
system:kubelet-api-admin                                               2022-09-05T02:19:50Z
system:monitoring                                                      2022-09-05T02:19:50Z
system:node                                                            2022-09-05T02:19:50Z
system:node-bootstrapper                                               2022-09-05T02:19:50Z
system:node-problem-detector                                           2022-09-05T02:19:50Z
system:node-proxier                                                    2022-09-05T02:19:50Z
system:persistent-volume-provisioner                                   2022-09-05T02:19:50Z
system:public-info-viewer                                              2022-09-05T02:19:50Z
system:service-account-issuer-discovery                                2022-09-05T02:19:50Z
system:volume-scheduler                                                2022-09-05T02:19:50Z
view                                                                   2022-09-05T02:19:50Z
weave-net                                                              2022-09-05T02:21:18Z
```

가령, view를 확인해보면 대부분의 resource에 대한 view(get,list,watch) 권한을 가지는 확인할 수 있다.

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl describe clusterrole view
Name:         view
Labels:       kubernetes.io/bootstrapping=rbac-defaults
              rbac.authorization.k8s.io/aggregate-to-edit=true
Annotations:  rbac.authorization.kubernetes.io/autoupdate: true
PolicyRule:
  Resources                                    Non-Resource URLs  Resource Names  Verbs
  ---------                                    -----------------  --------------  -----
  bindings                                     []                 []              [get list watch]
  configmaps                                   []                 []              [get list watch]
  endpoints                                    []                 []              [get list watch]
  events                                       []                 []              [get list watch]
  limitranges                                  []                 []              [get list watch]
  namespaces/status                            []                 []              [get list watch]
  namespaces                                   []                 []              [get list watch]
  persistentvolumeclaims/status                []                 []              [get list watch]
  persistentvolumeclaims                       []                 []              [get list watch]
  pods/log                                     []                 []              [get list watch]
  pods/status                                  []                 []              [get list watch]
  pods                                         []                 []              [get list watch]
  replicationcontrollers/scale                 []                 []              [get list watch]
  replicationcontrollers/status                []                 []              [get list watch]
  replicationcontrollers                       []                 []              [get list watch]
  resourcequotas/status                        []                 []              [get list watch]
  resourcequotas                               []                 []              [get list watch]
  serviceaccounts                              []                 []              [get list watch]
  services/status                              []                 []              [get list watch]
  services                                     []                 []              [get list watch]
  controllerrevisions.apps                     []                 []              [get list watch]
  daemonsets.apps/status                       []                 []              [get list watch]
  daemonsets.apps                              []                 []              [get list watch]
  deployments.apps/scale                       []                 []              [get list watch]
  deployments.apps/status                      []                 []              [get list watch]
  deployments.apps                             []                 []              [get list watch]
  replicasets.apps/scale                       []                 []              [get list watch]
  replicasets.apps/status                      []                 []              [get list watch]
  replicasets.apps                             []                 []              [get list watch]
  statefulsets.apps/scale                      []                 []              [get list watch]
  statefulsets.apps/status                     []                 []              [get list watch]
  statefulsets.apps                            []                 []              [get list watch]
  horizontalpodautoscalers.autoscaling/status  []                 []              [get list watch]
  horizontalpodautoscalers.autoscaling         []                 []              [get list watch]
  cronjobs.batch/status                        []                 []              [get list watch]
  cronjobs.batch                               []                 []              [get list watch]
  jobs.batch/status                            []                 []              [get list watch]
  jobs.batch                                   []                 []              [get list watch]
  endpointslices.discovery.k8s.io              []                 []              [get list watch]
  daemonsets.extensions/status                 []                 []              [get list watch]
  daemonsets.extensions                        []                 []              [get list watch]
  deployments.extensions/scale                 []                 []              [get list watch]
  deployments.extensions/status                []                 []              [get list watch]
  deployments.extensions                       []                 []              [get list watch]
  ingresses.extensions/status                  []                 []              [get list watch]
  ingresses.extensions                         []                 []              [get list watch]
  networkpolicies.extensions                   []                 []              [get list watch]
  replicasets.extensions/scale                 []                 []              [get list watch]
  replicasets.extensions/status                []                 []              [get list watch]
  replicasets.extensions                       []                 []              [get list watch]
  replicationcontrollers.extensions/scale      []                 []              [get list watch]
  ingresses.networking.k8s.io/status           []                 []              [get list watch]
  ingresses.networking.k8s.io                  []                 []              [get list watch]
  networkpolicies.networking.k8s.io            []                 []              [get list watch]
  poddisruptionbudgets.policy/status           []                 []              [get list watch]
  poddisruptionbudgets.policy                  []                 []              [get list watch]
```
cluster-admin clustterrole을 확인하면 모든 resource에 대한 모든 권한을 부여하는 것을 확인할 수 있다. 
**이는 kubernetes-admin과 동일한 권한을 가지는 것으로, 이를 함부러 다른 유저에 할당해서는 안된다.**

```sh
toojey-master@toojeymaster-VirtualBox:~/kubernetes/myuser$ kubectl describe clusterrole cluster-admin 
Name:         cluster-admin
Labels:       kubernetes.io/bootstrapping=rbac-defaults
Annotations:  rbac.authorization.kubernetes.io/autoupdate: true
PolicyRule:
  Resources  Non-Resource URLs  Resource Names  Verbs
  ---------  -----------------  --------------  -----
  *.*        []                 []              [*]
             [*]                []              [*]
```




## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=b457Nrk9GKk&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=28)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










