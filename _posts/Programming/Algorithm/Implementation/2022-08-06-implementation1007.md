---
title: "[BOJ] Q1007 벡터 매칭"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - bruteforce
---
# [BOJ] Q1007 벡터 매칭
## [Question](https://www.acmicpc.net/problem/1007)
## Language: Python
## Difficulty: Gold 2

처음에는 모든 점의 좌표를 이용해서 모든 직선의 경우의 수를 구하려고 했다. 하지만 이렇게 하는 경우 --> n! 이라는 경우의 수를 가지게 된다. 최대 n=20이라고 했으므로 이는 무조건 시간 초과가 나게 된다.


벡터는 화살이 향하는 끝(Head) 에서 화살이 시작하는 점인(Tail)이 있을 때, Head-Tail 형태로 표현된다.
가령
v1=(x1-x2,y1-y2)
v2=(x3-x4,y3-y4)
라고 했을 때, v1과 v2의 합벡터는 v1+v2=(x1+x3-(x2+x4),y1+y3-(y2+y4))이다.

따라서, HEAD가 되는 점의 좌표를 구하기만 하면 모든 벡터의 총합을 구할 수 있다.
그렇게 하면 기존의 n! 이 nC<sub>n/2</sub> 줄어들게 된다.

벡터의 길이는 ((x1+x3-(x2+x4))<sup>2</sup> + (y1+y3-(y2+y4))<sup>2</sup>)<sup>0.5</sup>로 구할 수 있다.

## Solution

```python
from itertools import combinations
from math import inf,sqrt
def solution():
    result=inf
    #HEAD가 되는 좌표의 조합
    lines=list(combinations(range(num),num//2))
    #구한 조합 리스트의 반 만큼만 이용하게 되는데, 이는 해당 리스트가 중간을 기점으로 대칭이기 때문에, 합의 구하는 과정이 있어서는 첫번째 절반만 이용하면 된다.
    half_length=len(lines)//2
    for indexes in lines[:half_length]:
        x1,y1=0,0
        for index in indexes:
            x1+=points[index][0]
            y1+=points[index][1]
        
        #TAIL 점들의 총합
        x2=total_x-x1
        y2=total_y-y1
        #벡터의 길이
        result=min(result,sqrt((x1-x2)**2 + (y1-y2)**2))
    print(result)

if __name__ == "__main__":
    test_cases=int(input())
    for _ in range(test_cases):
        num=int(input())
        points=[]
        total_x=0
        total_y=0
        for _ in range(num):
            x,y=map(int,input().split())
            total_x+=x
            total_y+=y
            points.append((x,y))
        solution()
```
