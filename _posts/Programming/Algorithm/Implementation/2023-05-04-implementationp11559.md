---
title: "[BOJ] Q11559 Puyo Puyo"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - bfs
---
# [Programmers] Q11559 Puyo Puyo
## [Question](https://www.acmicpc.net/problem/11559)
## Language: Python
## Difficulty: Gold 4

해당 문제는 시뮬레이션 유형의 문제로 아래 3가지 항목에 대한 구현만 수행하면 된다.

1. 상하좌우로 연결되어 있는 블록 구하기
2. 블록 제거
3. 블록 아래로 이동

상세 구현은 아래와 같다.

> 1. 상하좌우로 연결되어 있는 블록 구하기

```python
#상하좌우로 연결되어 있는 부분 찾기
def find_component(visited,start_row,start_col):
    component=[]
    component_size=0
    visited[start_row][start_col] = True
    color=board[start_row][start_col]
    queue=deque([(start_row,start_col)])
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    while queue:
        row,col=queue.popleft()
        component.append((row,col))
        component_size+=1
        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            #격자 범위 조사
            if next_row < 0 or next_row >= 12 or next_col < 0 or next_col>=6:
                continue
            
            #같은 색깔인지 조사
            if board[next_row][next_col] != color:
                continue

            #방문 여부 조사
            if visited[next_row][next_col]:
                continue
            visited[next_row][next_col]=True

            queue.append((next_row,next_col))

    return component_size,component
```

> 2. 블록 제거

```python
#연결되어 있는 블록 터뜨리기
def destroy_blocks(components):
    global board
    for component in components:
        for row,col in component:
            board[row][col]="."
```

> 3. 블록 아래로 이동

```python
#아래에 빈 공간이 있는 블록들 내리기
def drop_blocks():
    global board
    for start_col in range(6):
        for start_row in range(10,-1,-1):
            next_row=start_row

            while (next_row+1) <= 11 and board[(next_row+1)][start_col] == ".":
                next_row+=1
            
            board[start_row][start_col],board[next_row][start_col]=board[next_row][start_col],board[start_row][start_col]
```

## Solution

```python
import sys
from collections import deque
#상하좌우로 연결되어 있는 부분 찾기
def find_component(visited,start_row,start_col):
    component=[]
    component_size=0
    visited[start_row][start_col] = True
    color=board[start_row][start_col]
    queue=deque([(start_row,start_col)])
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    while queue:
        row,col=queue.popleft()
        component.append((row,col))
        component_size+=1
        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            #격자 범위 조사
            if next_row < 0 or next_row >= 12 or next_col < 0 or next_col>=6:
                continue
            
            #같은 색깔인지 조사
            if board[next_row][next_col] != color:
                continue

            #방문 여부 조사
            if visited[next_row][next_col]:
                continue
            visited[next_row][next_col]=True

            queue.append((next_row,next_col))

    return component_size,component

#연결되어 있는 블록 터뜨리기
def destroy_blocks(components):
    global board
    for component in components:
        for row,col in component:
            board[row][col]="."

#아래에 빈 공간이 있는 블록들 내리기
def drop_blocks():
    global board
    for start_col in range(6):
        for start_row in range(10,-1,-1):
            next_row=start_row

            while (next_row+1) <= 11 and board[(next_row+1)][start_col] == ".":
                next_row+=1
            
            board[start_row][start_col],board[next_row][start_col]=board[next_row][start_col],board[start_row][start_col]

def print_board(title):
    print(title)
    for row in board:
        print(*row)

def solution():
    destroy_count=0
    while True:
        components=[]
        components_size=0
        visited=[[False] * 6 for _ in range(12)]
        for row in range(12):
            for col in range(6):
                if not visited[row][col] and board[row][col] != ".":
                    component_size,component=find_component(visited,row,col)
                    #상하좌우로 4개이상 인접한 경우에만 해당 블록을 추가하도록 한다.
                    if component_size >=4 :
                        components.append(component)
                        components_size+=1
        
        #더 이상 터뜨릴 블록이 없는 경우
        if components_size ==0 :
            break
   
        #블록 제거하기
        destroy_blocks(components)
        destroy_count+=1

        #빈공간 메꾸기
        drop_blocks()

    print(destroy_count)

if __name__ == "__main__":
    board=[list(input()) for _ in range(12)]
    solution()
```