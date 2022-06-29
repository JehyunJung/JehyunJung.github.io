---
title: "[BOJ] Q13460 구슬 탈출 2"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - bfs
---
# [BOJ] Q13460 구슬 탈출 2
## [Question](https://www.acmicpc.net/problem/13460)
## Language: Python
## Difficulty: Gold 1

빨간 구슬만 구멍으로 나올 수 있게끔, 경로를 탐색해서 최소 이동 회수를 구해야하는 문제이다.

1. 지나온 지점
모든 빨간 구슬의 좌표, 파란 구슬의 좌표에 대해 경로 순회를 하면서 해당 좌표를 지나왔는지 여부를 저장하기 위해 아래와 같은 4차원 배열을 이용해서 저장한다.

```python
visited=[[[[False]*width for _ in range(height)]for _ in range(width)]for _ in range(height)]
```

2. 이동하는 함수

```python
def move(row,col,dy,dx):
    cnt=0
    while graph[row+dy][col+dx] != "#" and graph[row][col] != "O":
        row+=dy
        col+=dx
        cnt+=1
    return row,col,cnt
```

```python
if new_ry==new_by and new_rx==new_bx:
    if r_cnt > b_cnt:
        new_ry -=dy[dir]
        new_rx -=dx[dir]
    else:
        new_by -=dy[dir]
        new_bx -=dx[dir]
```

벽을 만나거나 구멍을 만나기 전까지 이동하며, 이동거리또한 구해놓는다. 이동거리를 이용해서 빨간 구슬과 파란 구슬이 함께 이동했을 때, 겹치게 되는 경우 이동거리가 긴 구슬이 뒤에 있었으므로 한칸 뒤로 이동시켜주면 된다.

3. bfs를 이용해서 경로 순회를 진행한다.

```python
while queue:
    ry,rx,by,bx,depth=queue.popleft()
    print(ry,rx,by,bx)
    if depth >10:
        continue

    for dir in range(4):
        new_ry,new_rx,r_cnt=move(ry,rx,dy[dir],dx[dir])
        new_by,new_bx,b_cnt=move(by,bx,dy[dir],dx[dir])
        print("new: ",new_ry,new_rx,new_by,new_bx)
```

bfs를 이용해서 각 좌표에 대해 4방향을 조사하면서 순회를 실시한다.

4. 성공/실패 조건

```python
if graph[new_by][new_bx]!="O":
    if graph[new_ry][new_rx]=="O":
        print(depth)
        return
```
파란 구슬이 구멍에 들어가지 않고, 빨간 구슬만 구멍에 들어가게 될때 성공적으로 마치게 된다.

## Solution

```python
from collections import deque
def move(row,col,dy,dx):
    cnt=0
    while graph[row+dy][col+dx] != "#" and graph[row][col] != "O":
        row+=dy
        col+=dx
        cnt+=1
    return row,col,cnt

def solution():
    ry,rx,by,bx=0,0,0,0
    visited=[[[[False]*width for _ in range(height)]for _ in range(width)]for _ in range(height)]
    
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    queue=deque()

    for i in range(height):
        for j in range(width):
            if graph[i][j]=="B":
                by,bx=i,j
            if graph[i][j]=="R":
                ry,rx=i,j
    queue.append((ry,rx,by,bx,1))
    visited[ry][rx][by][bx]=True

    while queue:
        ry,rx,by,bx,depth=queue.popleft()
        if depth >10:
            continue

        for dir in range(4):
            new_ry,new_rx,r_cnt=move(ry,rx,dy[dir],dx[dir])
            new_by,new_bx,b_cnt=move(by,bx,dy[dir],dx[dir])
            if graph[new_by][new_bx]!="O":
                if graph[new_ry][new_rx]=="O":
                    print(depth)
                    return
                if new_ry==new_by and new_rx==new_bx:
                    if r_cnt > b_cnt:
                        new_ry -=dy[dir]
                        new_rx -=dx[dir]
                    else:
                        new_by -=dy[dir]
                        new_bx -=dx[dir]
            
                if not visited[new_ry][new_rx][new_by][new_bx]:
                    visited[new_ry][new_rx][new_by][new_bx]=True
                    queue.append((new_ry,new_rx,new_by,new_bx,depth+1))
    print(-1)

   
if __name__ == "__main__":
    height,width=map(int,input().split())
    graph=[list(input().strip()) for _ in range(height)]
    solution()
```
