---
title: "[BOJ] Q2580 스도쿠"
excerpt: "BackTracking"

categories:
  - codetest
tags:
  - backtracking
  - codetest
  - boj
---
# [BOJ] Q2580 스도쿠
## [Question](https://www.acmicpc.net/problem/2580)
## Language: Python
## Difficulty: Gold 4

전형적인 backtracking 문제이다. 해당 자리에 넣을 수 있으면 넣고 다음 자리에 대해 탐색을 수행하러 간다.

해당 자리에 넣고, 해당 칸이 포함된 행, 열, 정사각형 내에 중복되는 값이 있는지 여부를 파악하는 함수 작성이 요구된다.


## Solution

```python
def check(row,col,data):
    for variable in range(9):
        if question_board[row][variable]==data or question_board[variable][col]==data:
            return False
        
    start_row=(row//3)*3
    start_col=(col//3)*3
    
    for row in range(start_row,start_row+3):
        for col in range(start_col,start_col+3):
            if question_board[row][col]==data:
                return False
    
    return True

def solution(index):
    if index==len(blanks):
        for row in range(9):
            print(*question_board[row])
        exit(0)

    
    for i in range(1,10):
        row=blanks[index][0]
        col=blanks[index][1]

        if check(row,col,i):
            question_board[row][col]=i
            solution(index+1)
            question_board[row][col]=0

if __name__ == "__main__":
    question_board=[list(map(int,input().split())) for _ in range(9)]
    blanks=[]

    for row in range(9):
        for col in range(9):
            if question_board[row][col]==0:
                blanks.append((row,col))

    solution(0)
```
