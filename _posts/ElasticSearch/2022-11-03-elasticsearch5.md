---
title: "Elastic Search 5"
excerpt: "Elastic Search CRUD"

categories:
  - elastic_search
tags:
  - elastic_search
---

# Elastic Search CRUD

Elastic Search에 대한 query 요청은 아래와 같은 RestAPI를 구조를 이용해서 진행하게 된다.

```url
http://<host>:<port>/<index>/_doc/<document_id>
```

## Create

>PUT 방식

```json
PUT /my_index/_doc/1
{
  "name":"user1",
  "message":"testing Elastic Search CRUD"
}

# Results
{
  "_index": "my_index",
  "_id": "1",
  "_version": 7,
  "result": "updated",
  "_shards": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "_seq_no": 6,
  "_primary_term": 1
}
```

> POST 방식

```json
POST my_index/_doc/
{
  "name":"user1",
  "message":"testing Elastic Search CRUD"
}

# Results
{
  "_index": "my_index",
  "_id": "KZzgQIQB_ENA5HpA6KzV",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 2,
    "failed": 0
  },
  "_seq_no": 7,
  "_primary_term": 1
}
```

PUT, POST 두 가지 방식을 활용해서 Elastic Search에 document을 추가할 수 있다. PUT를 지정할때는 id를 부여하는 것과는 달리, POST 방식의 경우 id를 자동으로 생성할 수 있다. 같은 데이터를 서로 다른 id로 저장하고자 할때, 주로 POST을 활용하게 된다.

또한, PUT을 활용하여 같은 id에 대해 새로운 데이터를 저장하게 되는 경우, 기존의 id에 저장되어 있는 document의 정보가 새로운 document으로 대체된다.

따라서, 새로운 데이터를 생성할때, _doc, 대신에 _create 옵션을 활요하면 기존의 데이터가 삭제되는 것을 방지할 수 있다.

```json
PUT my_index/_create/1
{
  "name":"user1",
  "message":"testing Elastic Search CRUD"
}

# Error
{
  "error": {
    "root_cause": [
      {
        "type": "version_conflict_engine_exception",
        "reason": "[1]: version conflict, document already exists (current version [12])",
        "index_uuid": "xk7D_2y1Tq-_XIVLQkt-IQ",
        "shard": "0",
        "index": "my_index"
      }
    ],
    "type": "version_conflict_engine_exception",
    "reason": "[1]: version conflict, document already exists (current version [12])",
    "index_uuid": "xk7D_2y1Tq-_XIVLQkt-IQ",
    "shard": "0",
    "index": "my_index"
  },
  "status": 409
}
```

## Read

저장된 document에 대한 조회는 GET 방식을 활용한다.

```json
GET my_index/_doc/1

# Results
{
  "_index": "my_index",
  "_id": "1",
  "_version": 13,
  "_seq_no": 13,
  "_primary_term": 1,
  "found": true,
  "_source": {
    "name": "user1",
    "message": "testing Elastic Search CRUD"
  }
}

```

document에 저장된 정보만을 가져오고자 하면 _source 옵션을 이용한다.

```json
GET my_index/_source/1

# Results
{
  "name": "user1",
  "message": "testing Elastic Search CRUD"
}
```

## Update 

document에서 일부분만 수정하고자 하면, post 와 _update를 활용한다.

```json
POST my_index/_update/1
{
  "doc":{
    "age":40
  }
}

# Results
{
  "name": "user1",
  "message": "testing Elastic Search CRUD",
  "age": 40
}
```

document을 새로운 document으로 저장하고자 하면 위의 put을 이용하면 된다.

## DELETE

```json
DELETE my_index/_doc/1

GET my_index/_source/1

# Error
{
  "error": {
    "root_cause": [
      {
        "type": "resource_not_found_exception",
        "reason": "Document not found [my_index]/[1]"
      }
    ],
    "type": "resource_not_found_exception",
    "reason": "Document not found [my_index]/[1]"
  },
  "status": 404
}
```

삭제를 수행한 후, 조회를 했을 때, 해당 document가 없음을 확인할 수 있다.

## Bulk Operation
여러 개의 요청을 batch 형태로 실행하는 것도 가능하다. 대용량 데이터 입출력을 처리하는 경우, 배치를 통해 처리하는 것이 매우 효율적이다.

```json
POST _bulk
{"index":{"_index":"test", "_id":"1"}}
{"field":"value one"}
{"index":{"_index":"test", "_id":"2"}}
{"field":"value two"}
{"delete":{"_index":"test", "_id":"2"}}
{"create":{"_index":"test", "_id":"3"}}
{"field":"value three"}
{"update":{"_index":"test", "_id":"1"}}
{"doc":{"field":"value two"}}

# Response

{
  "took": 234,
  "errors": false,
  "items": [
    {
      "index": {
        "_index": "test",
        "_id": "1",
        "_version": 1,
        "result": "created",
        "_shards": {
          "total": 2,
          "successful": 2,
          "failed": 0
        },
        "_seq_no": 0,
        "_primary_term": 1,
        "status": 201
      }
    },
    {
      "index": {
        "_index": "test",
        "_id": "2",
        "_version": 1,
        "result": "created",
        "_shards": {
          "total": 2,
          "successful": 2,
          "failed": 0
        },
        "_seq_no": 1,
        "_primary_term": 1,
        "status": 201
      }
    },
    {
      "delete": {
        "_index": "test",
        "_id": "2",
        "_version": 2,
        "result": "deleted",
        "_shards": {
          "total": 2,
          "successful": 2,
          "failed": 0
        },
        "_seq_no": 2,
        "_primary_term": 1,
        "status": 200
      }
    },
    {
      "create": {
        "_index": "test",
        "_id": "3",
        "_version": 1,
        "result": "created",
        "_shards": {
          "total": 2,
          "successful": 2,
          "failed": 0
        },
        "_seq_no": 3,
        "_primary_term": 1,
        "status": 201
      }
    },
    {
      "update": {
        "_index": "test",
        "_id": "1",
        "_version": 2,
        "result": "updated",
        "_shards": {
          "total": 2,
          "successful": 2,
          "failed": 0
        },
        "_seq_no": 4,
        "_primary_term": 1,
        "status": 200
      }
    }
  ]
}
```

> Results

```json
GET test/_search

{
  "took": 1,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1,
    "hits": [
      {
        "_index": "test",
        "_id": "3",
        "_score": 1,
        "_source": {
          "field": "value three"
        }
      },
      {
        "_index": "test",
        "_id": "1",
        "_score": 1,
        "_source": {
          "field": "value two"
        }
      }
    ]
  }
}
```

search를 통해, test index에 벌크 연산이 모두 정상적으로 적용됨을 확인할 수 있다.

## Search API

index에 저장된 document에 대해 쿼리를 요청할 수 있다.

아래의 명령어를 활용하여, document 중에 특정 키워드를 포함하는 document을 찾을 수 있다. 

> url query parameter 방식

```json
GET test/_search?q=two

# Result
{
  "took": 28,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.6931471,
    "hits": [
      {
        "_index": "test",
        "_id": "1",
        "_score": 0.6931471,
        "_source": {
          "field": "value two"
        }
      }
    ]
  }
}
```
아래 처럼, 컬럼에 대해서 범위를 세부화 시킬 수도 있다.

```json
GET test/_search?q=field:three

# Result
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.2039728,
    "hits": [
      {
        "_index": "test",
        "_id": "3",
        "_score": 1.2039728,
        "_source": {
          "field": "value three"
        }
      }
    ]
  }
}
```

> data body

위와 같이 query parameter에 필터링 조건을 명시해서 document을 찾을 수 있지만, 대부분의 경우 data body를 구성하여 쿼리를 수행하게 된다.

```json
GET my_index/_search
{
  "query": {
    "match": {
      "message": "Elastic"
    }
  }
}

# Result
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "my_index",
        "_id": "KZzgQIQB_ENA5HpA6KzV",
        "_score": 0.2876821,
        "_source": {
          "name": "user1",
          "message": "testing Elastic Search CRUD"
        }
      }
    ]
  }
}
```


## References

- 영상
  - [youtube](https://www.youtube.com/watch?v=Ks0P49B4OsA&list=PLhFRZgJc2afp0gaUnQf68kJHPXLG16YCf)

- 문서
  - [document](https://www.elastic.co/guide/index.html)
  - [guidebook](https://esbook.kimjmin.net/)








