---
title: "Python tip"
excerpt: "List vs Deque"

categories:
  - Tip
tags:
  - python
  - modules
  - collections
---

# List vs Deque

python에서 데이터를 순서대로 저장하기 위해 자주 활용되는 자료구조 2가지이다. list와 deque가 가지는 차이점은 뭘까?

## List 

list는 아래와 같이 고정된 크기의 메모리 형태로 할당된다. 값을 추가하고 삭제 할때 메모리를 반환과정 및 데이터 이동되는데 소요되는 시간이 존재한다.

![python_list](/assets/images/tips/python_list.jpg)

### insert/pop(0)

```python
arr=range(10**5)
collection=[]

start=time.time()
for data in arr:
    collection.insert(0,data)
print("list insertion {}s".format(time.time()-start))

start=time.time()
for data in arr:
    collection.pop(0)
print("list pop(0) {}s".format(time.time()-start))
```

### append/pop()

```python
def append_pop_list():
    arr=range(10**5)
    collection=[]

    start=time.time()
    for data in arr:
        collection.append(data)
    print("list append {}s".format(time.time()-start))

    start=time.time()
    for data in arr:
        collection.pop()
    print("list pop {}s".format(time.time()-start))
```

> Results

```
list append 0.0030024051666259766s
list pop(0) 9.884008407592773s
list insertion 0.977168083190918s
list pop 0.0029997825622558594s
```


## Deque

Deque는 Double-Ended Queue의 약어로, 이중 연결리스트로 구성된다.

![python_deque](/assets/images/tips/python_deque.jpg)

### appendleft/popleft()

```python
arr=range(10**5)
collection=deque()

start=time.time()
for data in arr:
    collection.appendleft(data)
print("deque appendleft {}s".format(time.time()-start))

start=time.time()
for data in arr:
    collection.popleft()
print("deque popleft {}s".format(time.time()-start))
```

### append/pop()

```python
arr=range(10**5)
collection=deque()

start=time.time()
for data in arr:
    collection.append(data)
print("deque append {}s".format(time.time()-start))

start=time.time()
for data in arr:
    collection.pop()
print("deque pop {}s".format(time.time()-start))
```

> Results

```
deque insertion 0.0030434131622314453s
deque popleft 0.0029594898223876953s
deque append 0.0049991607666015625s
deque pop 0.00400090217590332s
```

## 성능 비교

|list|deque|
|--|--|--|
|왼쪽에 데이터 추가|0.003|0.003|
|오른쪽에 데이터 추가|0.977|0.004|
|왼쪽에서 데이터 추출|9.884|0.002|
|오른쪽에서 데이터 추출|0.002|0.004|

위의 결과를 보면 양쪽 끝에서 데이터의 삽입/삭제가 빈번하게 발생하는 경우에 대해서는 deque를 활용하는 것이 더 효율적임을 알 수 있다.