---
title: "[Programmers] P72413 합승 택시 요금"
excerpt: "2021 카카오 공채 1차 문제 4"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P72413 합승 택시 요금
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/P72413)
## Language: Python

특정 구간 까지는 같이 합승을 하고, 이후에는 각자의 도착지로 가는 데, 이때의 최소 경로를 구하는 문제이다.

시작 지점 S에서 중간 지점 T 까지 합승해서 가고, (1~T 까지의 경우에 대해서 반복 순회하면 된다.)
중간 지점 T에서 A의 목적지, T 지점에서 B의 목적지 까지 구하면 된다.

그러므로, 해당 문제는 ASSP(All Source Shortest Path)으로 구해도 되고, Dijkstra를 이용해서 풀이해도 되는 문제이다.

# Solution 1

```python
import heapq
from math import inf

def dijkstra(n,graph,start,end):
    visited=[False] * (n+1)
    distance=[inf] * (n+1)
    heap=[]
    
    distance[start]=0
    visited[start]=True    
    heapq.heappush(heap,(0,start))
    
    while heap:
        cost,vertex=heapq.heappop(heap)    
        
        if cost > distance[vertex]:
            continue
            
        visited[vertex]=True
        for adj_vertex,weight in graph[vertex]:
            temp=cost+weight
            if distance[adj_vertex] > temp:
                distance[adj_vertex]=temp
                heapq.heappush(heap,(temp,adj_vertex))
           
    return distance[end]
        
def solution(n, s, a, b, fares):
    answer = 0
    graph=[[] for _ in range(n+1)]
    
    for v1,v2,cost in fares:
        graph[v1].append((v2,cost))
        graph[v2].append((v1,cost))
    
    min_cost=inf
    
    for i in range(1,n+1):
        cost=dijkstra(n,graph,s,i) + dijkstra(n,graph,i,a) + dijkstra(n,graph,i,b)
        min_cost=min(min_cost,cost)
    
    answer=min_cost
    return answer
```

## Solution 2

```python
from math import inf

def floyd_warshall(n,graph):
    for a in range(1,n+1):
        graph[a][a]=0
    
    for k in range(1,n+1):
        for a in range(1,n+1):
            for b in range(1,n+1):
                cost=graph[a][k] + graph[k][b]
                if graph[a][b] > cost:
                    graph[a][b] = cost
        
def solution(n, s, a, b, fares):
    answer = 0
    graph=[[inf] * (n+1) for _ in range(n+1)]
    
    for v1,v2,cost in fares:
        graph[v1][v2]=cost
        graph[v2][v1]=cost
    
    floyd_warshall(n,graph)
    min_cost=inf
    
    for i in range(1,n+1):
        cost=graph[s][i] + graph[i][a] + graph[i][b]
        min_cost=min(min_cost,cost)
    
    answer=min_cost
    return answer
```