---
title: "[BOJ] Q19237 어른 상어"
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
# [BOJ] Q19237 어른 상어
## [Question](https://www.acmicpc.net/problem/19237)
## Language: Python
## Difficulty: Gold 2~3

해당 문제의 시뮬레이션의 경우 크게 2가지의 구현이 필요하다

1. 상어의 이동

> 우선 빈칸에 대해서 찾는다

```python
for dir in range(4):
    next_direction=shark_priorities[shark_index-1][current_shark_direction[shark_index-1]-1][dir]
    next_row=row+dy[next_direction-1]
    next_col=col+dx[next_direction-1]     

    if next_row < 0 or next_row >= N or next_col < 0 or next_col >=N:
        continue

    #냄새가 있는 경우 아직은 넣지 않는다.
    if smell_graph[next_row][next_col] != None:
        continue
    
    #기존의 방향을 변경해줘야한다.
    current_shark_direction[shark_index-1]=next_direction
    #아직 상어가 없는 경우
    if temp_graph[next_row][next_col]==0:
        temp_graph[next_row][next_col]=shark_index
    #번호가 작은 상어가 우세를 차지한다.
    else:
        temp_graph[next_row][next_col]=min(temp_graph[next_row][next_col],shark_index)
    
    checked=True
    break
```

번호가 작은 상어의 경우 우세를 가지기 때문에, 새로운 칸에 상어를 넣을때는 번호를 비교한다.

> 빈칸이 없는 경우 자기 냄새가 있는 칸으로 이동한다.

```python
if not checked:
    for dir in range(4):
        next_direction=shark_priorities[shark_index-1][current_shark_direction[shark_index-1]-1][dir]
        next_row=row+dy[next_direction-1]
        next_col=col+dx[next_direction-1]     

        if next_row < 0 or next_row >= N or next_col < 0 or next_col >=N:
            continue

        #냄새가 없는 경우 
        if smell_graph[next_row][next_col] == None:
            continue
        
        index,count=smell_graph[next_row][next_col]
        
        #자기 냄새가 인 경우
        if index == shark_index: 
            #기존의 방향을 변경해줘야한다.
            current_shark_direction[shark_index-1]=next_direction
            temp_graph[next_row][next_col]=shark_index
            break
```

냄새가 있는 칸으로 가는 경우 해당 냄새의 index에 해당하는 상어만 올수 있기 때문에 다른 상어와의 경쟁이 필요없다.


**이때, 주의할 점은 상어가 이동하는 방향이 곧 상어의 새로운 방향이 되다는 점이다.**

2. 냄새의 양 감소

냄새가 있는 칸에 대해서는 1씩 감소 시켜야하며, 새롭게 상어가 이동한 칸에는 냄새를 추가해야한다.

```python
if smell_graph[row][col] != None:
    shark_index,count=smell_graph[row][col]

    #냄새가 1인 경우 1 감소하면 0이 되므로 제거한다. 또한 냄새가 사라지면 빈칸이 되므로 이에대한 처리를 수행한다.
    if count ==1:
        smell_graph[row][col] = None   
    else:
        smell_graph[row][col]=[shark_index,count-1]  

#상어가 새롭게 칸에 들어오면 해당 상어의 번호에 맞는 냄새 생성
if graph[row][col] !=0:
    smell_graph[row][col]=[graph[row][col],K]
```

## Solution

```python
def check_if_shark_alive():
    for row in range(N):
        for col in range(N):
            if graph[row][col]==0:
                continue

            elif graph[row][col] != 1:
                return True
    return False

def shark_move(smell_graph):
    global graph
    temp_graph=[[0] * N for _ in range(N)]
    for row in range(N):
        for col in range(N):
            #빈칸 생략
            if graph[row][col]==0:
                continue
            shark_index=graph[row][col]

            checked=False
            
            #빈칸이 있는 지 먼저 확인한다.
            for dir in range(4):
                next_direction=shark_priorities[shark_index-1][current_shark_direction[shark_index-1]-1][dir]
                next_row=row+dy[next_direction-1]
                next_col=col+dx[next_direction-1]     

                if next_row < 0 or next_row >= N or next_col < 0 or next_col >=N:
                    continue

                #냄새가 있는 경우 아직은 넣지 않는다.
                if smell_graph[next_row][next_col] != None:
                    continue
                
                
                #기존의 방향을 변경해줘야한다.
                current_shark_direction[shark_index-1]=next_direction
                #아직 상어가 없는 경우
                if temp_graph[next_row][next_col]==0:
                    temp_graph[next_row][next_col]=shark_index
                #번호가 작은 상어가 우세를 차지한다.
                else:
                    temp_graph[next_row][next_col]=min(temp_graph[next_row][next_col],shark_index)
                
                checked=True
                break

            #빈칸이 없는 경우에는 자기 냄새가 있는 칸으로 간다.
            if not checked:
                for dir in range(4):
                    next_direction=shark_priorities[shark_index-1][current_shark_direction[shark_index-1]-1][dir]
                    next_row=row+dy[next_direction-1]
                    next_col=col+dx[next_direction-1]     

                    if next_row < 0 or next_row >= N or next_col < 0 or next_col >=N:
                        continue

                    #냄새가 없는 경우 
                    if smell_graph[next_row][next_col] == None:
                        continue
                    
                    index,count=smell_graph[next_row][next_col]
                    
                    #자기 냄새가 인 경우
                    if index == shark_index: 
                        #기존의 방향을 변경해줘야한다.
                        current_shark_direction[shark_index-1]=next_direction
                        temp_graph[next_row][next_col]=shark_index
                        break

    #이동이 완료된 그래프 저장
    graph=temp_graph

def smell_decrease(smell_graph):
    global graph
    for row in range(N):
        for col in range(N):
            if smell_graph[row][col] != None:
                shark_index,count=smell_graph[row][col]

                #냄새가 1인 경우 1 감소하면 0이 되므로 제거한다. 또한 냄새가 사라지면 빈칸이 되므로 이에대한 처리를 수행한다.
                if count ==1:
                    smell_graph[row][col] = None   
                else:
                    smell_graph[row][col]=[shark_index,count-1]  

            if graph[row][col] !=0:
                smell_graph[row][col]=[graph[row][col],K]

def print_board(graph):
    print("GRAPH")
    for row in graph:
        print(row)

def solution():
    #냄새에 대한 그래프 
    smell_graph=[[None] * N for _ in range(N)]

    for i in range(0,1001):
        if not check_if_shark_alive():
            return i

        #냄새에 대해 1씩 감소
        smell_decrease(smell_graph)

        #상어 이동
        shark_move(smell_graph)

    return -1

if __name__ == "__main__":

    #0:위/1:아래/2:왼쪽/3:오른쪽
    dy=[-1,1,0,0]
    dx=[0,0,-1,1]

    N,M,K=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(N)]
    current_shark_direction=list(map(int,input().split()))
    shark_priorities=[[] for _ in range(M)]

    for i in range(M):
        for _ in range(4):
            shark_priorities[i].append(list(map(int,input().split())))
        
    print(solution())

    
```