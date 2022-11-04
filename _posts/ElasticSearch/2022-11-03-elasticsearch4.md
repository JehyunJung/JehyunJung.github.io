---
title: "Elastic Search 4"
excerpt: "Index Shard Monitoring"

categories:
  - elastic_search
tags:
  - elastic_search
---

# Index Shard Monitoring

Elastic Search의 경우, Index, Shard을 활용하여 데이터를 분산해서 저장하게 된다.

데이터는 document 단위로 저장하게 되고, 이러한 document 들이 모여 하나의 index을 구성한다. 
Elastic Search의 경우, index을 저장할 때, 하나의 노드에 저장하는 것이 아니라 cluster에 저장하기 때문에 이러한 Index를 shard 단위로 분산해서 저장한다. 또한, 각각의 shard에 대해서는 replica(복제본)를 생성해서 다른 노드에 추가로 저장하여 가용성을 보장한다.

![index_sharding](/assets/images/elasticsearch/index_sharding.jpg)

만약, 클러스터 내부에서 노드가 동작을 중지하게 되면, 해당 노드에 저장된 replica, primary shard가 다른 노드에 분산되어 저장되게 된다.

![index_sharding_recovery](/assets/images/elasticsearch/index_sharding_recovery.jpg)


## Kibana Demo

kibana를 활용하여 elastaic search에 대한 query test을 수행할 수 있다.

elastic search에 대한 데이터를 요청할떄, kibana에서 rest api를 기반으로 쿼리를 요청하게 된다.

아래의 명령어를 통해, books 라는 index을 생성하고, shrad, replica 개수에 대한 설정을 진행한다.

> create index

```json
PUT /books
{
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1
  }
}
```

> search index

```json
GET /books

# Results
{
  "books": {
    "aliases": {},
    "mappings": {},
    "settings": {
      "index": {
        "routing": {
          "allocation": {
            "include": {
              "_tier_preference": "data_content"
            }
          }
        },
        "number_of_shards": "5",
        "provided_name": "books",
        "creation_date": "1667534428554",
        "number_of_replicas": "1",
        "uuid": "oJr_qApKTmGN9a5YmzpWrQ",
        "version": {
          "created": "8040399"
        }
      }
    }
  }
}
```

> search shard,index structure

각각의 shard, replica가 어디에 저장되어 있는 지 확인하기 위해 아래의 명령어를 사용할 수 있다.

```
GET /_cat/shards/books

# Results
books 0 p STARTED 0 225b 10.178.0.3 node-2
books 0 r STARTED 0 225b 10.178.0.2 node-1
books 1 p STARTED 0 225b 10.178.0.4 node-3
books 1 r STARTED 0 225b 10.178.0.2 node-1
books 2 r STARTED 0 225b 10.178.0.3 node-2
books 2 p STARTED 0 225b 10.178.0.2 node-1
books 3 p STARTED 0 225b 10.178.0.3 node-2
books 3 r STARTED 0 225b 10.178.0.4 node-3
books 4 r STARTED 0 225b 10.178.0.3 node-2
books 4 p STARTED 0 225b 10.178.0.4 node-3
```

kibana에서는 이러한 index, shard에 대한 monitoring ui를 제공한다.

![kibana_stack_monitoring](/assets/images/elasticsearch/kibana_stack_monitoring.png)


## References

- 영상
  - [youtube](https://www.youtube.com/watch?v=Ks0P49B4OsA&list=PLhFRZgJc2afp0gaUnQf68kJHPXLG16YCf)

- 문서
  - [document](https://www.elastic.co/guide/index.html)
  - [guidebook](https://esbook.kimjmin.net/)








