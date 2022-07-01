---
title: "[BOJ] Q14889 스타트와 링크"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - prefix sum
---
# [BOJ] Q14889 스타트와 링크
## [Question](https://www.acmicpc.net/problem/14889)
## Language: Python
## Difficulty: Silver 2

n 명이 있을 때, 이를 두개의 팀으로 분리하였을 때의 전력차를 최소화하는 문제이다.

해당 문제는 python의 combinations을 이용해서 풀 수 있다. combinations을 이용해서 n명에서 n/2 명을 골라낸 모든 조합에 대해 전력차를 비교하면 된다.


## Solution

```python
from math import inf
from itertools import combinations

def solution():
    persons=[i for i in range(num)]
    result=inf
    for combination in list(combinations(persons,num//2)):
        start=list(combination)
        link=list(set(persons)-set(combination))

        start_power=0
        for i in start:
            for j in start:
                if i==j:
                    continue
                start_power+=graph[i][j]

        link_power=0
        for i in link:
            for j in link:
                if i==j:
                    continue
                link_power+=graph[i][j]
        
        result=min(result,abs(start_power-link_power))


    print(result)
if __name__ == "__main__":
    num=int(input())
    graph=[list(map(int,input().split())) for _ in range(num)]
    
    solution()
```
