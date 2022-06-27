---
title: "[BOJ] Q14890 경사로"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
---
# [BOJ] Q14890 경사로
## [Question](https://www.acmicpc.net/problem/14890)
## Language: Python
## Difficulty: Gold 3

각 행/열 별로 검사를 진행하면서 단차가 1이 발생하는 칸에 경사로를 통해 단차를 줄일 수 있으면 넘어가고, 경사로를 놓지 못하는 경우해당 행 또는 열에는 길이 될 수 없다.

실패하는 조건문
1. 높이차가 2이상인 구간이 존재하는 경우
2. 경사로를 놓지 못하는 경우(칸이 부족해서)
3. 경사로를 놓지 못하는 경우(이미 다른 경사로 존재해서)

위의 세가지 조건문에 대해 검사를 수행해야 한다.

> 현재 칸에 비해 다음 칸의 높이가 높은 경우 현재칸을 기준으로 이전 칸들을 조사해야한다.

```python
if way[i] < way[i+1]:
    #높이차가 2이상인 경우 해당 행/열에 대한 조사를 그만한다.
    if abs(way[i] - way[i+1]) >1:
        return 0
    height=way[i]
    for k in range(L):
        #경사로를 놓지 못하는 경우 해당 행/열에 대한 조사를 그만한다.
        if i -k <0 or visited[i-k] or way[i-k]!=height:
            return 0
        visited[i-k]=True 
```

> 반대로 현재 칸에 비해 다음 칸의 높이가 낮은 경우 다음칸 기준으로 다음칸들을 조사해야한다.

```python
if way[i] > way[i+1]:
    if abs(way[i] - way[i+1]) >1:
        return 0
    height=way[i+1]
    for k in range(L):
        if i+k+1 >=n or visited[i+k+1] or way[i+k+1]!=height:
            return 0
        visited[i+k+1]=True 
```


## Solution

```python
def check_route(way):
    visited=[False]*n
    for i in range(n-1):
        if way[i]  < way[i+1]:
            if abs(way[i] - way[i+1]) >1:

                return 0
            height=way[i]
            for k in range(L):
                if i -k <0 or visited[i-k] or way[i-k]!=height:

                    return 0
                visited[i-k]=True 
        if way[i]  > way[i+1]:
            if abs(way[i] - way[i+1]) >1:

                return 0
            height=way[i+1]
            for k in range(L):
                if i+k+1 >=n or visited[i+k+1] or way[i+k+1]!=height:

                    return 0
                visited[i+k+1]=True 

    return 1

def solution():
    count=0

    #row
    for i in range(n):
        count+=check_route(graph[i])
    #col
    for i in range(n):
        count+=check_route([graph[j][i] for j in range(n)])
    return count

if __name__ == "__main__":
    n,L=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(n)]

    print(solution())

```
