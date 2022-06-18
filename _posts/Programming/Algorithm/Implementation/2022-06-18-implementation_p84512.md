---
title: "[Programmers] 모음 사전"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
---
# [Programmers] 모음 사전
## [Question](https://programmers.co.kr/learn/courses/30/lessons/84512)
## Language: Python

주어진 모음의 조합으로 문자열을 만들었을 때, 제시한 문자열이 사전 순으로 정렬했을 때 몇번째에 위치하는 지 반환하는 문제이다. 우선, 모음의 종류는 모두 5가지 종류, 글자수는 최대 5자리까지이다. 이를 보면 모든 문자열을 모두 구해서 이를 정렬해서 해당 위치를 찾는 완전탐색을 수행해도 시간 내에 풀 수 있다.

중복 순열을 위해 Product을 활용한다.

## Solution

```python
from itertools import product
        
def solution(word):
    answer=0
    datas=[]
    for i in range(5):
        for str in product("AEIOU",repeat=i+1):
            datas.append("".join(str))
    datas.sort()
    answer=datas.index(word)+1
    return answer
```
