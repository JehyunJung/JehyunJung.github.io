---
title: "[Programmers] P17680 캐시 "
excerpt: "2018 카카오 공채 문제 3"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17680 캐시
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17680)
## Language: Python

1. 만약에 캐시 안에 값이 존재하면, 캐시에서 가져오고, 새롭게 캐시에 넣어서 시간값을 최신화하고 실행 시간을 1증가시킨다.
2. 만약에 캐시 안에 값이 없을때
    - 캐시에 공간이 남아 있는 경우, 캐시에 값 추가 후 실행시간 5추가
    - 남은 공간이 없는 경우, 제일 오래 전에 참조한 값 제거 후 새로운 값 추가 한 다음, 실행시간 5추가

## Solution

```python
import heapq 
def solution(cacheSize, cities):
    answer = 0
    cache=[]
    cities=[city.lower() for city in cities]
    #cache가 아예 없을때
    if cacheSize==0:
        answer=5*len(cities)
    else:    
        for city in cities:
            #1. cache hit
            if city in cache:
                cache.remove(city)
                answer+=1
            
            #2. cache miss
            elif city not in cache:
                #캐시에 공간이 없는 경우 제일 과거에 접근 한 값 제거
                if len(cache) == cacheSize:
                    cache.pop(0)
                answer+=5
            #캐시에 도시 정보를 넣는 것은 모든 작업에 대해 공통이다.
            cache.append(city)          
    return answer
```
