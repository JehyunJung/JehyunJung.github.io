---
title: "[BOJ] Q16943 숫자 재배치"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - itertools
---
# [BOJ] Q16943 숫자 재배치
## [Question](https://www.acmicpc.net/problem/16943)
## Language: Python
## Difficulty: Silver 1

숫자의 크기가 최대 1에서 10<sup>9</sup>로 굉장히 커 보여서 반복문을 수행하면 안될 것 처럼 보인다.

하지만, 해당 문제는 주어지는 숫자에 담겨있는 모든 숫자들을 다써서 조합하여 만들수 있는 수이므로 그 경우의 수는 현저히 낮아진다.

10개의 숫자로 만들어낼 수 있는 숫자는 총 300만개 정도로 A에 속해있는 숫자들로 permutation 연산을 수행해서 B보다 작은 수 중에서 가장 큰 수를 구하면 된다.


## Solution

```python
from itertools import permutations
def solution():
    prev_value=0
    for permutation in list(permutations(A,len(A))):
        if permutation[0]=="0":
            continue
        value=int("".join(permutation)) 
        if value >= B:
            continue
        prev_value=max(prev_value,value)
        
    if prev_value==0:
        print(-1)
    else:
        print(prev_value)

if __name__ == "__main__":
    A,B=map(str,input().split())
    B=int(B)
    A=list(A)

    solution()
```
