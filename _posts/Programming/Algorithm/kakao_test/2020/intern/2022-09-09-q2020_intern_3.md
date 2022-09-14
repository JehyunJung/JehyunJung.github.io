---
title: "[Programmers] P67258 보석 쇼핑"
excerpt: "2020 카카오 인턴 3"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P67258 보석 쇼핑
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/67258)
## Language: Python

## Solution 

해당 문제의 list는 최대 길이가 100,000이다 해당 list에 대해 2중 for 문을 돌리게 되면 시간 초과 문제가 발생하게 된다.
따라서, 해당 문제와 같이 구간에 관한 문제를 풀이할 때는 two-pointer을 활용하는 방법이 좋다.

구간을 움직이면서 해당 구간 내에 보석의 종류가 모두 있는지를 확인하면서 가장 짧은 구간을 찾는 것이 해당 문제의 관건이다.
그래서 해당 구간 내에서의 보석정보를 저장하기 위해 dictionary를 활용한다.
dictionary를 통해 보석의 종류와 보석의 개수를 한번에 저장하도록 한다. 만약 보석의 개수가 0이 되면 보석을 없애는 방식으로 보석을 관리하도록 한다.


> 주의

처음에는 구간 자체를 list 형태로 관리하면서 매번 set 연산을 수행하였는데, 이렇게 할 경우 매번 set 연산을 하면서 발생하는 반복 연산이 시간초과를 야기하기 때문에, dictionary를 통한 관리가 필요하다.




```python
from math import inf
def solution(gems):
    answer = []
    results=[]
    min_case=inf
    
    gems_set=set(gems)
    gem_info={gems[0]:1}
    #보석의 종류가 1개인 경우
    if len(gems_set)==1:
        answer=[1,1]
    else:
        length=len(gems)
        start,end=0,0
        while True:
            #dictionary의 경우 len을 하게 되면 key의 개수, 즉 보석의 종류가 반환된다.
            if len(gem_info) == len(gems_set):
                #모든 보석의 종류를 포함하는 구간 중에서 가장 짧은 구간을 선택한다.
                if end-start < min_case:
                    results=[start,end]
                    min_case=(end-start)
                #start index을 한 칸 당기면서 해당 보석 정보를 제거한다.
                gem_info[gems[start]]-=1  
                if gem_info[gems[start]] ==0:
                    del gem_info[gems[start]]

                start+=1
            else:
                #end index 값을 늘려서 보석 정보를 추가한다.
                end+=1
                if end >= length:
                    break
                if gems[end] in gem_info:
                    gem_info[gems[end]]+=1
                else:
                    gem_info[gems[end]]=1
        #index matching을 위한 작업
        answer=[v+1 for v in results]
    return answer
```
