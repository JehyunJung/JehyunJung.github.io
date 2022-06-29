---
title: "[BOJ] Q14503 로봇 청소기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - bfs
---
# [BOJ] Q14503 로봇 청소기
## [Question](https://www.acmicpc.net/problem/14503)
## Language: Python
## Difficulty: Gold 5

로봇 청소기의 이동 방식을 구현하는 시뮬레이션 문제이다.

이동 방식을 정확히 파악해서 그래도 구현하는 것이 중요하다.

1. 빈 칸이면 청소를 진행

만약, 벽이거나, 빈 칸이 아니면 넘어간다.
```python
if visited[next_row][next_col]:
    continue
if graph[next_row][next_col] == 1:
    continue

row=next_row
col=next_col

visited[row][col]=True
vacuum_count+=1
checked=True
```

2. 바라보는 방향을 기준으로 왼쪽에 빈칸이 있으면 왼쪽으로 회전하고 전진, 빈칸이 없으면 다시 바라보는 방향을 기준으로 왼쪽 검사
여기서, 방향을 변수로 잡아서 기억하고 있어야함을 알려준다.

```python
def get_nextdir(dir):
    dir-=1
    if dir == -1:
        return 3
        
    return dir

direction=get_nextdir(direction)

next_row=row+dy[direction]
next_col=col+dx[direction]
```

3. 청소를 하지 않고, 연속으로 4번 회전하는 경우 후진한다. (단, 뒤에 벽이 있으면 움직임을 멈춘다.)
```python
if not checked:
    next_row=row-dy[direction]
    next_col=col-dx[direction]
    if graph[next_row][next_col] != 1:
        row=next_row
        col=next_col
        continue
    else:
        break
```



## Solution

```python
def get_nextdir(dir):
    dir-=1
    if dir == -1:
        return 3
        
    return dir

def solution():
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    visited=[[False]*width for _ in range(height)]

    vacuum_count=1
    row,col,direction=start_row,start_col,start_direction
    visited[row][col]=True

    while True:
        checked=False
        for i in range(4):
            direction=get_nextdir(direction)

            next_row=row+dy[direction]
            next_col=col+dx[direction]

            if visited[next_row][next_col]:
                continue
            if graph[next_row][next_col] == 1:
                continue

            row=next_row
            col=next_col
            
            visited[row][col]=True
            vacuum_count+=1
            checked=True
            break

        if not checked:
            next_row=row-dy[direction]
            next_col=col-dx[direction]
            if graph[next_row][next_col] != 1:
                row=next_row
                col=next_col
                continue
            else:
                break

    print(vacuum_count)



if __name__ == "__main__":
    height,width=map(int,input().split())
    start_row, start_col,start_direction=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(height)]
    
    solution()
```
