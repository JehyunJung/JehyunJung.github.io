---
title: "[BOJ] Q23289 온풍기 안녕"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - simulation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q23289 온풍기 안녕
## [Question](https://www.acmicpc.net/problem/23289)
## Language: Python
## Difficulty: Platinum 5

해당 문제는 주어진 조건에 따른 시뮬레이션을 구현하는 것이 관건이다.

시뮬레이션 과정은 아래와 같다

1. 온풍기 동작
2. 온도 조절
3. 바깥 테두리의 온도 1감소


우선적으로, 벽에 대해서는 온풍기 바람, 혹은 온도 제어가 동작하지 않기 때문에 벽에 대한 부분을 고려해야한다. 이를 쉽게 하기 위해 모든 좌표에 대한 방향에 대해 벽이 있는지를 저장하는 list을 만든다. wall_board list을 통해 해당 좌표에 대해서 해당 방향으로 이동하고자 할때 벽이 있으면 해당 방향으로의 이동은 고려하지 않는다.

```python
wall_board=[[[False for _ in range(5)] for _ in range(n_cols)] for _ in range(n_rows)]
#벽 정보 설정
for row,col,type in walls:
    row-=1
    col-=1
    if type==0:
        wall_board[row][col][3]=True
        wall_board[row-1][col][4]=True
    else:
        wall_board[row][col][1]=True
        wall_board[row][col+1][2]=True
```

> 온풍기의 동작과정

온풍기의 경우 queue을 이용해서 바람의 세기 5부터 1까지 순차적으로 bfs 방식으로 바람의 이동을 구현한다..

온풍기가 퍼지는 방식은 아래의 그림과 같다. 아래의 그림은 온풍기의 방향이 아래로 향해있을 때를 예로 든것이다.

![q23289_1](/assets/images/algorithm/q23289_1.png)

A에서 B,C,D 칸으로 바람이 퍼질 수 있는지를 판단하기 위해서는 우선적으로 아래의 그림과 E,F 칸에 바람이 이동할 수 있는 지 판단해야한다. 

![q23289_2](/assets/images/algorithm/q23289_2.png)

A->E, A->A, A->F 로의 이동을 자동화하기 위해 아래와 같이 각각의 방향에 대해 검사해야하는 방향을 list으로 저장해두었다.

```python
heater_movements=[
    [3,0,4],
    [4,0,4],
    [2,0,1],
    [2,0,1],
]
```

```python
for next_dir in heater_movements[dir-1]:
    #해당 방향으로 벽이 나 있는 경우 이동하지 않는다.
    if wall_board[row][col][next_dir]:
        continue
    if next_row< 0 or next_row>=n_rows or next_col < 0 or next_col>=n_cols:
        continue
```

그런 다음 E -> B, A -> C, F -> D로 바람이 이동할 수 있는지를 판단한다.

![q23289_3](/assets/images/algorithm/q23289_3.png)

```python
if wall_board[next_row][next_col][dir]:
    continue
#온풍기 반향대로 이동 수행
next_row+=dy[dir]
next_col+=dx[dir]

if next_row< 0 or next_row>=n_rows or next_col < 0 or next_col>=n_cols:
    continue
```



> 온도 조절

모든 좌표에 대해서 4방향을 비교해서 온도가 높은 곳에서 낮은 곳으로의 이동이 발생하는지 판단해서 온도 조절을 수행한다.

```python
for dir in range(1,5):
    #해당 칸에 해당 방향으로 벽이 있는 경우 온도 조절을 하지 않는다.
    if wall_board[row][col][dir]:
        continue                
    next_row=row+dy[dir]
    next_col=col+dx[dir]

    if next_row < 0 or next_row>=n_rows or next_col < 0 or next_col>=n_cols:
        continue
    #온도가 높은 곳에서 낮은 곳으로만 이동한다.
    difference=int((temperature_board[row][col] - temperature_board[next_row][next_col])/4)
    if difference > 0:
        difference_board[row][col]-=difference
        difference_board[next_row][next_col]+=difference
```

> 바깥 테두리의 동작

0열, n-1행, n-1열, 0행에 대해서 각각 온도를 1씩 감소한다.

```python
row,col=0,0
#0열
for _ in range(n_rows-1):
    if temperature_board[row][col]>0:
        temperature_board[row][col]-=1
    row+=1
#n-1행
for _ in range(n_cols-1):
    if temperature_board[row][col]>0:
        temperature_board[row][col]-=1
    col+=1 
#n-1열
for _ in range(n_rows-1):
    if temperature_board[row][col]>0:
        temperature_board[row][col]-=1
    row-=1
#0행
for _ in range(n_cols-1):
    if temperature_board[row][col]>0:
        temperature_board[row][col]-=1
    col-=1
```


## Solution

```python
from os.path import dirname,join
from collections import deque

def heater_move(wall_board,difference_board,row,col,dir):    
    queue=deque([(row,col,5)])
    visited=[[False] * n_cols for _ in range(n_rows)]
    visited[row][col]=True
    while queue:
        row,col,count=queue.popleft()
        difference_board[row][col]+=count

        for next_dir in heater_movements[dir-1]:
            #해당 방향으로 벽이 나 있는 경우 이동하지 않는다.
            if wall_board[row][col][next_dir]:
                continue
            #평행이동 실행하고
            next_row=row+dy[next_dir]
            next_col=col+dx[next_dir]

            if next_row< 0 or next_row>=n_rows or next_col < 0 or next_col>=n_cols:
                continue

            if wall_board[next_row][next_col][dir]:
                continue
            
            #온풍기 반향대로 이동 수행
            next_row+=dy[dir]
            next_col+=dx[dir]
            
            if next_row< 0 or next_row>=n_rows or next_col < 0 or next_col>=n_cols:
                continue

            if not visited[next_row][next_col] and count !=1:
                visited[next_row][next_col]=True
                queue.append((next_row,next_col,count-1))


def activate_heater(temperature_board,heaters,wall_board):
    difference_board=[[0] * n_cols for _ in range(n_rows)]

    for row,col,dir in heaters:
        heater_move(wall_board,difference_board,row+dy[dir],col+dx[dir],dir)

    for row in range(n_rows):
        for col in range(n_cols):
            temperature_board[row][col]+=difference_board[row][col]


def adjust_temperature(temperature_board,wall_board):
    difference_board=[[0]* n_cols for _ in range(n_rows)]
    for row in range(n_rows):
        for col in range(n_cols):
            for dir in range(1,5):
                #해당 칸에 해당 방향으로 벽이 있는 경우 온도 조절을 하지 않는다.
                if wall_board[row][col][dir]:
                    continue                
                next_row=row+dy[dir]
                next_col=col+dx[dir]

                if next_row < 0 or next_row>=n_rows or next_col < 0 or next_col>=n_cols:
                    continue
                #온도가 높은 곳에서 낮은 곳으로만 이동한다.
                difference=int((temperature_board[row][col] - temperature_board[next_row][next_col])/4)
                if difference > 0:
                    difference_board[row][col]-=difference
                    difference_board[next_row][next_col]+=difference
    
    
    #온도 변화가 종합되면 온도 배열에 적용한다.
    for row in range(n_rows):
        for col in range(n_cols):
            temperature_board[row][col]+=difference_board[row][col]
    

def decrease_boundary_temperature(temperature_board):
    row,col=0,0
    for _ in range(n_rows-1):
        if temperature_board[row][col]>0:
            temperature_board[row][col]-=1
        row+=1
    
    for _ in range(n_cols-1):
        if temperature_board[row][col]>0:
            temperature_board[row][col]-=1
        col+=1 

    for _ in range(n_rows-1):
        if temperature_board[row][col]>0:
            temperature_board[row][col]-=1
        row-=1
    
    for _ in range(n_cols-1):
        if temperature_board[row][col]>0:
            temperature_board[row][col]-=1
        col-=1
  
    

def check_temperature(temperature_board,checking_points):
    for row,col in checking_points:
        if temperature_board[row][col] < k:
            return False
    
    return True


def solution():
    heaters=[]
    checking_points=[]
    wall_board=[[[False for _ in range(5)] for _ in range(n_cols)] for _ in range(n_rows)]
    #온풍기 위치 정보, 온도 체크 지점 확인
    for row in range(n_rows):
        for col in range(n_cols):
            if board[row][col]==0:
                continue

            if board[row][col]==5:
                checking_points.append((row,col))
            else:
                heaters.append((row,col,board[row][col]))

    #벽 정보 설정
    for row,col,type in walls:
        row-=1
        col-=1
        if type==0:
            wall_board[row][col][3]=True
            wall_board[row-1][col][4]=True
        else:
            wall_board[row][col][1]=True
            wall_board[row][col+1][2]=True

    temperature_board=[[0] * (n_cols+1) for _ in range(n_rows+1)]

    for turn in range(100):
        activate_heater(temperature_board,heaters,wall_board)
        adjust_temperature(temperature_board,wall_board)
        decrease_boundary_temperature(temperature_board)
        
        #온도 검사
        if check_temperature(temperature_board,checking_points):
            return turn + 1
    
    return 101


if __name__ == "__main__":
    #predefined globals
    dy=[0,0,0,-1,1]
    dx=[0,1,-1,0,0]

    heater_movements=[
        [3,0,4],
        [3,0,4],
        [2,0,1],
        [2,0,1],
    ]
    
    n_rows,n_cols,k=map(int,input().split())
    board=[list(map(int,input().split())) for _ in range(n_rows)]
    n_walls=int(input())
    walls=[list(map(int,input().split())) for _ in range(n_walls)]

    print(solution())

```