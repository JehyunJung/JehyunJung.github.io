---
title: "Elastic Search 3"
excerpt: "Kibana Settings"

categories:
  - elastic_search
tags:
  - elastic_search
---

# Kibana Settings

## ElasticSearch Architecture

> Before Kibana

![elastic_cluster_structure](/assets/images/elasticsearch/elastic_cluster_structure.png)

> After Kibana

![elastic_cluster_kibana_structure](/assets/images/elasticsearch/elastic_cluster_kibana_structure.png)

## Kibana Settings

ElasticSearch과 비슷하게 키바나 관련 환경설정 파일인 kibana.yml가 존재한다.

> conf/kibana.yml

```yml
#키비나가 돌아가는 host
server.host: "elastic3"
#키바나가 동작하는 서버의 별칭
server.name: "my-kibana"
#elasticsearch가 동작하는 host
elasticsearch.hosts: ["http://elastic3:9200"]
#elasticsearch에 접속할때 사용하게 될 ID
elasticsearch.username: "kibana_system"
```
PW의 경우 keystore에 저장한다.

```sh
[toojey@elastic3 kib-843]$ ./bin/kibana-keystore create
Created Kibana keystore in /home/toojey/kib-843/config/kibana.keystore
[toojey@elastic3 kib-843]$ ./bin/kibana-keystore add elasticsearch.password
```

**이때, kibana_system에 대한 비밀번호는 elasticsearch에서 초기화하는 것이 가능하다.**

외부에 Kibana UI에 접속할 수 있도록 하기 위해 5601 포트에 대한 방화벽 설정을 열어준다.

> Result

Local PC에서 browser로 kibana가 동작중인 서버에 접속하게 되면 아래와 같은 화면을 확인할 수 있다.

![kibana](/assets/images/elasticsearch/kibana.png)

## Running Kibana Daemon

기존에 elasticsearch에 대해서도 script file을 생성해서 foreground 형태가 아닌, Background에서 동작하도록 하였다.

elasticsearch에서는 -d 옵션을 통해 daemon으로 실행할 수 있도록 기본 옵션을 제공하지마, kibana는 그렇지 않아서, 이에 대한 처리를 직접 수동으로 진행해야한다.

### pm2을 활용하여 daemon을 실행

kibana의 경우, node.js 기반으로 동작하기 때문에, pm2와 같은 node 기반의 background process 실행이 가능하다.

그러면, node 설치 부터 kibana background process 실행까지 과정을 알아보자

1. NVM 설치

version 별로 node를 설치할 수 있는 nvm을 설치한다.

```
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

2. Node.js 설치

이때, kibana에 맞는 node.js 버전을 설치해야한다. 이는, kibana folder의 package.json을 참고한다.

> package.json

```json
{
  "name": "kibana",
  "description": "Kibana is a browser based analytics and search dashboard for Elasticsearch. Kibana is a snap to setup and start using. Kibana strives to be easy to get started with, while also being flexible and powerful, just like Elasticsearch.",
  "keywords": [
    "kibana",
    "elasticsearch",
    "logstash",
    "analytics",
    "visualizations",
    "dashboards",
    "dashboarding"
  ],
  "version": "8.4.3",
  "branch": "8.4",
  "build": {
    "number": 55572,
    "sha": "1ceb607762eaafa726c61d6eee5b95359142d4c4",
    "distributable": true,
    "release": true
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/elastic/kibana.git"
  },
  "engines": {
    "node": "16.17.1"
  }
}
```

```sh
nvm install 16.17.1
```

3. pm2 설치

```sh
npm install pm2 -g
```

4. pm2로 kibana process 실행

```sh
pm2 start src/cli/cli.js
```

아래와 같이 background에서 정상적으로 동작하는 것을 확인할 수 있다.

![kibana_background](/assets/images/elasticsearch/kibana_background.png)

5. script 파일 생성

background 동작을 원할하게 하기 위해 script 파일을 활용한다.

> kib-start.sh

```sh
pm2 start ~/kib-843/src/cli/cli.js --name kibana
```

> kib-stop.sh

```sh
pm2 stop kibana
```

## References

- 영상
  - [youtube](https://www.youtube.com/watch?v=Ks0P49B4OsA&list=PLhFRZgJc2afp0gaUnQf68kJHPXLG16YCf)

- 문서
  - [document](https://www.elastic.co/guide/index.html)
  - [guidebook](https://esbook.kimjmin.net/)








