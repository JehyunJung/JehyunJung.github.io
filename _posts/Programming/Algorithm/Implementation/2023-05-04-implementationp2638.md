---
title: "[BOJ] Q2638 치즈"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - bfs
---
# [Programmers] Q2638 치즈
## [Question](https://www.acmicpc.net/problem/2638)
## Language: Python
## Difficulty: Gold 3

해당 문제는 단순한 bfs을 활용하여 치즈를 없애는 과정을 시뮬레이션 하면 되는 문제이다. 모서리에서 bfs을 수행하여 외부 공기와 접촉해있는 좌표들을 구해서 각 치즈 블록 중에서 2개의 면이상이 외부 공기와 접촉하는 경우 치즈 블록을 없앤다. 

## Solution 1

```python
import sys
from collections import deque

#외부와 연결되어 있는 공기 좌표 구하기
def check_outer_air(boundaries):
    visited=[[False] * n_cols for _ in range(n_rows)]
    
    queue=deque()
    
    #모서리에 대해서, 치즈가 없는 좌표들을 찾는다.
    for row,col in boundaries:
        if board[row][col] == 0:
            queue.append((row,col))
    #모서리와 연결되어 있는 좌표를 구하기 위한 bfs
    while queue:
        row,col = queue.popleft()
        #이미 방문한 경우
        if visited[row][col]:
            continue

        visited[row][col]=True

        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]
            #격자 범위를 벗어나는 경우
            if next_row < 0 or next_row >=n_rows or next_col < 0 or next_col >=n_cols:
                continue

            #이미 방문한 경우
            if visited[next_row][next_col]:
                continue
            
            #치즈가 있는 경우
            if board[next_row][next_col] == 1:
                continue

            queue.append((next_row,next_col))
    
    return visited

#치즈를 제거하기 위한 함수
def delete_cheese(out_air_map):
    global board,cheese_count

    for row in range(n_rows):
        for col in range(n_cols):
            count=0
            #치즈가 있는 공간
            if board[row][col]==1:
                #4방향을 조사해서 외부 공기가 맞닿아 있는 변의 갯수를 구한다.
                for dir in range(4):
                    next_row=row+dy[dir]
                    next_col=col+dx[dir]
                    
                    #격자 범위를 벗어나는 경우
                    if next_row < 0 or next_row >=n_rows or next_col < 0 or next_col >=n_cols:
                        count+=1
                        continue
                    
                    #인접한 다음 좌표가 외부 공기 인경우
                    if out_air_map[next_row][next_col]:
                        count+=1

                #외부와 2개 이상의 면이 맞닿아 있는 경우 치즈 제거
                if count >=2:
                    board[row][col]=0
                    cheese_count-=1

def solution():
    global cheese_count
    #외부 격자 좌표
    boundaries=[]

    for col in range(1,n_cols):
        boundaries.append((0,col))
    
    for row in range(1,n_rows):
        boundaries.append((row,n_cols-1))

    for col in range(1,n_cols):
        boundaries.append((n_rows-1,col))
    
    for row in range(1,n_rows):
        boundaries.append((row,0))

    #초기 치즈 갯수 구하기
    for row in range(n_rows):
        for col in range(n_cols):
            if board[row][col]==1:
                cheese_count+=1

    time=0
    while cheese_count!=0:
        out_air_map=check_outer_air(boundaries)
        delete_cheese(out_air_map)
        time+=1
    
    print(time)

if __name__ == "__main__":
    n_rows,n_cols=map(int,input().split())
    board=[list(map(int,input().split())) for _ in range(n_rows)]

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    cheese_count=0
    
    solution()
```

## Solution 2

외부 공기와 접촉하는 좌표를 구하는 과정에서 치즈 블록을 마주칠 때 마다, 해당 좌표의 값을 1씩 증가해서, 이후에 치즈 블록 중에서 값이 2이상인 치즈 블록을 제거한다. 즉, 외부 공기와 접촉하는 좌표를 구하는 bfs 과정 1번을 통해 제거하는 치즈 블록을 구하여 위의 코드를 개선할 수 있다.

```python
import sys
from collections import deque

#외부와 연결되어 있는 공기 좌표 구하기
def check_outer_air(boundaries):
    visited=[[False] * n_cols for _ in range(n_rows)]
    cheese_map=[[0] * n_cols for _ in range(n_rows)]
    
    queue=deque()
    
    #모서리에 대해서, 치즈가 없는 좌표들을 찾는다.
    for row,col in boundaries:
        if board[row][col] == 0:
            queue.append((row,col))

    #모서리와 연결되어 있는 좌표를 구하기 위한 bfs
    while queue:
        row,col = queue.popleft()
        #이미 방문한 경우
        if visited[row][col]:
            continue

        visited[row][col]=True

        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]
            #격자 범위를 벗어나는 경우
            if next_row < 0 or next_row >=n_rows or next_col < 0 or next_col >=n_cols:
                continue

            #이미 방문한 경우
            if visited[next_row][next_col]:
                continue
            
            #치즈가 있는 경우
            if board[next_row][next_col] == 1:
                cheese_map[next_row][next_col]+=1
                continue

            queue.append((next_row,next_col))
    
    return cheese_map

#치즈를 제거하기 위한 함수
def delete_cheese(cheese_map):
    global board,cheese_count

    for row in range(n_rows):
        for col in range(n_cols):
            #치즈가 있는 공간
            if cheese_map[row][col]>=2:
                board[row][col]=0
                cheese_count-=1

def solution():
    global cheese_count
    #외부 격자 좌표
    boundaries=[]

    for col in range(1,n_cols):
        boundaries.append((0,col))
    
    for row in range(1,n_rows):
        boundaries.append((row,n_cols-1))

    for col in range(1,n_cols):
        boundaries.append((n_rows-1,col))
    
    for row in range(1,n_rows):
        boundaries.append((row,0))

    #초기 치즈 갯수 구하기
    for row in range(n_rows):
        for col in range(n_cols):
            if board[row][col]==1:
                cheese_count+=1

    time=0
    while cheese_count!=0:
        cheese_map=check_outer_air(boundaries)
        delete_cheese(cheese_map)
        time+=1
    
    print(time)

    

if __name__ == "__main__":
    n_rows,n_cols=map(int,input().split())
    board=[list(map(int,input().split())) for _ in range(n_rows)]

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    cheese_count=0
    
    solution()
```