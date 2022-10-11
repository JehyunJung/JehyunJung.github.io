---
title: "Apache Kafka 2"
excerpt: "Apache Kafka Installation"

categories:
  - kafka
tags:
  - kafka
---

# Apache Kafka Installation

1. jdk 설치

```sh
sudo apt install openjdk-11-jdk
```

2. apache kafka 관련 binary 파일 설치

```sh
wget https://downloads.apache.org/kafka/3.3.1/kafka_2.13-3.3.1.tgz
```

3. kafka server에 대한 연결 설정을 수정한다.

> config/server.properties
```
############################# Socket Server Settings #############################

# The address the socket server listens on. If not configured, the host name will be equal to the value of
# java.net.InetAddress.getCanonicalHostName(), with PLAINTEXT listener name, and port 9092.
#   FORMAT:
#     listeners = listener_name://host_name:port
#   EXAMPLE:
#     listeners = PLAINTEXT://your.host.name:9092
listeners=PLAINTEXT://:9092

# Listener name, hostname and port the broker will advertise to clients.
# If not set, it uses the value for "listeners".
advertised.listeners=PLAINTEXT://10.100.0.101:9092
```

listeners 설정을 통해 kafka가 동작하게 될 port 번호를 설정하고 advertised.listeners을 이용해서 kafka client을 통한 연결 요청시 어떠한 IP/PORT로 접속하면 되는 지에 대한 정보를 반환한다.

4. zookeeper 와 kafka 서버 실행

```sh
toojey-master@toojeymaster-VirtualBox:~/kafka/kafka_2.13-3.3.1$ bin/zookeeper-server-start.sh -daemon config/zookeeper.properties
toojey-master@toojeymaster-VirtualBox:~/kafka/kafka_2.13-3.3.1$ bin/kafka-server-start.sh -daemon config/server.properties 

toojey-master@toojeymaster-VirtualBox:~/kafka/kafka_2.13-3.3.1$ jps
20784 Jps
20690 Kafka
20291 QuorumPeerMain
```

zookeeper와 kafka를 실행하였고 jps(자바 프로세스 동작 확인)를 이용해서 정상적으로 실해됨을 확인할 수 있다.

5. Local 환경에서 Kafka Cluster에 접속시도

Local 환경에서 위와 동일하게 kafka 관련 바이너리 파일을 설치하고 아래와 같은 명령어 수행을 통해 실제 kafka cluster에 접속이 되는 지 확인해보자


## References

- 영상
  - [youtube](https://www.youtube.com/watch?v=ozxVgaqGNhM&list=PL3Re5Ri5rZmksx3uuv7gU7Mg6fm69y7wh&index=2)

- 블로그
  - [kafka101](https://always-kimkim.tistory.com/entry/kafka101-broker)

  - [Kafka](https://velog.io/@jwpark06/Kafka-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%A1%B0-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0)








