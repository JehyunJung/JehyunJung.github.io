---
title: "[BOJ] Q1205 등수 구하기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - Bruteforce

---
# [BOJ] Q1205 등수 구하기
## [Question](https://www.acmicpc.net/problem/1205)
## Language: Python
## Difficulty: Silver 4

주어진 점수 리스트에 대해 새로운 점수를 추가하고자 할 때, 얻을 수 있는 등수를 구하는 문제이다. 같은 점수에 대해서는 공동 등수로 표현된다.

> index을 활용한 공동 등수 계산

sorting과 index을 활용하여 공동 등수에 대한 계산을 쉽게 할 수 있다.

```10 9 8 7 6 5 4 3 3 0```
과 같은 점수 리스트가 있을 때 해당 리스트에 대한 공동 등수는 아래와 같이 구할 수 있다.

```python
rankings=[1]*10

for index in range(1,10):
    #이전 등수와 같은 점수이면 공동 등수를 가지게 되며
    if scores[index-1]==scores[index]:
        rankings[index]=rankings[index-1]
    #다른 점수를 가지는 경우에는 본인의 인덱스값 +1을 한 것이 등수가 된다.
    else:
        rankings[index]=index+1
```

## Solution

```python
def solution():
    if n==p and scores[-1]>=new_score:
        print(-1)
    else:
        rank=n+1
        for index in range(n):
            if new_score>=score:
                rank=index+1
                break
        print(rank)


if __name__ == "__main__":
    n,new_score,p=map(int,input().split())
    if n==0:
        print(1)
        exit(0)
    scores=list(map(int,input().split()))
    solution()
```