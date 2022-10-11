---
title: "[BOJ] Q23291 어항정리"
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
# [BOJ] Q23291 어항정리
## [Question](https://www.acmicpc.net/problem/23291)
## Language: Python
## Difficulty: Platinum 5

해당 문제는 주어진 조건에 따른 시뮬레이션을 구현하는 것이 관건이다.

시뮬레이션 과정은 아래와 같다

1. 1차 어항 이동
    - 물고기 이동
    - 어항 배열 평탄화 작업
2. 2차 어항 이동
    - 물고기 이동
    - 어항 배열 평탄화 작업

> 물고기 이동

```python
def fish_move(fish_board,start_row,start_col,row_size,col_size):
    temp_board=[[0] *n for _ in range(n)]

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    #인접한 어항들에 대한 증감 배열을 구한다. 이때 물고기의 개수가 큰쪽에서 작은쪽으로만 고려
    for row in range(start_row,n):
        for col in range(start_col,n):
            for dir in range(4):
                next_row=row+dy[dir]
                next_col=col+dx[dir]

                if next_row < 0 or next_row >=n or next_col < 0 or next_col>=n:
                    continue
                
                if fish_board[next_row][next_col]==0:
                    continue

                if fish_board[row][col]<=fish_board[next_row][next_col]:
                    continue

                difference=(fish_board[row][col]-fish_board[next_row][next_col])//5

                temp_board[row][col]-=difference
                temp_board[next_row][next_col]+=difference
    
    #증감을 기존 배열에 반영한다.
    for row in range(start_row,n):
        for col in range(start_col,n):
            fish_board[row][col]+=temp_board[row][col]
                
    return fish_board
```

물고기의 이동을 구현할때 단일 방향에 대해서 고려해야되는데, 이는 물고기 이동에 있어 중복을 피함을 위함이다. 즉 a,b가 있을 때, a->b(a>b)만 고려하도록 해서 b->a가 중복적으로 처리되지 않도록 한다.

> 어항 배열 평탄화 작업

```python
def fish_bowl_flatten(fish_board,start_row,start_col,row_size,col_size):
    temp_board=[[0] * n for _ in range(n)]
    index=0
    
    for col in range(start_col,start_col+col_size):
        for row in range(n-1,start_row-1,-1):
            temp_board[n-1][index]=fish_board[row][col]
            index+=1
    
    for left_index in range(index,n):
        temp_board[n-1][left_index]=fish_board[n-1][left_index]
    
    return temp_board
```

어항 배열 평탄화하는 작업은 층으로 구성되어 있는 어항 배열을 1차원 리스트로 변화하는 과정으로 1층 부터 n층 까지를 1차원 리스트에 저장하는 형태로 진행하면 된다.

> 1차 이동 - 공중 부양할 어항 선택 -> 회전

```python
moving_target=[[0] * col_size for _ in range(row_size)]
row_index=0
for row in range(start_row,n):
    col_index=0
    for col in range(start_col,start_col+col_size):
        moving_target[row_index][col_index]=fish_board[row][col]
        #기존 위치는 제거
        fish_board[row][col]=0
        col_index+=1
    row_index+=1

#시계방향 회전
moving_target=rotate(moving_target,row_size,col_size)
```


> 1차 이동 - 공중 부양된 어항 적재

```python
#90도 회전을 하게 되면 row,col 사이즈가 바뀌기 때문에 col_size 만큼 빼준다.
start_row=n-1-col_size
start_col+=col_size

#시계 방향으로 회전된 어항을 기존 어항 위에 올린다.
for row in range(col_size):
    for col in range(row_size):
        fish_board[start_row+row][start_col+col]=moving_target[row][col]
```


> 2차 이동 - 공중 부양할 어항 선택 -> 회전

```python
start_row,start_col=n-1,0
row_size,col_size=1,1
for i in range(2):
    row_size,col_size=2**i,n//2**(i+1)

    moving_target=[[0] * col_size for _ in range(row_size)]
    row_index=0
    for row in range(start_row,n):
        col_index=0
        for col in range(start_col,start_col+col_size):
            moving_target[row_index][col_index]=fish_board[row][col]
            #기존 위치는 제거
            fish_board[row][col]=0
            col_index+=1
        row_index+=1

    #180도 회전 수행
    moving_target.append(moving_target.pop(0))
    moving_target=list(map(lambda x: x[::-1],moving_target))
```

> 2차 이동 - 공중 부양된 어항 적재

```python
start_row-=row_size
start_col+=col_size

#시계 방향으로 회전된 어항을 기존 어항 위에 올린다.
for row in range(row_size):
    for col in range(col_size):
        fish_board[start_row+row][start_col+col]=moving_target[row][col]
```


## Solution 1

```python
from os.path import dirname,join
def rotate(arr,n_rows,n_cols):
    temp=[[0]*n_rows for _ in range(n_cols)]

    for row in range(n_rows):
        for col in range(n_cols):
            temp[col][n_rows-1-row]=arr[row][col]

    return temp

def fish_move(fish_board,start_row,start_col,row_size,col_size):
    temp_board=[[0] *n for _ in range(n)]

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    #인접한 어항들에 대한 증감 배열을 구한다.
    for row in range(start_row,n):
        for col in range(start_col,n):
            for dir in range(4):
                next_row=row+dy[dir]
                next_col=col+dx[dir]

                if next_row < 0 or next_row >=n or next_col < 0 or next_col>=n:
                    continue
                
                if fish_board[next_row][next_col]==0:
                    continue

                if fish_board[row][col]<=fish_board[next_row][next_col]:
                    continue

                difference=(fish_board[row][col]-fish_board[next_row][next_col])//5

                temp_board[row][col]-=difference
                temp_board[next_row][next_col]+=difference
    
    #증감을 기존 배열에 반영한다.
    for row in range(start_row,n):
        for col in range(start_col,n):
            fish_board[row][col]+=temp_board[row][col]
                

    return fish_board

def fish_bowl_flatten(fish_board,start_row,start_col,row_size,col_size):
    temp_board=[[0] * n for _ in range(n)]
    index=0
    
    for col in range(start_col,start_col+col_size):
        for row in range(n-1,start_row-1,-1):
            temp_board[n-1][index]=fish_board[row][col]
            index+=1
    
    for left_index in range(index,n):
        temp_board[n-1][left_index]=fish_board[n-1][left_index]
    
    return temp_board
 

def fish_bowl_move(fish_board):
    row_size,col_size=1,1
    size_increases=[(1,0),(0,1)]
    start_row,start_col=n-1,0
    for i in range(n):
        moving_target=[[0] * col_size for _ in range(row_size)]
        row_index=0
        for row in range(start_row,n):
            col_index=0
            for col in range(start_col,start_col+col_size):
                moving_target[row_index][col_index]=fish_board[row][col]
                #기존 위치는 제거
                fish_board[row][col]=0
                col_index+=1
            row_index+=1

        #시계방향 회전
        moving_target=rotate(moving_target,row_size,col_size)

        start_row=n-1-col_size
        start_col+=col_size

        #시계 방향으로 회전된 어항을 기존 어항 위에 올린다.
        for row in range(col_size):
            for col in range(row_size):
                fish_board[start_row+row][start_col+col]=moving_target[row][col]

        row_size+=size_increases[i%2][0]
        col_size+=size_increases[i%2][1]

         #더 이상 쌓기가 불가능할 경우 멈춘다.
        if row_size > n-(row_size*col_size):
            break 
        
    
    #물고기간 이동 수행
    fish_board=fish_move(fish_board,start_row,start_col,row_size,col_size)
    fish_board=fish_bowl_flatten(fish_board,start_row,start_col,row_size,col_size)
    
    return fish_board

def fish_bowl_second_move(fish_board):
    start_row,start_col=n-1,0
    row_size,col_size=1,1
    for i in range(2):
        row_size,col_size=2**i,n//2**(i+1)

        moving_target=[[0] * col_size for _ in range(row_size)]
        row_index=0
        for row in range(start_row,n):
            col_index=0
            for col in range(start_col,start_col+col_size):
                moving_target[row_index][col_index]=fish_board[row][col]
                #기존 위치는 제거
                fish_board[row][col]=0
                col_index+=1
            row_index+=1

        #180도 회전 수행
        moving_target.append(moving_target.pop(0))
        moving_target=list(map(lambda x: x[::-1],moving_target))


        start_row-=row_size
        start_col+=col_size

        #시계 방향으로 회전된 어항을 기존 어항 위에 올린다.
        for row in range(row_size):
            for col in range(col_size):
                fish_board[start_row+row][start_col+col]=moving_target[row][col]
    

    fish_board=fish_move(fish_board,start_row,start_col,4,n//4)
    fish_board=fish_bowl_flatten(fish_board,start_row,start_col,4,n//4)
    
    return fish_board


def fish_organize():
    global fish_bowls
    min_fish_size=min(fish_bowls)
    
    fish_board=[[0] * n for _ in range(n)]

    #가장 적은 수의 물고기를 가진 어항에는 물고기 1개씩 추가
    for index in range(n):
        if fish_bowls[index]==min_fish_size:
            fish_bowls[index]+=1
        fish_board[n-1][index]=fish_bowls[index]
    
    #1차 어항 이동 작업 수행
    fish_board=fish_bowl_move(fish_board)

    #2차 어항 이동 작업 수행
    fish_board=fish_bowl_second_move(fish_board)

    for index in range(n):
        fish_bowls[index]=fish_board[n-1][index]
    return fish_bowls
    
def solution():
    
    turn=0
    while True:
        if max(fish_bowls)-min(fish_bowls)<=k:
            return turn
        fish_organize()
        turn+=1

if __name__ == "__main__":
    #predefined globals
    n,k=map(int,input().split())
    fish_bowls=list(map(int,input().split()))
    
    print(solution())
```

위의 방식 처럼 일일히 n*n 형태의 fish board을 이용해서 어항 정리를 진행해도 되지만 효율적으로 처리하기 위해 queue을 활용해서 위의 함수를 최적화해보자.
어항을 이루는 열을 queue로 저장하고, 이러한 queue들을 하나의 queue을 통해 정리하게 popleft/pop 연산을 이용해서 쉽게 구현하는 것이 가능하다.

**배열에 추가/삭제 연산이 활발히 이루어지는 시뮬레이션의 경우 일일히 모든 작업은 배열로 생각하지 않고, queue을 활용도록 한다.**

```python
from os.path import dirname,join
from collections import deque

def fish_move(fish_board):
    temp_board=[[0] *len(queue) for queue in fish_board]

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    max_row=len(fish_board)

    #인접한 어항들에 대한 증감 배열을 구한다.
    for row in range(max_row):
        queue=fish_board[row]
        queue_length=len(queue)
        for col in range(queue_length):
            for dir in range(4):
                next_row=row+dy[dir]
                next_col=col+dx[dir]

                if next_row < 0 or next_row >=max_row or next_col < 0 or next_col>=len(fish_board[next_row]):
                    continue

                if fish_board[row][col]<=fish_board[next_row][next_col]:
                    continue

                difference=(fish_board[row][col]-fish_board[next_row][next_col])//5

                temp_board[row][col]-=difference
                temp_board[next_row][next_col]+=difference
    
    #증감을 기존 배열에 반영한다.
    for row in range(max_row):
        queue=fish_board[row]
        queue_length=len(queue)
        for col in range(queue_length):
            queue[col]+=temp_board[row][col]

    return fish_board

def fish_bowl_flatten(fish_board):
    temp_board=deque([deque() for _ in range(n)])
    index=0
    max_row=len(fish_board)
    #증감을 기존 배열에 반영한다.
    for row in range(max_row):
        queue=fish_board[row]
        queue_length=len(queue)
        for col in range(queue_length):
            temp_board[index].append(fish_board[row][col])
            index+=1
    
    return temp_board

def fish_bowl_move(fish_board):
    row_size,col_size=1,1
    size_increases=[(1,0),(0,1)]
    for i in range(n):
        moving_target=[fish_board.popleft() for _ in range(col_size)]

        #시계방향 회전
        for col in range(col_size-1,-1,-1):
            for row in range(row_size):
                fish_board[row].append(moving_target[col].popleft())

        row_size+=size_increases[i%2][0]
        col_size+=size_increases[i%2][1]

         #더 이상 쌓기가 불가능할 경우 멈춘다.
        if row_size > n-(row_size*col_size):
            break 
        
    #물고기간 이동 수행
    fish_board=fish_move(fish_board)
    fish_board=fish_bowl_flatten(fish_board)
    
    return fish_board

def fish_bowl_second_move(fish_board):
    for i in range(2):
        row_size,col_size=2**i,n//2**(i+1)

        moving_target=[fish_board.popleft() for _ in range(col_size)]

        for col in range(col_size):
            for row in range(row_size):
                fish_board[col].append(moving_target[col_size-1-col].pop())


    fish_board=fish_move(fish_board)
    fish_board=fish_bowl_flatten(fish_board)
    
    return fish_board

def fish_organize():
    global fish_bowls
    min_fish_size=min(fish_bowls)
    
    fish_board=deque([deque() for _ in range(n)])

    #가장 적은 수의 물고기를 가진 어항에는 물고기 1개씩 추가
    for index in range(n):
        if fish_bowls[index]==min_fish_size:
            fish_bowls[index]+=1
        fish_board[index].append(fish_bowls[index])
    
    #1차 어항 이동 작업 수행
    fish_board=fish_bowl_move(fish_board)

    #2차 어항 이동 작업 수행
    fish_board=fish_bowl_second_move(fish_board)

    for index in range(n):
        fish_bowls[index]=fish_board[index][0]

    return fish_bowls
    
def solution():
    
    turn=0
    while True:
        if max(fish_bowls)-min(fish_bowls)<=k:
            return turn
        fish_organize()
        turn+=1

if __name__ == "__main__":
    #predefined globals
    n,k=map(int,input().split())
    fish_bowls=list(map(int,input().split()))
    print(solution())
```
