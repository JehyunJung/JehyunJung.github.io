---
title: "[BOJ] Q17143 낚시왕"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q17143 낚시왕
## [Question](https://www.acmicpc.net/problem/17143)
## Language: Python
## Difficulty: Gold 1

이런 시뮬레이션 문제의 경우, 시뮬레이션 해야되는 부분을 정확하게 분석하는 것이 중요하다.

1초 동안 이루어지는 것은 아래의 2가지와 같다
- 낚시왕이 한칸이 오른쪽으로 이동하고, 가장 가까운 상어를 잡아먹는다.
- 상어가 이동한다.

상어마다, 속력,방향,크기가 모두 다르므로 상어 배열을 저장한다.

편의상 빈칸은 -1를 표시한다.

1. 낚시왕이 상어를 잡는 과정은 간단하다.

```python
def find_closest_shark(col):
    for row in range(n_rows):
        if graph[row][col]!=-1:
            return row +1
    return False

if result:
    catched_amount+=sharks[graph[result-1][col]][2]
    #해당 상어 제거
    graph[result-1][col]=-1
```

2. 상어의 움직임 표현

- 이동을 마친 이후에 한칸에 상어가 여러 마리 있을 수 있다.이럴때는 가장 크기가 큰 상어만 살아남는다. --> 이를 위해서, 임시로 상어를 저장한 새로운 이차원 배열이 필요하다.

``` python
temp_graph=[[-1] * n_cols for _ in range(n_rows)]
#만약 이동한 칸에 상어가 있는 경우(즉, 빈칸이 아닌 경우)
if temp_graph[row][col] !=-1:
    #기존에 있는 상어의 크기와 비교해서, 크기가 더 크면 해당 칸에 들어가고, 그렇지 않은 경우 해당 상어는 사라지게 된다.
    if sharks[temp_graph[row][col]][2] >= sharks[graph[start_row][start_col]][2]:
        continue
```

- 벽을 만나게 되면 반대방향으로 전환한다.

```python
dy=[-1,1,0,0]
dx=[0,0,1,-1]

change_direction=[1,0,3,2]
```

서로 반대방향끼리 연결한 change_direction 리스트 활용

- 상어의 이동

상어의 이동은 상어의 속력만큼 이동하게 되며, 아래와 같이 구현될 수 있다.

```python
#속도,방향,크기
shark_index=graph[start_row][start_col]
row,col=start_row,start_col
#상어의 속력만큼 이동
times=0
while times < sharks[shark_index][0]:
    next_row,next_col=row+dy[sharks[shark_index][1]],col+dx[sharks[shark_index][1]]
    if next_row < 0 or next_row >=n_rows or next_col < 0 or next_col >=n_cols:
        #방향 전환
        sharks[shark_index][1]=change_direction[sharks[shark_index][1]]
        #전단계로 다시 돌아가는 과정
    else:
        row,col=next_row,next_col
        times+=1
```

## Failed Solution

```python
def find_closest_shark(col):
    for row in range(n_rows):
        if graph[row][col]!=-1:
            return row +1
    return False


def shark_move():
    global graph

    dy=[-1,1,0,0]
    dx=[0,0,1,-1]

    change_direction=[1,0,3,2]

    temp_graph=[[-1] * n_cols for _ in range(n_rows)]

    for start_row in range(n_rows):
        for start_col in range(n_cols):
            if graph[start_row][start_col] !=-1:
                #속도,방향,크기
                shark_index=graph[start_row][start_col]
                row,col=start_row,start_col
                #상어의 속력만큼 이동
                times=0
                while times < sharks[shark_index][0]:
                    next_row,next_col=row+dy[sharks[shark_index][1]],col+dx[sharks[shark_index][1]]
                    if next_row < 0 or next_row >=n_rows or next_col < 0 or next_col >=n_cols:
                        #방향 전환
                        sharks[shark_index][1]=change_direction[sharks[shark_index][1]]
                        #전단계로 다시 돌아가는 과정
                    else:
                        row,col=next_row,next_col
                        times+=1
                #이동을 마친 이후, 해당 칸에 더 큰 상어가 있는 경우, 해당 상어에게 잡아먹히게 된다.
                if temp_graph[row][col] !=-1:
                    if sharks[temp_graph[row][col]][2] >= sharks[graph[start_row][start_col]][2]:
                        continue
                
                temp_graph[row][col]=graph[start_row][start_col]
            
    graph=temp_graph                   


def solution():
    catched_amount=0
    for col in range(n_cols):
        #잡을 수 있는 상어 찾기
        result=find_closest_shark(col)
        #잡을 수 있는 상어가 있는 경우 잡는다.
        if result:
            catched_amount+=sharks[graph[result-1][col]][2]
            #해당 상어 제거
            graph[result-1][col]=-1
        
        #상어의 이동
        shark_move()

    return catched_amount

if __name__ == "__main__":
    graph=[]
    sharks=[]
    n_rows,n_cols,n_sharks=map(int,input().split())
    graph=[[-1]*n_cols for _ in range(n_rows)]
    for i in range(n_sharks):
        row,col,speed,direction,size=map(int,input().split())
        sharks.append([speed,direction-1,size])
        graph[row-1][col-1]=i
            
    print(solution())
```

위와 같이 구현을 수행하게 되면, 결론적으로 시간 초과가 발생하게 된다. 해당 문제의 input의 최대 조건을 토대로 분석해보면, 상어는 최대 10000마리가 가능하며, 최대 1000만큼 한번에 이동하는 것이 가능하다. 즉, 한번의 이동 과정에 있어서, 최대 10,000,000 만큼의 반복이 발생한다. 이를 토대로, 각 열마다 반복을 수행한다면(낚시왕의 이동과정) 너무 많은 반복횟수가 존재한다.

그래서, 상어의 이동 과정에 있어서 최적화가 필요하다.

자세히 보면, 상어는 상하 이동 혹은 좌우 이동만 수행하게 된다. 또, 일정 길이 만큼 이동하게 되면 방향과 위치가 처음과 동일한 상태로 돌아오는 것을 알수 있다.

예를 들어 

```
[1,2,3,4,5,6]
```
위의 6칸을 가로 이동한다고 생각해보자, 만약 상어가 처음에 2번칸에 있고, 오른쪽으로 이동을 시작하게 되면 상어는 12번의 이동 이후에 처음 위치로 돌아오게 된다. 
즉, 2*(6-2)+2 = 2*6 -2 만큼 이동하게 되면 처음과 같아진다는 의미이다. 
이를 확장해보면, 12칸,24칸,36칸 ... 이동하는 결과가 모두 같다는 의미이다. 따라서, 상어의 이동 반경을 ```2*n_rows-2 혹은 2*n-cols-2``` 만큼으로 줄일수 있게 된다.

```python
if direction <=2: #상하 이동인경우
    speed %= (2*n_rows-2)
else: #좌우 이동인경우
    speed %= (2*n_cols-2)
```

## Solution

```python
def find_closest_shark(col):
    for row in range(n_rows):
        if graph[row][col]!=-1:
            return row +1
    return False


def shark_move():
    global graph

    dy=[-1,1,0,0]
    dx=[0,0,1,-1]

    change_direction=[1,0,3,2]

    temp_graph=[[-1] * n_cols for _ in range(n_rows)]

    for start_row in range(n_rows):
        for start_col in range(n_cols):
            if graph[start_row][start_col] !=-1:
                #속도,방향,크기
                shark_index=graph[start_row][start_col]
                row,col=start_row,start_col
                #상어의 속력만큼 이동
                times=0
                while times < sharks[shark_index][0]:
                    next_row,next_col=row+dy[sharks[shark_index][1]],col+dx[sharks[shark_index][1]]
                    if next_row < 0 or next_row >=n_rows or next_col < 0 or next_col >=n_cols:
                        #방향 전환
                        sharks[shark_index][1]=change_direction[sharks[shark_index][1]]
                        #전단계로 다시 돌아가는 과정
                    else:
                        row,col=next_row,next_col
                        times+=1
                #이동을 마친 이후, 해당 칸에 더 큰 상어가 있는 경우, 해당 상어에게 잡아먹히게 된다.
                if temp_graph[row][col] !=-1:
                    if sharks[temp_graph[row][col]][2] >= sharks[graph[start_row][start_col]][2]:
                        continue
                
                temp_graph[row][col]=graph[start_row][start_col]
            
    graph=temp_graph                   


def solution():
    catched_amount=0
    for col in range(n_cols):
        #잡을 수 있는 상어 찾기
        result=find_closest_shark(col)
        #잡을 수 있는 상어가 있는 경우 잡는다.
        if result:
            catched_amount+=sharks[graph[result-1][col]][2]
            #해당 상어 제거
            graph[result-1][col]=-1
        
        #상어의 이동
        shark_move()

    return catched_amount

if __name__ == "__main__":
    graph=[]
    sharks=[]
    n_rows,n_cols,n_sharks=map(int,input().split())
    graph=[[-1]*n_cols for _ in range(n_rows)]
    for i in range(n_sharks):
        row,col,speed,direction,size=map(int,input().split())
        if direction <=2: #상하 이동인경우
            speed %= (2*n_rows-2)
        else:
            speed %= (2*n_cols-2)
        sharks.append([speed,direction-1,size])
        graph[row-1][col-1]=i
            
    print(solution())
```