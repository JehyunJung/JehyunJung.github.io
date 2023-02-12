---
title: "[BOJ] Q7682 Tic.Tac.Toe"
excerpt: "BackTracking"

categories:
  - codetest
tags:
  - backtracking
  - codetest
  - boj
  - bruteforce
---
# [BOJ] Q7682 Tic.Tac.Toe
## [Question](https://www.acmicpc.net/problem/7682)
## Language: Python
## Difficulty: Gold 5

해당 문제는 Tic.Tac.Toe라는 게임으로, 누가 먼저 연속된 3개의 자리에 O,X를 위치하는 사람이 이기는 게임이다. 이번 문제의 핵심은 Tic.Tac.Toe 게임의 특성상 매우 작은 보드의 크기를 갖고 있다는 점이다. 이를 통해 모든 경우에 대해서 나올 수 있는 board(게임판) 을 구해서, testcase가 이에 포함되는지 확인하면 되는 문제이다.

> 모든 최종 상태 구하기

```python
def make_boards(index):
    global boards,board
    #끝까지 다 놓은 경우 최종상태에 포함한다.
    if index==9:
        boards.append("".join(board))
        return
    #이미 빙고가 완성된 경우 최종상태에 포함한다.
    if bingo(board):
        boards.append("".join(board))
        return

    
    for i in range(9):
        #이미 해당 위치에 차 있는 경우 넘어간다.
        if board[i] != ".":
            continue
        board[i]=turns[index%2]
        make_boards(index+1)
        board[i]="."
```

이때, 최종상태에 다다르는 조건은, 모든 칸을 다 사용하는 경우 또는 누가 먼저 bingo를 완성시키냐이다. bingo의 경우, 가로 3개, 세로 3개, 대각선 2개 이므로 최대 8번의 조사를 통해 bingo 여부를 조사할 수 있다.

> bingo 조사

```python
def bingo(board):
    #가로 조시
    for i in range(3):
        if board[i*3] != "." and (board[i*3]==board[i*3+1]==board[i*3+2]):
            return True
    
    #세로 조사
    for i in range(3):
        if board[i] != "." and (board[i]==board[i+3]==board[i+6]):
            return True
    
    #대각선 조사
    if board[0] != "." and (board[0]==board[4]==board[8]):
        return True
    
    if board[2] != "." and (board[2]==board[4]==board[6]):
        return True

    return False
```

## Solution

```python
def bingo(board):
    #가로 조시
    for i in range(3):
        if board[i*3] != "." and (board[i*3]==board[i*3+1]==board[i*3+2]):
            return True
    
    #세로 조사
    for i in range(3):
        if board[i] != "." and (board[i]==board[i+3]==board[i+6]):
            return True
    
    #대각선 조사
    if board[0] != "." and (board[0]==board[4]==board[8]):
        return True
    
    if board[2] != "." and (board[2]==board[4]==board[6]):
        return True

    return False

def make_boards(index):
    global boards,board
    #끝까지 다 놓은 경우 최종상태에 포함한다.
    if index==9:
        boards.append("".join(board))
        return
    #이미 빙고가 완성된 경우 최종상태에 포함한다.
    if bingo(board):
        boards.append("".join(board))
        return

    
    for i in range(9):
        #이미 해당 위치에 차 있는 경우 넘어간다.
        if board[i] != ".":
            continue
        board[i]=turns[index%2]
        make_boards(index+1)
        board[i]="."

    
if __name__ == "__main__":
    boards=[]
    board=["."]*9
    turns=["X","O"]
    make_boards(0)
    boards=set(boards)

    with open("input7682.txt","r") as file:
        while True:
            testcase=file.readline().strip()

            #끝인 경우
            if testcase=="end":
                break

            if testcase in boards:
                print("valid")
            else:
                print("invalid")

```