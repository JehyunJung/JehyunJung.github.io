---
title: "[BOJ] Q23228 주사위 굴리기 2"
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
# [BOJ] Q23228 주사위 굴리기 2
## [Question](https://www.acmicpc.net/problem/23228)
## Language: Python
## Difficulty: Silver 1~ Gold 5 ? 

주사위 굴리기 문제 2번째이다. 주사위의 각 방향에 대한 이동 변화는 [q14499]({% post_url 2022-08-16-implementation14499 %})와 동일한 방식이다.

이번 문제에서 구현해야 되는 부분은 크게 2가지 이다, 그외 나머지 부분에 대해서는 

1. 주사위의 이동

```python
def move(rows,cols,dir):
    #북
    if dir==0:
        rows.append(rows.pop(0))
        cols[1]=rows[1]
    #동
    elif dir==1:
        cols.insert(0,rows.pop())
        rows.append(cols.pop())
        rows[1]=cols[1]
    #남
    elif dir==2:
        rows.insert(0,rows.pop())
        cols[1]=rows[1]
    #서
    elif dir==3:
        cols.append(rows.pop())
        rows.append(cols.pop(0))
        rows[1]=cols[1]
```

2. 점수를 매기기 위한 bfs component 구하기

```python
def bfs(start_row,start_col,number):
    queue=deque([(start_row,start_col)])
    visited=[[False] * M for _ in range(N)]

    count=0

    while queue:
        row,col=queue.popleft()

        if visited[row][col]:
            continue
        visited[row][col]=True
        count+=1
        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]
            #범위를 벗어나는 경우
            if next_row< 0 or next_row >=N or next_col <0 or next_col >=M:
                continue
            #번호가 다른 경우
            if graph[next_row][next_col] != number:
                continue
            queue.append((next_row,next_col))

    return count
```


## Solution

```python
from collections import deque
def bfs(start_row,start_col,number):
    queue=deque([(start_row,start_col)])
    visited=[[False] * M for _ in range(N)]

    count=0

    while queue:
        row,col=queue.popleft()

        if visited[row][col]:
            continue
        visited[row][col]=True
        count+=1
        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if next_row< 0 or next_row >=N or next_col <0 or next_col >=M:
                continue
            if graph[next_row][next_col] != number:
                continue
            queue.append((next_row,next_col))

    return count
def move(rows,cols,dir):
    #북
    if dir==0:
        rows.append(rows.pop(0))
        cols[1]=rows[1]
    #동
    elif dir==1:
        cols.insert(0,rows.pop())
        rows.append(cols.pop())
        rows[1]=cols[1]
    #남
    elif dir==2:
        rows.insert(0,rows.pop())
        cols[1]=rows[1]
    #서
    elif dir==3:
        cols.append(rows.pop())
        rows.append(cols.pop(0))
        rows[1]=cols[1]
    
    

def solution():
    dir=1
    #주사위 정보
    rows=[2,1,5,6]
    cols=[4,1,3]
    #점수
    result=0
    #주사위의 현재위치
    row,col=0,0

    inverse_dir=[2,3,0,1]
    for _ in range(K):
        next_row=row+dy[dir]
        next_col=col+dx[dir]

        #칸이 없는 경우 이동방향을 반대로 해서 다시 이동한다.
        if next_row < 0 or next_row >=N or next_col < 0 or next_col >=M:
            dir=inverse_dir[dir]
            next_row=row+dy[dir]
            next_col=col+dx[dir]
        
        #주사위 이동 수행
        move(rows,cols,dir)
        #주사위 바닥
        bottom_number=rows[3]
        #바닥면의 번호
        graph_number=graph[next_row][next_col]
        #bfs component을 통해 번호에 해당한 점수 구하기
        result+=(graph_number*bfs(next_row,next_col,graph_number))
        row,col=next_row,next_col
        
        #주사위 바닥에 있는 번호와 바닥면의 번호를 비교한다.
        if bottom_number > graph_number:
            dir=(dir+1)%4
        elif bottom_number < graph_number:
            if dir==0:
                dir=4
            dir-=1
        else:
            continue
    
    return result

if __name__ == "__main__":
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    N,M,K=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(N)]
    
    print(solution())
```