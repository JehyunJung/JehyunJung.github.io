---
title: "[BOJ] Q16236 아기상어"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - bfs
---
# [BOJ] Q16236 아기상어
## [Question](https://www.acmicpc.net/problem/16236)
## Language: Python
## Difficulty: Gold 3

bfs을 이용해서 상어의 먹이를 찾으면 된다. 이때 항상 상어의 크기보다 작은 먹이만 찾을 수 있도록 한다. 또한, 거리가 가까운 먹이부터, 거리가 똑같은 먹이가 있다면 더 위쪽, 왼쪽에 있는 먹이부터 먹이를 먹으면 되므로 이는 heap을 이용해서 먹이 정보를 저장한다. 거리 , 행, , 열 순으로 정렬되도록 heap에 저장

1. bfs

```python
heap=[]

    while queue:
        row,col,cost=queue.popleft()
        #상어의 크기보다 작은 먹이만 찾는다.
        if graph[row][col] !=0 and graph[row][col] < size:
            heappush(heap,(cost,row,col))

        for dir in range(4):
            new_row=row+dy[dir]
            new_col=col+dx[dir]
            if new_row < 0 or new_row >=n or new_col <0 or new_col>=n:
                continue
            #상어의 크기보다 큰 먹이가 있는 칸은 지나갈 수 없다.
            if graph[new_row][new_col] > size:
                continue

            if not visited[new_row][new_col]:
                queue.append((new_row,new_col,cost+1))
                visited[new_row][new_col]=True
    return heap

```

2. 상어의 크기 증가 부분

상어의 크기만큼 먹이를 먹으면 상어의 크기가 1증가한다.

```python
prey_count+=1
if prey_count==shark_size:
    shark_size+=1
    prey_count=0
```

## Solution

```python
from heapq import heappush,heappop
from collections import deque

def bfs(start_row,start_col,size):
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    queue=deque([(start_row,start_col,0)])
    visited=[[False]*n for _ in range(n)]
    visited[start_row][start_col]=True
    heap=[]

    while queue:
        row,col,cost=queue.popleft()
        if graph[row][col] !=0 and graph[row][col] < size:
            heappush(heap,(cost,row,col))

        for dir in range(4):
            new_row=row+dy[dir]
            new_col=col+dx[dir]
            if new_row < 0 or new_row >=n or new_col <0 or new_col>=n:
                continue

            if graph[new_row][new_col] > size:
                continue

            if not visited[new_row][new_col]:
                queue.append((new_row,new_col,cost+1))
                visited[new_row][new_col]=True
    return heap

def solution():
    shark_row,shark_col=0,0
    for row in range(n):
        for col in range(n):
            if graph[row][col]==9:
                shark_row,shark_col=row,col
                graph[row][col]=0
                

    time=0
    shark_size=2
    prey_count=0
    while True:
        result=bfs(shark_row,shark_col,shark_size)
        
        if len(result)==0:
            break
        else:
            prey_count+=1
            if prey_count==shark_size:
                shark_size+=1
                prey_count=0
            prey=result[0] #(cost,row,col)

            shark_row=prey[1]
            shark_col=prey[2]

            graph[shark_row][shark_col]=0
            time+=prey[0]

    print(time)
            

if __name__ =="__main__":
    n=int(input())
    graph=[list(map(int,input().split())) for _ in range(n)]
    solution()
```
