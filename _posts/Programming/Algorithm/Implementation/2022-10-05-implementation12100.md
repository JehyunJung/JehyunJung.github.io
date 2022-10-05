---
title: "[BOJ] Q12100 2048"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - try_again
---
# [BOJ] Q12100 2048
## [Question](https://www.acmicpc.net/problem/12100)
## Language: Python
## Difficulty: Gold 2

이번 문제는 한쪽으로 미는 과정을 통해 만들 수 있는 최대값을 구하는 것이다.

모든 방향에 대해서 고려해서 진행하게 되면, 코드도 복잡해지고 구현량이 많아지게 된다. 그래서 이러한 유형의 문제는 행렬 회전을 통해 한 방향에 대한 연산을 처리할 수 있도록 한다. 

> 행렬 회전

```python
def rotate(board):
    temp_board=[[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            temp_board[j][n-1-i]=board[i][j]
    return temp_board
```

> list extraction

그리고 모든 방향에 대해서 미는 과정을 왼쪽으로 모으는 것으로 통일한다. 그리고 한번에 하나씩의 블록이 합쳐지게 되고, 2+2+4와 같이 연속적으로 합쳐지는 경우는 고려하지 않기 때문에, 아래와 같이 list comprehention을 이용해서 한쪽으로 모으는 연산을 구현한다.

```python
#값이 든 블록만 추출한다. (중간 중간에 빈칸이 있으면 어차피 밀리기 때문)
temp=[value for value in row if value > 0]
# 값이 같은 블록끼리 합쳐지는 경우 블록의 값을 더블링한다.
for idx in range(1,len(temp)):
    if temp[idx-1]==temp[idx]:
        temp[idx-1]*=2
        temp[idx]=0

#그런 다음, 숫자가 있는 블록들만 추출해서 다시 원래 행의 크기 만큼 맞춰준다.
temp=[value for value in temp if value > 0]
temp_board.append(temp+[0]*(n-len(temp)))
```

## Solution

```python
from math import inf
from collections import deque
from copy import deepcopy
import os.path

def find_max_number(board):
    global max_number
    for row in range(n):
        for col in range(n):
            max_number=max(max_number,board[row][col])

def rotate(board):
    temp_board=[[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            temp_board[j][n-1-i]=board[i][j]
    return temp_board

def movements(board):
    temp_board=[]

    for row in board:
        temp=[value for value in row if value > 0]

        for idx in range(1,len(temp)):
            if temp[idx-1]==temp[idx]:
                temp[idx-1]*=2
                temp[idx]=0

        temp=[value for value in temp if value > 0]
        temp_board.append(temp+[0]*(n-len(temp)))
    return temp_board

def dfs(index,board):
    if index==5:
        return
    
    for _ in range(4):
        board=rotate(board)
        temp_board=movements(board)
        find_max_number(temp_board)
        dfs(index+1,temp_board)

if __name__ == "__main__":
    n=int(input())
    board=[list(map(int,input().split())) for _ in range(n)]

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    max_number=0

    dfs(0,board)
    print(max_number)
    

```