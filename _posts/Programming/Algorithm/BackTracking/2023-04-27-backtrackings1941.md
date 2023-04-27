---
title: "[BOJ] Q1941 소문난 칠공주"
excerpt: "BackTracking"

categories:
  - codetest
tags:
  - backtracking
  - bfs
  - codetest
  - boj
  - bruteforce
---
# [BOJ] Q1941 소문난 칠공주
## [Question](https://www.acmicpc.net/problem/1941)
## Language: Python
## Difficulty: Gold 3

해당 문제의 경우, 모든 경우에 대해서 고려하는 BruteForce 방식의 유형이며, 각 경우에 대하여 bfs을 통해 서로 연결되어 있는 지 여부를 판별한다.


> 5*5 좌표 평면상에서 7개의 좌표를 고르는 경우

product, combination을 활용하여 25개의 좌표중에서 7개를 고른다.

```python
coordinates=list(product(range(0,5),range(0,5)))
for combination in combinations(coordinates,7):     
    if check(combination):
        count+=1
```

> 주어진 조건에 부합하는지 확인

이다솜파 학생이 4명이상 되면 안되며, 모든 좌표점들은 서로 연결되어 있어야한다. 좌표점들이 서로 연결되어 있는지 여부를 판단하기 위해 bfs을 수행하여 도달할 수 있는 좌표의 갯수를 구해서 모든 점에 대한 도달여부(연결 여부)를 구할 수 있다.

```python
def check(coordinates):

    #이다솜파의 우세 여부
    y_count=0

    for row,col in coordinates:
        if board[row][col] == "Y":
            y_count+=1
    if y_count >=4:
        return False
    

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    
    #연결 여부
    visited=set()
    queue=deque([(coordinates[0])])
    
    coordinates=set(coordinates)
    while queue:
        row,col=queue.popleft()

        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if (next_row,next_col) in coordinates and (next_row,next_col) not in visited:
                visited.add((next_row,next_col))
                queue.append((next_row,next_col))

    if visited != coordinates:
        return False
    
    return True
```


## Solution 1

```python
from itertools import combinations,product
from collections import deque
import sys

def check(coordinates):
    
    #이다솜파의 우세 여부
    y_count=0
    for row,col in coordinates:
        if board[row][col] == "Y":
            y_count+=1
    if y_count >=4:
        return False
    

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    
    #연결 여부
    visited=set()
    queue=deque([(coordinates[0])])
    
    coordinates=set(coordinates)
    while queue:
        row,col=queue.popleft()

        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if (next_row,next_col) in coordinates and (next_row,next_col) not in visited:
                visited.add((next_row,next_col))
                queue.append((next_row,next_col))

    if visited != coordinates:
        return False
    
    return True


def solution():
    count=0
    coordinates=list(product(range(0,5),range(0,5)))
    for combination in combinations(coordinates,7):     
        if check(combination):
            count+=1
    print(count)

if __name__ == "__main__":
    board=[list(input()) for _ in range(5)]
    solution()
```

## Solution 2

아니면, 7명을 선택하는 과정에서 dfs을 활용하여 서로 연결되어 있는 좌표들만 선택하도록 하는 방법을 고려해볼 수 있다. 이미 탐색된 좌표(연결된 좌표)를 대상으로 dfs을 수행하여 특이한 모양으로 연결되어 있는 component도 파악하는 것이 가능하다. 이때, 각 좌표들을 row * 5 + col 형태로 변환하여 좌표점에 대한 방문여부를 간편화한다.

```python
from itertools import combinations,product
from collections import deque
import sys

def dfs(index,coordinates):
    global visited

    #Y의 갯수가 3개를 넘어서면 안된다.
    if "".join(board[coordinate//5][coordinate%5] for coordinate in coordinates).count("Y") >3:
        return

    #좌표 7개를 탐색한 경우
    if index == 7:
        visited.add("".join(map(str,sorted(coordinates))))
        return

    for coordinate in coordinates:
        row=coordinate // 5
        col=coordinate % 5

        for dir in range(4):
            next_row= row + dy[dir]
            next_col= col + dx[dir]
            #격자를 벗어나는 경우
            if next_row < 0 or next_row >=5 or next_col < 0 or next_col>=5:
                continue 
            next_coordinate=next_row *5 + next_col
            #이미 방문한 경우
            if next_coordinate in coordinates:
                continue

            coordinates.add(next_coordinate)
            dfs(index+1,coordinates)
            coordinates.remove(next_coordinate)

def solution():
    for i in range(25):
        coordinate_set=set([i])
        dfs(1,coordinate_set)

    print(len(visited))
if __name__ == "__main__":
    board=[list(input()) for _ in range(5)]
    visited=set()
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    
    solution()
    
```