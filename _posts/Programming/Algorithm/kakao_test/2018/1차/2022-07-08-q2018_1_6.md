---
title: "[Programmers] P17679 프렌즈4블록"
excerpt: "2018 카카오 공채 1차 문제 6"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17679 프렌즈4블록
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17679)
## Language: Python

1. 2X2 영역이 같은 문자로 이루어져있는지 확인하는 함수 작성 --> points 배열을 반환한다.
2. points 배열에 있는 좌표들을 모두 0 처리 한다(문자 제거), 제거된 수 만큼 answer 증가
3. 위에 있는 문자를 내려주는 역할을 하는 함수(아래에 비어있는 경우 아래로 내려준다.)



## Solution

```python
#1
def search_for_puzzle(m,n,board):
    points=set()
    blocks=[]
    for i in range(m-1):
        for j in range(n-1):
            block_type=board[i][j]
            #빈칸이면 해당 영역은 검사할 필요가 없다 
            if block_type==0:
                continue
            if board[i][j]==block_type and board[i][j+1]==block_type and board[i+1][j]==block_type and board[i+1][j+1]==block_type:
                points.add((i,j))
                points.add((i,j+1))
                points.add((i+1,j))
                points.add((i+1,j+1))
    return points

#2
def delete_puzzles(points,board):
    for row,col in points:
        board[row][col]=0

#3
def drop_down(m,n,board):
    for i in range(m-2,-1,-1):
        for j in range(n):
            if board[i][j]==0:
                continue
            row=i+1
            #빈칸이 아닐때 까지 계속 내려준다.
            while row < m and board[row][j] ==0:
                board[row][j],board[row-1][j]=board[row-1][j],board[row][j]
                row+=1

def solution(m, n, board):
    answer = 0
    board=[list(row) for row in board]
    
    while True:
        points=search_for_puzzle(m,n,board)
        #더 이상 지울 영역이 없으면 종료한다.
        if points==set():
            break
        answer+=len(points)
        delete_puzzles(points,board)
        drop_down(m,n,board)

    return answer
```
