---
title: "[BOJ] Q17779 게리맨더링 2"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - bruteforce
  - dfs
  - codetest
  - boj
  - samsung
---
# [BOJ] Q17779 게리맨더링 2
## [Question](https://www.acmicpc.net/problem/17779)
## Language: Python
## Difficulty: Gold 3

주어진 문제에서는 경계선으로 선거구역을 총 5구역으로 구분하게 되는데, 이때, 문제에 주어진 조건에 따라 경계선에 해당하는 좌표에 대해서 선거구역을 할당하고 나머지 선거구역을 할당한다.

> 선거구역 할당
```python
for delta in range(0,d1+1):
    temp_board[start_row+delta][start_col-delta]=5
    temp_board[start_row+d2+delta][start_col+d2-delta]=5
for delta in range(0,d2+1):
    temp_board[start_row+delta][start_col+delta]=5
    temp_board[start_row+d1+delta][start_col-d1+delta]=5
```

그리고 각각의 선거구역에 대해서 번호를 할당한다.

```python
#1번 구역
    for row in range(0,start_row+d1):
        for col in range(0,start_col+1):
            if temp_board[row][col]==5:
                break
            temp_board[row][col]=1
    #2번 구역
    for row in range(0,start_row+d2+1):
        for col in range(n-1,start_col,-1):
            if temp_board[row][col]==5:
                break
            temp_board[row][col]=2
    #3번 구역
    for row in range(start_row+d1,n):
        for col in range(start_col-d1+d2):
            if temp_board[row][col]==5:
                break
            temp_board[row][col]=3
    #4번 구역
    for row in range(start_row+d2+1,n):
        for col in range(n-1,start_col-d1+d2-1,-1):
            if temp_board[row][col]==5:
                break
             temp_board[row][col]=4
```

이때, 순회를 하는 도중에 경계선을 만나게 되면 다음 행에 대한 번호 할당을 이어나가면서 경계선과 겹치는 부분에 대한 처리를 한다.

이렇게 모든 구역에 대해 번호 할당이 완료되었으면 할당된 번호에 따라 선거구역 내의 인구 수의 합을 구한다. 이때 경계선 내부의 구역에는 초기값인 0이 할당되어 있는데, 0-1인 -1의 값은 리스트의 마지막 index인 5을 가르키게 되므로 자동으로 경계선 내부의 구역은 5번 선거구역으로 할당된다.

```python
citizens=[0]*5
for row in range(n):
    for col in range(n):
        citizens[temp_board[row][col]-1]+=board[row][col]
```

## Solution 

```python
from math import inf

def check_index(start_row,start_col,d1,d2):
    #왼쪽 좌표 확인
    if start_col-d1 <0:
        return False
    #오른쪽 좌표 확인
    if start_col+d2 >=n:
        return False
    #아랫쪽 좌표 확인
    if start_row + d1+d2 >=n:
        return False
    
    return True
def make_board_and_find_difference(start_row,start_col,d1,d2):
    temp_board=[[0] * n for _ in range(n)]

    #5번 구역 표현
    for delta in range(0,d1+1):
        temp_board[start_row+delta][start_col-delta]=5
        temp_board[start_row+d2+delta][start_col+d2-delta]=5
    for delta in range(0,d2+1):
        temp_board[start_row+delta][start_col+delta]=5
        temp_board[start_row+d1+delta][start_col-d1+delta]=5

    #1번 구역
    for row in range(0,start_row+d1):
        for col in range(0,start_col+1):
            if temp_board[row][col]==5:
                break
            temp_board[row][col]=1

    
    #2번 구역
    for row in range(0,start_row+d2+1):
        for col in range(n-1,start_col,-1):
            if temp_board[row][col]==5:
                break
            temp_board[row][col]=2


    #3번 구역
    for row in range(start_row+d1,n):
        for col in range(start_col-d1+d2):
            if temp_board[row][col]==5:
                break
            temp_board[row][col]=3


    #4번 구역
    for row in range(start_row+d2+1,n):
        for col in range(n-1,start_col-d1+d2-1,-1):
            if temp_board[row][col]==5:
                break
            temp_board[row][col]=4

    
    citizens=[0]*5
    for row in range(n):
        for col in range(n):
            citizens[temp_board[row][col]-1]+=board[row][col]

    return max(citizens)-min(citizens)

def solution():
    min_difference=inf

    for start_row in range(n):
        for start_col in range(n):
            for d1 in range(1,n):
                for d2 in range(1,n):  
                    if not check_index(start_row,start_col,d1,d2):
                        continue
                    min_difference=min(min_difference,make_board_and_find_difference(start_row,start_col,d1,d2))

    return min_difference

if __name__ == "__main__":
    #predefined globals
    n=int(input())   
    board=[list(map(int,input().split())) for _ in range(n)]    
    print(solution())
```