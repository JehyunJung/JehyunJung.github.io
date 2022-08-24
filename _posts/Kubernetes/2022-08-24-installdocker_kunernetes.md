---
title: "Vitual Machine에 Kubernetes 환경 구성하기"
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

# Virtual Machine을 이용해서, Kubernetes 환경 구성하기

## VM 준비

OS: Ubuntu 20.04LTS
RAM: 2G/4G(master은 4G)
SSD: 20G
CPU: 3

Nat Network 구성

G/W: 10.100.0.1
DNS: 10.100.0.1

master: 10.100.0.101
node1: 10.100.0.102
node2: 10.100.0.104

## Docker 설치

1. apt package 업데이트 및 설치

```shell
sudo apt-get update
sudo apt-get install \
  ca-certificates \
  curl \
  gnupg \
  lsb-release
```

2. Docker GPG key 설정

```shell
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

3. Docker Repository 설정

```shell
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

4. docker-ce, docker-ce-cli, containerd 설치

```shell
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

```shell
systemctl status docker
```

> Results

![docket_status](/assets/images/kubernetes/docker_status.png)


* docker의 cgroup설정을 변경해줘야한다.

Kubernetes에서는 Docker 데몬의 드라이버를 systemd로 권장하고 있기 때문에, 해당 cgroup 드라이버 설정을 변경해줘야한다.

```shell
cat > /etc/docker/daemon.json <<EOF
	 {
	   "exec-opts": ["native.cgroupdriver=systemd"],
	   "log-driver": "json-file",
	   "log-opts": {
	     "max-size": "100m"
	   },
	   "storage-driver": "overlay2"
	 }
	 EOF
```

위와 같이 설정파일을 구성한 다음 Docker 데몬을 reloading해준다.

```shell
mkdir -p /etc/systemd/system/docker.service.d
systemctl daemon-reload
systemctl restart docker
```

## Kubernetes 환경 구축

1. 우선, Kubernetes 환경을 구성하기 위해서는 swap 메모리를 비활성화 해야한다.

```shell
swapoff -a && sed -i '/swap/s/^/#/' /etc/fstab
```
위의 명령어로 실행하게 되면, /etc/fstab에 설정된 swap 메모리 mount 정보가 주석 처리 되면서 swap 메모리가 영구적으로 비활성화 된다.

2. public signing key, kubernetes repository 추가

```shell
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

3. kubeadm, kubelet, kubectl을 설치한 다음, 버전을 고정시켜준다.

```shell
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

kubeadm은 node를 제어하기 위한 명령어로, cluster 환경 구성에 활용된다.
kubelet은 kubernetes 데몬으로, 모든 노드에서 동작하게 된다.
kubectl은 kubernetes cluster에 명령을 요청할 수 있는 cli이다.

### Master-node
Master-node는 worker node들을 관리하는 control-plane 역할을 하게 된다.

1. control plane을 구성하기 위해, master node를 초기화시켜준다.

```shell
kubeadm init
```

위의 명령어를 수행하게 되면, control plane에서 필요한 component들을 설치하게 된다.

해당 명령어를 수행하고 나면, 아래와 같은 명령어가 화면에서 출력되게 된다.
이 명령어를 따로 파일에 기록해두자 --> **나중에 worker-node를 cluster에 구성하기 위해 필요한 명령어이다.**

```shell
kubeadm join [master-node Ip] --token [tokenName] --discovery-token-ca-cert-hash [hashValue]
```

2. kubectl 설정
kubectl을 사용하기 위해 directory 생성 및 소유권을 변경해줘야한다.

```shell
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

3. CNI 구성

pod 즉, 각각 node와 통신을 수행하기 위해서는 Container Network Interface를 설치해야한다. CNI에는 Weave, Flannel, Calico, 등이 있지만 여기서는 Weave를 이용해서 설정하였다.

```shell
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```

### Worker-nodes

1. 구성한 cluster에 join시킨다.

```shell
kubeadm join [master-node Ip] --token [tokenName] --discovery-token-ca-cert-hash [hashValue]
```
이전에 저장해둔 kubeadm join 명령어를 이용해서 worker-node를 cluster에 구성한다.


> Cluster 구성 확인

master-node에서 cluster 환경을 확인할 수 있다.

```shell
kubectl get nodes
```

![kubernetes_cluster](/assets/images/kubernetes/kubectl_get_nodes.jpg)

아래의 명령어를 통해 확장된 정보도 확인할 수 있다.

```shell
kubectl get nodes -o wide
```

![kubectl_get_nodes_ext](/assets/images/kubernetes/kubectl_get_nodes_ext.jpg)

추가로, 아래의 명령어 수행을 통해 kubectl 관련 명령어에 대한 자동완성 기능을 활용할 수 있다.

```shell
sudo apt install bash-completion
kubectl completion bash
sudo chown $(id -u):$(id -g) /etc/bash_completion.d/kubectl
sudo kubectl completion bash >/etc/bash_completion.d/kubectl
source ~/.bashrc
```


## References

### 영상
[따배쿠](https://www.youtube.com/watch?v=lheclzO-G7k&list=PLApuRlvrZKohaBHvXAOhUD-RxD0uQ3z0c&index=5)

### 공식문서
[Docker 공식문서](https://docs.docker.com/desktop/install/ubuntu/)
[kubernetes 공식문서](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)

### 블로그
[blog1](https://gain-yoo.github.io/kubernetes/kubeadm%EC%9C%BC%EB%A1%9C-%ED%81%B4%EB%9F%AC%EC%8A%A4%ED%84%B0-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0-(1)/)










