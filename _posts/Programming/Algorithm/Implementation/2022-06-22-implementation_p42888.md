---
title: "[Programmers] 퍼즐 조각 채우기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - dfs
  - bfs
  - codetest
  - Programmers
  - implementation
---
# [Programmers] 퍼즐 조각 채우기
## [Question](https://programmers.co.kr/learn/courses/30/lessons/84021)
## Language: Python

해당 문제를 풀기 위한 전략은 크게 4가지이다.

1. 보드에서 빈 자리 묶음, 블록 묶음 찾기
2. Rotation 구현
3. 빈자리와 블록 묶음을 비교하기 쉽게 좌표 값을 normalizing 해주기

> 1. Component Search

bfs를 이용해서 빈자리 묶음과 블록 묶음을 조회한다.

```python

def bfs(graph,n,option,start_row,start_col):
      
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    
    queue=deque([(start_row,start_col)])
    graph[start_row][start_col]=1-option
    components=[]
    
    while queue:
        row,col=queue.popleft()
        components.append((row,col))
        
        for dir in range(4):
            new_row=row+dy[dir]
            new_col=col+dx[dir]
            
            if new_row < 0 or new_row >=n or new_col < 0 or new_col >=n:
                continue
            if graph[new_row][new_col]==option:
                graph[new_row][new_col]=1-option
                queue.append((new_row,new_col))

    return components

def return_components(graph,length,option):
    components=[]
    #table에서 parts 탐색
    for row in range(length):
        for col in range(length):
            if graph[row][col]==option:
                components.append(bfs(graph,length,option,row,col))
    return components
    
```

> 2. Rotation 구현

각 좌표 값에 대해 90도 회전한 결과를 입력한다.
row,col -> n-row-1,row 로 바뀌게 된다.

```python
def rotate(components,length):
    temp_components=[]
    for component in components:
        temp=[]
        for component_row,component_col in component:
            temp.append((component_col,length-component_row-1))
        temp_components.append(temp)
    return temp_components
```

> 3. Normaliziation 구현

빈 자리와 블록을 서로 비교하기 쉽게 원점을 기준으로 좌표이동을 진행한다.

```python
def normalizing(components):
    new_components=[]
    for component in components:
        component_min_row,component_min_col=51,51
    
        for component_row,component_col in component:
            component_min_row=min(component_min_row,component_row)
            component_min_col=min(component_min_col,component_col)
            
        new_components.append(list(map(lambda x:(x[0]-component_min_row,x[1]-component_min_col),component)))
    return new_components
```

## Solution

```python
from collections import deque
from math import inf
def rotate(components,length):
    temp_components=[]
    for component in components:
        temp=[]
        for component_row,component_col in component:
            temp.append((component_col,length-component_row-1))
        temp_components.append(temp)
    return temp_components

def bfs(graph,n,option,start_row,start_col):
      
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    
    queue=deque([(start_row,start_col)])
    graph[start_row][start_col]=1-option
    components=[]
    
    while queue:
        row,col=queue.popleft()
        components.append((row,col))
        
        for dir in range(4):
            new_row=row+dy[dir]
            new_col=col+dx[dir]
            
            if new_row < 0 or new_row >=n or new_col < 0 or new_col >=n:
                continue
            if graph[new_row][new_col]==option:
                graph[new_row][new_col]=1-option
                queue.append((new_row,new_col))

    return components

def return_components(graph,length,option):
    components=[]
    #table에서 parts 탐색
    for row in range(length):
        for col in range(length):
            if graph[row][col]==option:
                components.append(bfs(graph,length,option,row,col))
    return components
    
def normalizing(components):
    new_components=[]
    for component in components:
        component_min_row,component_min_col=51,51
    
        for component_row,component_col in component:
            component_min_row=min(component_min_row,component_row)
            component_min_col=min(component_min_col,component_col)
            
        new_components.append(list(map(lambda x:(x[0]-component_min_row,x[1]-component_min_col),component)))
    return new_components
          
    
def solution(game_board, table):
    answer = 0
    length=len(game_board)   
    missing_parts=normalizing(return_components(game_board,length,0))
    table_parts=return_components(table,length,1)
        
    #회전 수행
    for i in range(4):
        table_parts=normalizing(rotate(table_parts,length))
        table_index=0
        #각각의 블록에 대해
        while table_index < len(table_parts):
            table_part=table_parts[table_index]
            missing_index=0
            #빈자리에 맞는지 확인하고
            while missing_index < len(missing_parts):
                missing_part=missing_parts[missing_index]
                #맞으면 묶음에서 지우고 계속 수행
                if set(table_part)==set(missing_part):
                    del table_parts[table_index]
                    del missing_parts[missing_index]
                    table_index-=1
                    missing_index-=1
                    answer+=len(missing_part)
                    break

                missing_index+=1
            
            table_index+=1

    return answer
```
