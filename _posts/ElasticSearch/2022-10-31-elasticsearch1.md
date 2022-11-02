---
title: "Elastic Search 1"
excerpt: "Development Environment Settings"

categories:
  - elastic_search
tags:
  - elastic_search
---

# Elastic Search

## Google Cloud Platform 구성

VM Specs
- 2vcpu, 4gb ram
- 20gb 
- centOS 7

## Elastic Search Download

1. 공식 홈페이지에서 elastic search, kibana를 wget 명령어를 통해 설치한다.

```sh
#Elastic Search
wget -y https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-8.4.3-linux-x86_64.tar.gz

#Kibana
wget https://artifacts.elastic.co/downloads/kibana/kibana-8.4.3-linux-x86_64.tar.gz
```

2. elasticsearch 환경을 구성한다.

```sh
./bin/elasticsearch.sh
```

**아래와 같은 에러 메세지가 뜨면 해당 디렉토리의 소유자 권한을 확인해보자**

```
[toojey@elastic1 bin]$ ./elasticsearch
./elasticsearch-cli: line 14: /home/els-843/jdk/bin/java: Permission denied
```

3. elastic cluster에 접속 시도

아래와 같이 9200번 포트에 대해 요청을 시도하면 elastic cluster가 정상적으로 동작하는 지 확인할 수 있다.

```sh
curl localhost:9200
```

하지만 elastic 8.0 이후 부터는 TLS 기반의 인증이 default로 설정되어 에러가 발생하게 된다.

따라서, 아래의 링크의 게시글 내용을 바탕으로 요청 방식을 수정해야한다.

[link](https://nanglam.tistory.com/34?category=954180)

user/password을 설정해서 요청을 수행하면 아래와 같이 정상적으로 https 응답이 오는 것을 확인할 수 있다.

```
{
  "name" : "elastic1",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "vtMbST2-T3icSoQ1Uv_Wtw",
  "version" : {
    "number" : "8.4.3",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "42f05b9372a9a4a470db3b52817899b99a76ee73",
    "build_date" : "2022-10-04T07:17:24.662462378Z",
    "build_snapshot" : false,
    "lucene_version" : "9.3.0",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```


4. Background Execution

일반적으로 shell 파일을 통해 elastic search를 해당 터미널에서 계속해서 실행하게 된다. 하지만, 실제 사용환경에서는 elastic-search를 background에서 daemon 형태로 실행하게 되는 경우가 대부분이다. 그리고, elastic-search에서도 이러한 기능을 제공해준다. 

```sh
#-d : execute as daedmon
#-p : return pid of daemon
./elasticsearch -d -p els.pid
```

위와 같이 실행하게 되면 elastic search가 daemon 형태로 실행하면서, pid는 els.pid 파일에 저장하게 된다.

아래의 그림을 통해 pid가 실제로 els.pid에 저장되는 것을 확인할 수 있다.

![pid_matching](/assets/images/elasticsearch/pid_matching.jpg)

하지만, 매번 이런식으로 daemon으로 실행하고, 이를 삭제 하기 위해 pid를 저장하는 파일을 참조하는 과정은 번거롭다. 그래서,  start.sh, stop.sh와 같은 스크립트를 생성해놓으면 간편하게 elastic-search를 실행/중지 할 수 있다.

> start.sh

```sh
../bin/elasticsearch -ds -p els.pid
```

> stop.sh

```sh
kill `cat els.pid`
```


## Elastic Search 환경 설정

1. jvm.options

elastic search의 경우 jvm 위에서 동작하게 되는데, 이떄 jvm에서의 heap 메모리 영역의 크기를 설정할 수 있다.


2. elasticsearch.yml 파일

전반적인 elastic cluster에 관련된 환경설정을 수정할 수 있다.

```yml
cluster.name:"es-cluster-1"
node.name:"node-1"
```

위의 설정을 통해, cluster, node 정보를 수정하였으며, 이외에도 path, log, http port, 등과 같은 값을 수정할 수 있다.

[options](https://esbook.kimjmin.net/02-install/2.3-elasticsearch/2.3.2-elasticsearch.yml)


## Elastic Search Structure

![structure](/assets/images/elasticsearch/elastic_search_structure.png)

엘라스틱 서치의 구조는 위와 같은 구조로 되어 있으며, 외부 접속은 http 방식으로 9200 번 포트를 활용하여 통신을 주고 받으며, 노드 내부에서는 TCP 방식을 통해 9300번 포트를 이용해서 통신을 수행한다.

여러 노드가 하나의 cluster을 이루기 위해서는 cluster.name을 공통으로 사용하면 된다.

## Network Access Configuration

기본 설정으로는 elasticsearch의 경우 내부접속만 가능하도록 되어 있다. 외부 접속을 허용하기 위해서는 아래와 같이 network.host 설정을 해줘야한다.

>config/elasticsearch.yml

```yml
#_site_로 설정하게 해당 서버 IP를 이용해서 elastic-search를 실행한다.
cluster.name: "es-cluster-1"
node.name: "node-1"
network.host: "_site_"
discovery.seed_hosts: ["elastic1"]
cluster.initial_master_nodes: ["node-1"]
```

위와 같이 network host을 설정하고 elasticsearch을 실행하게 되면, bootstrap 체크 과정을 거치게 되면서 아래와 같은 에러가 발생하게 된다. 실질적으로 운영 환경에서 동작하게 하려면 아래의 에러를 모두 해결한 다음에 재실행해야한다.

*_local_ 로 설정할 경우 개발자 모드로 실행되어 bootstrap 체크 과정을 거치지 않는다.*

![network_host_error](/assets/images/elasticsearch/network_host_error.png)

> increase file descriptor

/etc/security/limits.conf에서 file descriptor 최대 할당량을 설정한다.(elastic search의 경우 많은 file을 다루기 때문에 file descriptor가 많이 요구된다.)

```
...
toojey  -       nofile  65535
```

> increase virtual memorymap count

/etc/sysctl.conf에서 memory_map 값을 수정한다.(elastic search의 index 저장을 위해 활용된다.)

```
...
vm.max_map_count=262144
```

위의 설정을 마친 후에 시스템 재부팅을 한다.


아래와 같이 정상적으로 외부 요청에 대해 응답이 반환되는 것을 확인할 수 있다.

![external_access](/assets/images/elasticsearch/external_access.png)

## References

- 영상
  - [youtube](https://www.youtube.com/watch?v=Ks0P49B4OsA&list=PLhFRZgJc2afp0gaUnQf68kJHPXLG16YCf)

- 문서
  - [document](https://www.elastic.co/guide/index.html)
  - [guidebook](https://esbook.kimjmin.net/)








