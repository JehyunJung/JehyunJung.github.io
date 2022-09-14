---
title: "[Programmers] P42890 후보키"
excerpt: "2019 카카오 공채 1차 문제 3"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P42890 후보키
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/42890)
## Language: Python

1. 생성할 수 있는 모든 컬럼 조합을 만들어낸다.
2. 유일성을 만족하는 지 여부를 찾기 전에 최소성이 성립되는 지 판단한다.
3. 컬럼 조합에 대해서 유일성을 만족하는 지 판단한다

> python list comprehension for double-for 

```python
num=5
for x in list:
  for y in x:
    if list[x][y] > 0:
      print(list[x][y])

[list[x][y] for x in list for y in x if list[x][y] > 0]
```

> 특정 리스트가 어떤 리스트의 부분집합인지 여부를 판단하기 위한 방법

1. set의 intersection 활용

```python
def check_minimality(candidate_keys,key):
    for candidate_key in candidate_keys:
        if set(candidate_key).intersection(key) == set(candidate_key):
            return False
    return True
```

2. bitmask 활용

```python
def check_minimality(candidate_keys,key_bitmask):
    for candidate_key in candidate_keys:
        if candidate_key & key_bitmask == candidate_key:
            return False
    return True
```

## Solution

```python
from itertools import combinations
#2: 최소성 만족 여부 조회
def check_minimality(candidate_keys,key):
    for candidate_key in candidate_keys:
        if set(candidate_key).intersection(key) == set(candidate_key):
            return False
    return True

def solution(relation):
    answer = 0
    candidate_keys=[]
    rows=len(relation)
    cols=len(relation[0])
    #1
    key_combinations=[list(combination) for i in range(1,cols+1) for combination in list(combinations(range(cols),i)) ]
    for key_combination in key_combinations:
      #해당 키가 최소성을 만족하지 않으면 유일성 검증 과정을 생략하고, 다음 키에 대한 검증을 수행한다.
        if not check_minimality(candidate_keys, key_combination):
            continue
        #3       
        tuples=[tuple([row[key] for key in key_combination]) for row in relation]
        if len(set(tuples))==rows:
            candidate_keys.append(key_combination)
       
    answer=len(candidate_keys)
    return answer
```
