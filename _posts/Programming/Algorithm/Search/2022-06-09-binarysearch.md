---
title: "Binary Search"
excerpt: "이분 탐색"

categories:
  - algorithm
tags:
  - binary_search
  - algorithm
---

# Binary Search
기존에 배열, 리스트에서 특정 데이터를 찾기 위해 배열의 처음부터 끝까지 순회하면서 찾는 순차탐색을 진행했다.
이렇게 하면 시간 복잡도는 길이가 N인 기준의 리스트에 대해서 O(n)이다.

하지만, 이미 정렬된 리스트에 대해서는 이 순회를 더 빨리 진행 할 수 있다.

> data
```python
list=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
```
위와 같은 리스트가 있다고 가정해보자.

여기서 5가 해당 리스트에 존재하는 지 알아보기 위해 이분탐색을 실시해보자

이분 탐색의 알고리즘은 아래와 같다

1. list[mid] == target --> index 반환
2. list[mid] > target --> index start~mid-1에 대해서 과정 1부터 반복
3. list[mid] < target --> index mid+1 ~ end에 대해서 과정 1부터 반복

이를 실제로 올바르게 동작하는 지 알아보자

start=0,end=19인 상태에서, mid는 9이다. list[mid](10) > 5 이므로, end=mid-1로 하고 다시 반복진행
start=0,end=8인 상태에서, mid는 4이다. list[mid](5) ==5 이므로 index는 5 반환

단 2번의 반복으로 원하는 값의 index을 찾을 수 있었다.

>Source

```python
def binary_search(data,target):
  start=0
  end=len(data)-1

  while start<=end:
    mid=(start+end)//2

    if data[mid]==target:
      return target
    elif data[mid] < target:
      start=mid+1
    else:
      end=mid-1

  return -1 #target이 data에 존재하지 않는 경우

```

 아래와 같이 python은 이분 탐색을 지원하는 bisect 모듈을 제공하고 있다.
>Plus

```python
from bisect import bisect_left

a=bisect_left(data,target)
print(a)
```


# Question Types
직접적으로 이분 탐색을 요구하는 문제들은 많지 않다. 다른 알고리즘을 이용하면서 부가적으로 사용할 때가 많으니, 이분탐색 코드는 암기하고, 어떤 문제들에서 이분탐색을 쓰면 좋을지는 문제들을 풀어보면서 감을 익혀야한다.

