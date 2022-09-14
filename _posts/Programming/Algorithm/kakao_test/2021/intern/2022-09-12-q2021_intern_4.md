---
title: "[Programmers] P81304 미로 탈출"
excerpt: "2021 카카오 인턴 4"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P81304 미로 탈출
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/81304)
## Language: Python

해당 문제는 dijkstra를 기본으로 해서 접근한다. 노드에 대한 거리정보를 저장할 때, 트랩을 밟은 상태를 추가로 고려한다.

```python
#노드 * 트랩상태에 따른 distance 배열 초기화
distances=[[inf]*(1024) for _ in range(n+1)]
```

트랩에 대해서, 한 번 만 밟힌 상태이면 정방향 검사를 생략한다.

```python
reverse_check=0
#시작점이 트랩인 경우
if vertex in trap_nodes and state & 1 << trap_nodes[vertex]:
    reverse_check ^= 1
#끝점이 트랩인 경우
if adj_vertex in trap_nodes and state & 1 << trap_nodes[adj_vertex]:
    reverse_check ^= 1
#트랩이 눌려져 있는 상태에 대해서는 정방향 체크를 하지 않는다.
if reverse_check ==1:
    continue
```

안 밟거나, 두번 밟은 상태이면 역방향을 생략한다.

```python
reverse_check=0
#시작점이 트랩인 경우
if vertex in trap_nodes and state & 1 << trap_nodes[vertex]:
    reverse_check ^= 1
#끝점이 트랩인 경우
if adj_vertex in trap_nodes and state & 1 << trap_nodes[adj_vertex]:
    reverse_check ^= 1
#트랩이 안 눌려져 있는 상태에 대해서는 역방향 체크를 하지 않는다.
if not reverse_check:
    continue
```

다음 노드가 트랩인 경우 트랩 상태를 변화시키도록 한다.

```python
new_state=state
if adj_vertex in trap_nodes:
    new_state=state ^ 1 << trap_nodes[adj_vertex]
```

현재 저장되어 있는 거리 보다, 갱신 비용이 작게 되면 거리값을 최신화한다.
```python
#일반 노드인 경우
if distances[adj_vertex][new_state] > cost+adj_cost:
    distances[adj_vertex][new_state]=cost+adj_cost
    heappush(heap,(distances[adj_vertex][new_state],new_state,adj_vertex))
```

## Solution 1

```python
from math import inf
from heapq import heappush,heappop
from collections import deque

def solution(n, start, end, roads, traps):
    answer = 0
    graph=[[] for _ in range(n+1)]
    reversed_graph=[[] for _ in range(n+1)]
    
    trap_nodes={node:index for index,node in enumerate(traps)}
    
    #트랩을 밟은 상태
    state=0
    
    for src,dest,cost in roads:
        graph[src].append((dest,cost))
        #트랩에 대해서는 역방향 간선을 정리한다.
        if src in trap_nodes or dest in trap_nodes:
            reversed_graph[dest].append((src,cost))
    
    #노드 * 트랩상태에 따른 distance 배열 초기화
    distances=[[inf]*(1024) for _ in range(n+1)]
    distances[start][0]=0
    heap=[(0,0,start)]
    
    while heap:
        cost,state,vertex=heappop(heap)
        
        #마지막 노드를 도달한 경우 반복을 종료한다.
        if vertex == end:
            return cost
          
        if distances[vertex][state] < cost:
            continue
        
        #정방향 검사        
        for adj_vertex,adj_cost in graph[vertex]:
            reverse_check=0
            #시작점이 트랩인 경우
            if vertex in trap_nodes and state & 1 << trap_nodes[vertex]:
                reverse_check ^= 1
            #끝점이 트랩인 경우
            if adj_vertex in trap_nodes and state & 1 << trap_nodes[adj_vertex]:
                reverse_check ^= 1
            #트랩이 눌려져 있는 상태에 대해서는 정방향 체크를 하지 않는다.
            if reverse_check ==1:
                continue
                
            new_state=state
            if adj_vertex in trap_nodes:
                new_state=state ^ 1 << trap_nodes[adj_vertex]
      
            #일반 노드인 경우
            if distances[adj_vertex][new_state] > cost+adj_cost:
                distances[adj_vertex][new_state]=cost+adj_cost
                heappush(heap,(distances[adj_vertex][new_state],new_state,adj_vertex))
                
        #역방향 검사
        for adj_vertex,adj_cost in reversed_graph[vertex]:
            reverse_check=0
            #시작점이 트랩인 경우
            if vertex in trap_nodes and state & 1 << trap_nodes[vertex]:
                reverse_check ^= 1
            #끝점이 트랩인 경우
            if adj_vertex in trap_nodes and state & 1 << trap_nodes[adj_vertex]:
                reverse_check ^= 1
            #트랩이 안 눌려져 있는 상태에 대해서는 역방향 체크를 하지 않는다.
            if not reverse_check:
                continue
            
            new_state=state
            if adj_vertex in trap_nodes:
                new_state=state ^ 1 << trap_nodes[adj_vertex]

            #일반 노드인 경우
            if distances[adj_vertex][new_state] > cost+adj_cost:
                distances[adj_vertex][new_state]=cost+adj_cost
                heappush(heap,(distances[adj_vertex][new_state],new_state,adj_vertex))  
```

## Solution 2 

```python
from math import inf
from heapq import heappush,heappop
from collections import deque

def solution(n, start, end, roads, traps):
    answer = 0
    graph=[[] for _ in range(n+1)]
    reversed_graph=[[] for _ in range(n+1)]
    
    trap_nodes={node:index for index,node in enumerate(traps)}
    
    #트랩을 밟은 상태
    state=0
    
    for src,dest,cost in roads:
        graph[src].append((dest,cost))
        graph[dest].append((src,-cost))
    
    #노드 * 트랩상태에 따른 distance 배열 초기화
    distances=[[inf]*(1024) for _ in range(n+1)]
    distances[start][0]=0
    heap=[(0,0,start)]
    
    while heap:
        cost,state,vertex=heappop(heap)
        
        #마지막 노드를 도달한 경우 반복을 종료한다.
        if vertex == end:
            return cost
          
        if distances[vertex][state] < cost:
            continue
            
        reverse_check=1
        
        #시작점이 트랩인 경우
        if vertex in trap_nodes and state & 1 << trap_nodes[vertex]:
            reverse_check *=-1
      
        # 검사        
        for adj_vertex,adj_cost in graph[vertex]:
            #끝점이 트랩인 경우
            if adj_vertex in trap_nodes and state & 1 << trap_nodes[adj_vertex]:
                adj_cost *= -1
            adj_cost*=reverse_check
            if adj_cost > 0:
                new_state=state
                if adj_vertex in trap_nodes:
                    new_state=state ^ 1 << trap_nodes[adj_vertex]

                #일반 노드인 경우
                if distances[adj_vertex][new_state] > cost+adj_cost:
                    distances[adj_vertex][new_state]=cost+adj_cost
                    heappush(heap,(distances[adj_vertex][new_state],new_state,adj_vertex))
            
```
