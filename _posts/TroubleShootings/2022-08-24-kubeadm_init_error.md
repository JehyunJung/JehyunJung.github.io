---
title: "kubeadm init 에러"
excerpt: ""

categories:
  - Trouble_Shooting
tags:
  - ssh
  - ubuntu
  - kubernetes
  - troubleshooting
---

# kubeadm init 에러

## 에러 내용

```
[kubelet-check] It seems like the kubelet isn't running or healthy.
[kubelet-check] The HTTP call equal to 'curl -sSL http://localhost:10248/healthz' failed with error: Get "http://localhost:10248/healthz": dial tcp [::1]:10248: connect: connection refused.
```

## 에러 원인

위와 같은 문제가 발생하는 원인 container의 cgroup 드라이버 설정이 Kubernetes와 일치하지 않아서 발생하는 문제이다.


## 에러 해결방법
1. Docker Daemon 설정

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

2. Docker Reload

위와 같이 설정파일을 구성한 다음 Docker 데몬을 reloading해준다.
```shell
mkdir -p /etc/systemd/system/docker.service.d
systemctl daemon-reload
systemctl restart docker
```

3. master-node initialization

그런 다음, 아래와 명령어를 통해 master 노드 초기화 과정을 다시 진행시켜준다.
```shell
kubeadm reset
kubeadm init
```