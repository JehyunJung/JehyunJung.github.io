---
title: "[BOJ] Q17837 새로운 게임2"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
  - try_again
---
# [BOJ] Q17837 새로운 게임2
## [Question](https://www.acmicpc.net/problem/17837)
## Language: Python
## Difficulty: Gold 4

꽤나 구현조건이 까다로운 문제로, 주의깊게 볼 필요가 있었던 문제이다.

시뮬레이션 유형의 문제로, 시뮬레이션 과정을 정확하게 구현하는 것이 중요하다.

1. 각 칸마다 말이 겹칠 수 있기 때문에, 해당 칸을 각각 리스트 형태로 저장해야한다.

```python
horse_board=[[[] for _ in range(N)] for _ in range(N)]
```

2. 각각의 말에 대해서, 위치 정보, 높이,방향 정보를 저장하고 있어야한다. 높이 정보를 알고 있어야, 해당 칸에서 현재 말을 포함한 그 위의 말을 같이 옮길 수 있다.

```python
horses=dict()
    N,K=map(int,input().split())
    for i in range(K):
        horses[i]=[row-1,col-1,0,dir-1] #row,col,놓인 층 수(높이),방향
```

3. 각각의 칸의 종류 마다 다르게 처리하도록 한다.

    - 흰색인 경우: 현재 말을 포함한 말들을 이동하는 위치로 한번에 옮기면 된다.

    ```python
    horse_board[next_row][next_col].extend(horse_board[row][col][horse_height:])
    ```
    - 빨간색 경우: 흰색 칸으로 옮기는 경우와 유사한데, 역순으로 옮겨야한다.

    ```python
    horse_board[next_row][next_col].extend(horse_board[row][col][horse_height:][::-1])
    ```
    - 파란색인 경우: 파란색인 경우, 반대방향으로 한칸 이동 했을 때, 파란색 이거나 범위를 넘어가는 경우 이동을 멈춘다
    **그 외의 경우에 대해서는, 다시 한번 흰색/빨간색인 경우에 따라 처리를 다시 해줘야한다.** 이 부분을 고려하는 것을 주의해야한다.

    ```python
    if next_row <0 or next_row >=N or next_col < 0 or next_col>=N or board[next_row][next_col]==2:
        #방향을 바꿔준다.
        dir=change_direction[dir]
        horses[index][3]=dir
        #바뀐 방향으로 한 칸 이동한다.
        next_row=row+dy[dir]
        next_col=col+dx[dir]

        #이동하고 나서도, 벗어난 경우이거나 파란색인 경우 이동을 하지 않는다.
        if next_row <0 or next_row >=N or next_col < 0 or next_col>=N or board[next_row][next_col]==2:
            continue
    ```

4. 말들을 현재 위치에서 다음 위치로 옮기게 되면 높이 행/열 정보와 높이 정보가 바뀌기 때문에 이를 갱신해줘야한다.
그리고, 이전 위치에 있었던 말들은 없애줘야한다. **이때, 현재 말을 기준으로 위에 있는 말들만 없애야지, 이전 위치에 있던 모든 말들을 제거하면 안된다.**

```python
height=0
for index in horse_board[next_row][next_col]:
    horses[index][0]=next_row
    horses[index][1]=next_col
    horses[index][2]=height
    height+=1

horse_board[row][col]=horse_board[row][col][:horse_height]
```


## Solution

```python
def solution():
    horse_board=[[[] for _ in range(N)] for _ in range(N)]
    
    dy=[0,0,-1,1]
    dx=[1,-1,0,0]
    change_direction=[1,0,3,2]

    #초기 말의 위치 배치
    for index in range(K):
        row,col,height,dir=horses[index]
        horse_board[row][col].append((index))
        
    for i in range(1,1001):
        check=False

        #턴 진행
        for index in range(K):
            horse=horses[index]
            row,col,horse_height,dir=horse

            next_row=row+dy[dir]
            next_col=col+dx[dir]

            #벗어나는 경우 or 파란색인 경우
            if next_row <0 or next_row >=N or next_col < 0 or next_col>=N or board[next_row][next_col]==2:
                #방향을 바꿔준다.
                dir=change_direction[dir]
                horses[index][3]=dir
                #바뀐 방향으로 한 칸 이동한다.
                next_row=row+dy[dir]
                next_col=col+dx[dir]

                #이동하고 나서도, 벗어난 경우이거나 파란색인 경우 이동을 하지 않는다.
                if next_row <0 or next_row >=N or next_col < 0 or next_col>=N or board[next_row][next_col]==2:
                    continue
                #만약 이동할 수 있는 경우이면 아래의 빨간색, 흰색 경우를 고려한다.
  
            #빨간색인 경우
            if board[next_row][next_col]==1:
                #이전 위치에 있던 말을 옮기게 되는데, 이때 역순으로 해서 옮겨야한다.
                horse_board[next_row][next_col].extend(horse_board[row][col][horse_height:][::-1])
                
            #흰색인 경우
            elif board[next_row][next_col]==0:
                horse_board[next_row][next_col].extend(horse_board[row][col][horse_height:])


            #말의 위치 정보를 새롭게 저장한다.
            height=0
            for index in horse_board[next_row][next_col]:
                horses[index][0]=next_row
                horses[index][1]=next_col
                horses[index][2]=height
                height+=1

            horse_board[row][col]=horse_board[row][col][:horse_height]
            
            #4개 이상 쌓였는 지 파악
            if len(horse_board[next_row][next_col])>=4:
                check=True
                break
            
        #턴 진행중에 쌓인 경우
        if check:
            return i

    return -1
if __name__== "__main__":
    horses=dict()
    N,K=map(int,input().split())
    board=[list(map(int,input().split())) for _ in range(N)]
    for i in range(K):
        row,col,dir=map(int,input().split())
        horses[i]=[row-1,col-1,0,dir-1] #row,col,놓인 층 수(높이),방향
    
    print(solution())
```