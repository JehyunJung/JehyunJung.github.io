---
title: "[Programmers] P17681 비밀지도 "
excerpt: "2018 카카오 공채 1차 문제 1"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17681 비밀지도
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17681)
## Language: Python

1. 두 배열의 각 행에 매칭되는 정수에 대해 각각 OR 연산을 수행해준다.
2. 1번의 결과를 2진법으로 매칭한다.
3. "1" 은 "#", " "는 0으로 매핑한다.
4. 자리 개수가 n이 아닌 경우 앞에 " "을 채워준다.


## Solution

```python
def solution(n, arr1, arr2):
    answer=[]
    #1,2,3
    datas=[bin(i1|i2)[2:].replace("1","#").replace("0"," ") for i1,i2 in zip(arr1,arr2)]
    #4
    for data in datas:
        answer.append(" "*(n-len(data))+data)
    
    return answer
```
