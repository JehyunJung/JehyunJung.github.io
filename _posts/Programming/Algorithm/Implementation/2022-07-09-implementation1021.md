---
title: "[BOJ] Q1021 회전하는 큐"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - prefix sum
---
# [BOJ] Q1021 회전하는 큐
## [Question](https://www.acmicpc.net/problem/1021)
## Language: Python
## Difficulty: Silver 4

큐에 특정 위치값에 있는 데이터를 빼내기 위해 최소한의 위치 이동 연산을 수행하려한다.(왼쪽 이동/오른쪽 이동)
왼쪽 이동/오른쪽 이동을 최소화 하기 위해서는 해당 index 가 큐의 절반 기준으로 어디에 위치하는 지 알아야한다.

큐의 왼쪽 절반 부분에 있으면 왼쪽 이동 연산을 수행하는 것이 최소 이동이고, 그 반대 인 경우 오른쪽 이동 연산을 수행하는 것이 최소 이동 연산이다.


## Solution

```python
from collections import deque
def solution():
    global n
    queue=deque()

    for i in range(1,n+1):
        queue.append(i)

    count=0
    for query in queries:
        if query==queue[0]:
            queue.popleft()
        else:
            if queue.index(query) <= len(queue)//2:
                while queue[0] != query:
                    queue.append(queue.popleft())
                    count+=1
                queue.popleft()
            else:
                while queue[0] != query:
                    queue.appendleft(queue.pop())
                    count+=1
                queue.popleft()

    print(count)

if __name__ == "__main__":
    n,m=0,0
    queries=[]

    with open("input1021.txt","r") as file:
        n,m=map(int,file.readline().split())
        queries=list(map(int,file.readline().split()))
    
    solution()
```
