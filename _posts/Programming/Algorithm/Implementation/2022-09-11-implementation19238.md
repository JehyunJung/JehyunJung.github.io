---
title: "[BOJ] Q19238 스타트 택시"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - bfs
  - codetest
  - boj
  - samsung
  - try_again
---
# [BOJ] Q19238 스타트 택시
## [Question](https://www.acmicpc.net/problem/19238)
## Language: Python
## Difficulty: Gold 3

해당 문제는 최단 거리를 구하는 문제 유형으로 bfs을 통해 거리를 구하도록 한다.

이번 문제에서 구현해야될 부분은 아래의 3가지이다.

1. 경로 정보 초기화

각각의 고객에 대해 시작 좌표에서 목적지 좌표까지의 거리를 계산한다.(계속 쓰일 정보이므로 한번만 정의놓으면 나중에 새로 계산할 필요가 없다)

```python
for start_row,start_col,end_row,end_col in passengers:
    distance_graph=bfs(start_row,start_col)

    distance=distance_graph[end_row][end_col]

    #해당 경로를 접근할 수 없는 경우
    if distance == -1:
        return -1

    route_info.append(distance)
```

2. 가장 가까운 거리의 고객 찾기
현재 택시 좌표에서 가장 가까운 고객의 위치를 찾는다, 문제에서는 가장 가까운 거리의 고객이 다수 일경우, 행/열 좌표가 앞서는 경우에 대해 선택하라고 한다. 하지만, 사전에 고객의 위치정보에 대해 행/열을 우선 정렬을 실시해놓으면 행/열 정보 순서대로 거리를 비교하기 때문에 따로 추가 연산이 필요하지 않다.

```python
passengers.sort(key=lambda x: (x[0],x[1]))
```

```python
def find_candidate(visited_route):
    distance_graph=bfs(taxi_row,taxi_col)

    min_distance,index=inf,0
    #후보군 찾기
    for i in range(M):
        start_row,start_col,end_row,end_col=passengers[i]
        if visited_route[i]:
            continue
        
        distance=distance_graph[start_row][start_col]

        #도달할 수 없는 경로인 경우
        if distance == -1:
            continue

        if min_distance >distance:
            min_distance=distance
            index=i

    return min_distance,index
```

3. 이동 가능 여부 결정 후 처리

```python
#최단거리/행/열 고객 선택
distance,index=find_candidate(visited_route)

#가장 가까운 탑승자를 찾을 수 없는 경우
if distance == inf:
    return -1

#해당 손님을 태울 수 없는 경우(탐승객까지의 거리 + 경로 정보)
if distance+route_info[index] > fuel:
    return -1

visited_route[index]=True

#기름 변화량, 택시 위치 이동
#기름 변화량(현재 기름양 - 택시-고객 거리 - 고객의 택시 이용거리 + 고객의 택시 이용거리*2[추가되는 기름 양]) => 현재 기름양 +(고객의 택시 이용거리 택시-고객 거리) 
fuel+=(route_info[index]-distance)
taxi_row,taxi_col=passengers[index][2],passengers[index][3]
```

> 주의

해당 문제에저는 예외 사항이 많이 존재한다.

1. 고객이 시작좌표에서 목적지 좌표로 이동이 불가능한 경우
--> 중간에 벽으로 둘러쌓여 있어 시작-> 목적지 이동 불가능한 경우 처리

2. 가장 가까운 거리의 고객이 존재하지 않는 경우 
택시 로부터 고객에게 도달할 수 없는 경우 존재

3. 기름이 부족한 경우
요구되는 기름양 > 잔여 기름양

## Solution

```python
from collections import deque
from math import inf

def bfs(start_row,start_col):
    visited=[[-1] * N for _ in range(N)]

    queue=deque([(start_row,start_col)])
    visited[start_row][start_col]=0
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    while queue:
        row,col=queue.popleft()
        
        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if next_row < 0 or next_row>=N or next_col < 0 or next_col>=N:
                continue

            if graph[next_row][next_col] ==1:
                continue

            if visited[next_row][next_col]!=-1:
                continue
            visited[next_row][next_col]=visited[row][col]+1
            queue.append((next_row,next_col))

    return visited

def find_candidate(visited_route):
    distance_graph=bfs(taxi_row,taxi_col)

    min_distance,index=inf,0
    #후보군 찾기
    for i in range(M):
        start_row,start_col,end_row,end_col=passengers[i]
        if visited_route[i]:
            continue
        

        distance=distance_graph[start_row][start_col]

        #도달할 수 없는 경로 인경우
        if distance == -1:
            continue

        if min_distance >distance:
            min_distance=distance
            index=i

    return min_distance,index
    
def solution():
    global fuel,taxi_row,taxi_col
    #해당 탑승객 처리 정보
    visited_route=[False] *M
    #거리 정보
    route_info=[]
    #거리정보 초기화
    for start_row,start_col,end_row,end_col in passengers:
        distance_graph=bfs(start_row,start_col)

        distance=distance_graph[end_row][end_col]

        #해당 경로를 접근할 수 없는 경우
        if distance == -1:
            return -1

        route_info.append(distance)
    
    for _ in range(M):

        #최단거리/행/열 고객 선택
        distance,index=find_candidate(visited_route)

        #가장 가까운 탑승자를 찾을 수 없는 경우
        if distance == inf:
            return -1
        
        #해당 손님을 태울 수 없는 경우(탐승객까지의 거리 + 경로 정보)
        if distance+route_info[index] > fuel:
            return -1
        
        visited_route[index]=True
        
        #기름 변화량, 택시 위치 이동
        fuel+=(route_info[index]-distance)
        taxi_row,taxi_col=passengers[index][2],passengers[index][3]
        
        
    if fuel < 0:
        return -1

    return fuel    

if __name__ == "__main__":
    N,M,fuel=0,0,0
    graph=[]
    taxi_row,taxi_col=0,0
    #각각의 고객에 대한 경로 정보
    passengers=[]

    N,M,fuel=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(N)]
        
    taxi_row,taxi_col=map(int,input().split())
    taxi_row-=1
    taxi_col-=1

    for _ in range(M):
        start_row,start_col,end_row,end_col=map(int,input().split())
        passengers.append((start_row-1,start_col-1,end_row-1,end_col-1))
    
    #고객정보를 저장할때 행/열 순으로 정렬된 상태로 저장한다.
    passengers.sort(key=lambda x: (x[0],x[1]))
    print(solution())

        
```