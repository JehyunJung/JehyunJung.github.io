---
title: "[Programmers] P17677 뉴스 클러스터링 "
excerpt: "2018 카카오 공채 문제 5"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17677 뉴스 클러스터링
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17677)
## Language: Python

1. 각각의 문자열을 2개의 문자 단위로 파싱해서 문자로만 이루어져있으면 value 배열에 추가
2. value 배열을 set 연산을 통해 key set 저장
3. 만약 2개의 key set이 모두 0이면 자카드 유사도 1
4. key set을 이용해서 교집합 key와 합집합 key을 저장
5. 자카드 유사도 계산   
    - 다중집합 자카드 유사도에 따라서, 교집합에서는 중복되는 key에 대해서는 min을, 합집합에서는 max을 적용해서 합산한다.



## Solution

```python
from math import floor
def solution(str1, str2):
    answer = 0
    
    str1_values=[]
    str2_values=[]
    
    str1=str1.lower()
    str2=str2.lower()
    
    #1
    for i in range(len(str1)-1):
        if "a"<=str1[i]<="z" and "a"<=str1[i+1]<="z":
            str1_values.append(str1[i]+str1[i+1])
        else:
            continue
    #1   
    for i in range(len(str2)-1):
        if "a"<=str2[i]<="z" and "a"<=str2[i+1]<="z":
            str2_values.append(str2[i]+str2[i+1])
        else:
            continue
    #2   
    str1_keys=set(str1_values)
    str2_keys=set(str2_values)
    #3
    if str1_keys==set() and str2_keys==set():
        answer=1
    else:
        #4
        intersection_keys=str1_keys.intersection(str2_keys)
        union_keys=str1_keys.union(str2_keys)
        intersection_value=0
        union_value=0

        #5
        for key in intersection_keys:
            intersection_value+=min(str1_values.count(key),str2_values.count(key))

        for key in union_keys:
            union_value+=max(str1_values.count(key),str2_values.count(key))

        answer=intersection_value/union_value


    answer=floor(answer*65536)
    
    
    return answer
```
