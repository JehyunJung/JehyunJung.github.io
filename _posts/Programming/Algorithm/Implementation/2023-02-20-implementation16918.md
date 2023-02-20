---
title: "[BOJ] Q16918 봄버맨"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj

---
# [BOJ] Q16918 봄버맨
## [Question](https://www.acmicpc.net/problem/16918)
## Language: Python
## Difficulty: Silver 1

해당 문제는 주어진 시뮬레이션을 구현하여 N초 이후에 벌어지게 될 상황을 판단하는 유형의 문제로, 해당 시뮬레이션 로직을 구현하면 된다.
이 문제의 핵심은 폭탄은 동시에 설치되고 동시에 터진다는 것이 포인트이다. **즉, 특정 시간대에 설치된 폭탄들은 한번에 터지기 때문에 폭탄의 좌표들을 미리 저장해놓으면 따로, 시간에 따른 폭탄의 남은 시간 처리하는 함수를 구현할 필요가 없어진다.**

이 문제에서 필요한 로직 총 3개이다.

> 1. 폭탄 설치

```python
#모든 빈칸에 폭탄을 설치하는 함수
def set_bomb():
    global board
    board=[["O"] * n_cols for _ in range(n_rows)] 
```

> 2. 폭탄 폭발

```python
#폭탄을 처리하는 함수    
def clear_bomb(queue):
    global board
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    while queue:
        row,col=queue.popleft()
        board[row][col]="."

        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if next_row < 0 or next_row >=n_rows or next_col<0 or next_col>=n_cols:
                continue
            
            board[next_row][next_col]="."

```

폭탄의 좌표들을 구해서 해당 자리에 있는 폭탄들을 제거한다.

> 3. 폭발 예정인 폭탄 찾기

```python
#폭발할 폭탄 찾기
def find_bomb():
    return deque([(row,col) for row in range(n_rows) for col in range(n_cols) if board[row][col]=="O"])
```

## Solution

```python
from collections import deque
#모든 빈칸에 폭탄을 설치하는 함수
def set_bomb():
    global board
    board=[["O"] * n_cols for _ in range(n_rows)]
    

#폭발할 폭탄 찾기
def find_bomb():
    return deque([(row,col) for row in range(n_rows) for col in range(n_cols) if board[row][col]=="O"])

#폭탄을 처리하는 함수    
def clear_bomb(queue):
    global board
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    while queue:
        row,col=queue.popleft()
        board[row][col]="."

        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if next_row < 0 or next_row >=n_rows or next_col<0 or next_col>=n_cols:
                continue
            
            board[next_row][next_col]="."

def solution():
    queue=find_bomb()

    for time in range(2,n+1):
        if time % 2==0:
            set_bomb()
        else:
            clear_bomb(queue)
            queue=find_bomb()

    for row in board:
        print("".join(row))
        

```
