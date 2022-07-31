---
title: "[Programmers] P60062 외벽 점검"
excerpt: "2020 카카오 공채 1차 문제 6"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P60062 외벽 점검
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/60062)
## Language: Python

각각의 취약점 위치에 대해서 친구들로 하여금 점검을 하려고 한다.

이때, 어떤 취약점에서 시작하고, 어떤 순서로 친구로 보낼지가 미지수 이기 때문에 모든 경우의 다 조사하는 bruteforce 방식으로 진행해야한다.

1. 원형 형태로 이루어진 지도이므로 이를 탐색하기 용이하게 하기 위해 linear 한 형태의 list로 만들어준다.

2. 각각의 시작점에 대해, 특정 순서로 친구들을 보내면서, 반복을 진행한다.

3. 만약 점검 위치에 도달하지 못한 경우, 해당 점검 위치에 대해 새로운 친구를 보낸다.



## Solution

```python
from itertools import permutations
from math import inf
def solution(n, weak, dist):
    answer = inf
    
    friends=len(dist)
    weak_parts=len(weak)
    #circular -> linear
    for i in range(weak_parts):
        weak.append(weak[i]+n)
    #각각의 시작점에 대해    
    for start in range(weak_parts):
        #특정 순서에 맞춰
        for permutation in permutations(dist):
            count=1
            #해당 친구가 점검할 수 있는 최대 위치
            position=weak[start]+permutation[count-1]
            #해당 시작점으로부터 마지막 취약점 위치까지
            for pos in range(start,start+weak_parts):
               #만약 해당 위치에 점검을 수행할 수 없으면 새로운 친구를 보낸다.
                if weak[pos] > position:           
                    count+=1
                    if count > friends:
                        break
                    position=weak[pos]+permutation[count-1]

            answer=min(answer,count)
    #모든 친구들을 동원해도 모든 취약점 위치를 점검할 수 없는 경우 -1 반환
    if answer>friends:
        answer=-1

    return answer
```