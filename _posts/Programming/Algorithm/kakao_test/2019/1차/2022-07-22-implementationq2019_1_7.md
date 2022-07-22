---
title: "[Programmers] P42894 블록 게임"
excerpt: "2019 카카오 공채 1차 문제 7"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P42894 블록 게임
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/42894)
## Language: Python

이 문제는 주어진 조건을 정확하게 구현하는 것이 매우 중요하다.

1. 검은색 블록이 떨어지는 것을 구현 --> 위에서 부터 검은 색을 채우는 것으로 생각한다.
2. 채워진 직사각형이 있는 지 확인한다.
    - 이때, 해당 블록이 문제에 주어진 블록인지 확인한다.
    - 만약 블록이 하나의 숫자가 아닌, 다른 숫자가 포함된 경우 false 처리한다.
3. 채워진 직삭각형은 블록에서 제거한다.
4. 검은색 블록들을 제거한다.

1~4 까지의 과정을 반복해서, 더 이상 채워지는 직사각형이 없을 때까지 진행한다.

## Solution

```python
from math import inf
#해당 블록이 문제에 주어진 블록인지 확인한다. 
def check_if_block(blocks):
    if len(blocks) != 4:
        return False
    #블록 간 비교를 용이하기 위해 정규화 작업을 수행한다.
    min_row=inf
    min_col=inf
    temp_blocks=[]
    for row,col in blocks:
        min_row=min(min_row,row)
        min_col=min(min_col,col)
    
    temp_blocks=[(row-min_row,col-min_col) for row,col in blocks]
    #주어진 문제에서 위에서 내려오는 검은색 블록에 따라 직사각형이 되는 경우는 5가지 경우 밖에 없다.
    certain_blocks=[[(0,1),(1,1),(2,0),(2,1)],[(0,0),(1,0),(2,0),(2,1)],[(0,0),(1,0),(1,1),(1,2)],[(0,2),(1,0),(1,1),(1,2)],[(0,1),(1,0),(1,1),(1,2)]]
    
    if not temp_blocks in certain_blocks:
        return False 
    return True

def check_if_rectangle(n,board,row_size,col_size,start_row,start_col):
    number=0
    block_positions=[]
    for dy in range(row_size):
        for dx in range(col_size):
            row=start_row+dy
            col=start_col+dx
            #범위를 넘어서는 경우
            if row < 0 or row >=n or col < 0 or col>=n:
                return False
            #검은색 블록이면 검사를 생략
            if board[row][col]==-1:
                continue
            #만약 빈칸이면 직사각형이 아니므로 false 반환
            if board[row][col]==0:
                return False
            #빈칸이 아닌경우,
            if board[row][col]!=-1:
                #번호가 저장되지 않은 상태에는 번호를 지정한다.
                if number ==0 :
                    number=board[row][col]
                #기존과 다른 블록의 번호인 경우 false 반환
                elif number != board[row][col]:
                    return False
                block_positions.append((row,col))
                
    #모두 검은색 블록인 경우
    if not number:
        return False
    #해당 블록이 문제에 정의된 블록에 해당하는 경우인지 판단
    if not check_if_block(block_positions):
        return False
    
    return True
#채워진 블록을 제거한다.
def erase_block(board,row_size,col_size,start_row,start_col):
    for dy in range(row_size):
        for dx in range(col_size):
            board[start_row+dy][start_col+dx]=0
#채워진 직사각형이 있는지 여부를 조사한다.
def search_block(n,board):
    for i in range(n):
        for j in range(n):
            if check_if_rectangle(n,board,2,3,i,j):
                erase_block(board,2,3,i,j)
                return True
            elif check_if_rectangle(n,board,3,2,i,j):
                erase_block(board,3,2,i,j)
                return True
    return False
#위에서 부터 검은색 블록을 채우되, 빈칸이 없는 경우 해당 열에 대한 채우기 작업을 끝낸다.
def fill_blackblocks(n,board):
    for j in range(n):
        for i in range(n):
            if board[i][j]!=0:
                break           
            board[i][j]=-1
#채워진 검은색 블록을 제거한다.
def clear_blackblocks(n,board):
    for j in range(n):
        for i in range(n):
            if board[i][j]==-1:         
                board[i][j]=0           

def solution(board):
    answer = 0
    length=len(board)
    while True:
        fill_blackblocks(length,board)
        if search_block(length,board):
            answer+=1
        else:
            break
        clear_blackblocks(length,board)       
    return answer
```
