---
title: "Apache Kafka"
excerpt: ""

categories:
  - kafka
tags:
  - kafka
---

# What is Apache Kafka?

## Backgrounds

![before_kafka](/assets/images/kafka/before_kafka.png)

카프카가 도입되기 전에는 위의 그림과 같이 엔드 투 엔드 방식의 아키텍쳐를 구성하였다. 이렇게 서로 다른 파이프 라인을 통해 구성하게 되므로써 데이터 연동성이 복잡한 문제를 겪게 되고, 추후 아키텍쳐 확장에 많은 노력이 요구된다.

![after_kafka](/assets/images/kafka/after_kafka.png)

이러한, 데이터 연동성의 문제를 해결한 것이 바로 카프카이다.
카프카는 consumer(데이터를 활용하는 영역) 과 producer(데이터를 생성하는 영역)을 구분하여, 그 사이를 카프카를 통해 연결하는 아키텍쳐이다. 이와 같이 중앙에서 제어하는 역할을 담당하는 카프카를 통해 스케일 인/아웃을 쉽게 할 수 있고 데이터 처리량을 효율적으로 진행할 수 있다.

## Kafka Broker & Cluster

![kafka_broker](/assets/images/kafka/kafka_broker.png)

브로커는 실행되는 카프카 애플리케이션 서버 중 1대를 의미하고, 보통 3대 이상의 브로커를 이용해서 클러스터를 구성한다.

현재는 브로커/클러스터 단독으로만 카프카를 구성할 수는 없고 주키퍼와의 연동이 요구되며 주키퍼에는 브로커의 id, controller id를 저장한다.

클러스터를 구성하는 브로커 중 1대는 컨트롤러로 설정하여 각각의 브로커에 대해 파티션 할당을 전담하고, 브로커가 정상적으로 작동하는지 모니터링 한다. 브로커 중에서 어떠한 브로커가 컨트롤러인지에 대한 정보는 주키퍼에 저장되어 있다.

> Record

producer -> consumer 간의 데이터 전달 과정에 있어 카프카는 byte 데이터 형태로 직렬화/역직렬화 하여 사용하기 때문에, 직렬화/역직렬화 기능을 고려해야한다.

```java
//producer
new ProducerRecord<String,String>("topic", "key", "message");

//consumer
ConsumerRecords<String,String> records=consumer.poll(1000);
for(ConsumerRecord<String,String> record: records){
  ...
}
```

## Topic

![kafka_topic](/assets/images/kafka/kafka_topic.png)

카프카 브로커 내부에서 메세지는 토픽이라는 곳에 저장된다. 여러 consumer, producer가 보내는 메세지를 구분하기 위해 서로 다른 토픽을 구성하게 되는데, 이는 서로 다른 consumer/producer에서 보내는 메세지가 뒤섞이는 문제를 방지하기 위함이다.

이러한 토픽은 위의 그림과 같이 N개의 파티션으로 또다시 나눠지게 된다. 하나의 토픽을 여러 개의 파티션으로 구성해서 병렬 처리가 가능하도록 한다. 또한 각 파티션에는 오프셋이 있어, 각 메세지를 구분하는 구분자로 활용된다. 

파티션의 종류
|partition|description|
|--|--|
|leader partition|직접적으로 consumer/producer와 통신하는 파티션|
|follower partition|leader patition이 가지는 데이터를 복제해서 가지고 있는 예비 파티션|

![kafka_partition](/assets/images/kafka/kafka_partition.png)

위와 같이 leader parition/follower partition으로 구성되고 follower parititon은 leader partition은 follower partition에 문제가 발생했을 때에 대응하기 위해 예비로 다른 broker에 복제해서 저장해둔다.

> ISR

follower partition이 leader partition의 모든 offset이 복제되어 싱크가 맞춰진 상탤르 ISR(In-Sync Replica)라고 하는데 ISR 조건을 만족한 상태에서 follower partition은 leader로 대체 되도록 한다. 모든 싱크가 맞춰져 있는지를 항상 확인하는 과정을 주기적으로 실행하면서 ISR group을 관리하여 ISR group 내의 파티션이 리더를 대체할 수 있도록 한다.

실제 데이터는 segment라고 하는 file 형태로 저장되게 되는데, segment는 일정 시간, 크기 이상이 되면 자동으로 delete 되거나 압축되기 때문에 해당 파티션에 저장되어 있는 데이터를 요청할 수 없게 된다.

## Consumer & Producer

![kafka_producer_consumer](/assets/images/kafka/kafka_producer_consumer.png)

토픽 내에 파티션은 위와 같이 queue 형태의 자료구조로 저장되며 producer가 메세지를 write하고 consumer은 producer가 생성한 메세지를 offset을 이용해서 요청한다(polling)

![kafka_producer_consumer_structure1](/assets/images/kafka/kafka_producer_consumer_structure1.png)

카프카 브로커 내에서 producer와 consumer은 위와 같이 동작을 하게 되는데, producer에서 토픽에 레코드를 보내게 되고 consumer은 파티션에서 특정 데이터를 polling하게 된다. 이처럼 parition의 개수가 consumer보다 많은 consumer은 모든 파티션으로부터 polling을 수행하게 되고 아래의 같이 parition : consumer가 1:1 구조를 이루는 경우 각각의 파티션이 consumer에 할당되어 독립적으로 실행되어 각각의 consumer가 병렬처리가 되도록 할 수 있다.

![kafka_producer_consumer_structure2](/assets/images/kafka/kafka_producer_consumer_structure2.png)

하지만, consumer의 개수가 parition 개수 보다 많아지면 partition을 할당 받지 못한 consumer은 pending 상태를 유지하게 된다.

![kafka_producer_consumer_rebalancing](/assets/images/kafka/kafka_producer_consumer_rebalancing.png)

만약 위와 같이 consumer에서 장애가 발생하게 되면 해당 consumer에서 사용중이던 파티션을 다른 consumer에 할당해서 해당 파티션에 저장된 메세지/레코드가 처리될 수 있도록 한다.

![kafka_multiple_consumergroups](/assets/images/kafka/kafka_multiple_consumergroups.png)

위와 같이 하나의 토픽에 대해 여러 개의 consumer group가 파티션을 할당 받을 수 있고, 서로 다른 목적에 의해 consumer group을 여러 개로 구성하기도 한다.

위의 경우, elastic search를 통해 로그를 실시간으로 확인용으로 두고, 하둡을 이용해서 대용량 데이터를 저장해서 이전 데이터에 대한 참조를 할 수 있도록 한다.

## Kafka Environment

> kafka_client

![kafka_client](/assets/images/kafka/kafka_client.png)

kafka cluster에 접근하기 위한 라이브러리로, java, node.js, python 등의 programming language를 이용해서 kafka에 대한 api를 제공한다.

producer, consumre, admin, stream과 같은 kafka 기능을 활용할 수 있다.

> kafka connect

![kafka_connect](/assets/images/kafka/kafka_connect.png)

kafka 라이브러리를 통해서 직접 kafka cluster와 연동해서 활용할 수도 있지만, kafka connect을 이용해서 source -> target으로의 데이터 통신이 가능하다.

- standalone, distribution mode
- rest api
- 다양한 plugin(File, AWS S3, Hive, MySQL,등)

> kafka mirror maker

![kafka_mirror_maker](/assets/images/kafka/kafka_mirror_maker.png)

위의 mirror maker을 이요해서 하나의 kafka cluster의 데이터를 모두 복제해서 다른 kafka cluster로 복제하는 것이 가능하다.

특정 cluster의 신규 토픽을 감지해서 자동으로 다른 cluster로의 복제를 수행할 수 있다.


## References

- 영상
  - [youtube](https://www.youtube.com/watch?v=VJKZvOASvUA&list=PL9mhQYIlKEheZvqoJj_PkYGA2hhBhgha8)

- 블로그
  - [kafka101](https://always-kimkim.tistory.com/entry/kafka101-broker)

  - [Kafka](https://velog.io/@jwpark06/Kafka-%EC%8B%9C%EC%8A%A4%ED%85%9C-%EA%B5%AC%EC%A1%B0-%EC%95%8C%EC%95%84%EB%B3%B4%EA%B8%B0)








