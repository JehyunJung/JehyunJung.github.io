---
title: "화성 탐사 문제"
excerpt: "Shortest Path 관련 문제"

categories:
  - codetest
tags:
  - Shortest_Path
  - codetest
---
# 화성 탐사 문제
NxN 공간이 존재할때, 각각의 칸을 지나기 위해서 드는 비용이 있다. 이때 [0][0]에서 [N-1][N-1] 까지 가는데 최소 비용을 구하여라.단, 특정 칸에서 이동할 수 있는 칸은 상,하,좌,우 방향으로 각각 인접한 칸이다.

## Language: Python
일단, [0][0]에서 [N-1][N-1] 로의 최단 경로를 구하는 SSSP(Single Source Shortest Path) 문제이다. 각각의 칸은 하나의 노드로 치환되며 또한 상,하,좌,우로 이동할 수 있다는 의미는 서로 인접한 노드라는 것을 의미한다.
그러면 자연스럽게 문제는 dijkstra 알고리즘을 해결하는 것이 가능하다.

## Solution

```python
import heapq
from math import inf
def dijkstra():
  dy=[-1,0,1,0]
  dx=[0,1,0,-1]

  distance=[[inf]*n for _ in range(n)]
  heap=[(0,0,0)]

  while heap:
    cost,row,col=heapq.heappop(heap)

    if row==n-1 and col==n-1:
      break
    
    for dir in range(4):
      new_row=row+dy[dir]
      new_col=col+dx[dir]

      if new_row <0 or new_row>n-1 or new_col <0 or new_col>n-1:
        continue
      temp=cost+graph[new_row][new_col]
      if distance[new_row][new_col] > temp:
        distance[new_row][new_col]=temp
        heapq.heappush(heap,(temp,new_row,new_col))

  return distance[n-1][n-1]

if __name__ == "__main__":
  graph=[]
  n=int(input())
  
  graph=[list(map(int,input().split())) for _ in range(n)]

  distance=dijkstra()

  print(distance)

```
