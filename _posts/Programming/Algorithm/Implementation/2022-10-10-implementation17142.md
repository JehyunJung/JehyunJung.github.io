---
title: "[BOJ] Q17142 연구소 3"
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
# [BOJ] Q17142 연구소 3
## [Question](https://www.acmicpc.net/problem/17142)
## Language: Python
## Difficulty: Gold 4

주어진 그래프에는 비활성화되어 있는 바이러스가 있는데, 이 중에서 m개를 선택해 이를 활성화 시키고, 활성화된 바이러스는 상하좌우로 퍼지게 되는데, 이때 모든 빈칸에 바이러스가 퍼질때까지 걸리는 시간을 체크해야한다.

이 문제는 m개의 바이러스를 선택해서 모든 빈칸에 바이러스를 퍼뜨리는 데 걸리는 최소시간을 구하는 bruteforce 유형의 문제이다.

> 주의점

비활성되어 있는 바이러스 칸에 퍼지는 경우에 대해서는 시간을 체크해서는 안된다. 이미 해당 칸에는 바이러스가 있기 때문이다.

```python
#이미 바이러스가 있는 칸인 경우 활성화만 시켜주면 되므로 시간이 증가하지 않는다.
if time+1 < visited[next_row][next_col]:
    #비활성화 상태의 바이러스가 있는 칸에 퍼지는 경우 시간은 체크하지 않는다.
    if board[next_row][next_col]!=2:
        max_time=max(max_time,time+1)
    visited[next_row][next_col]=time+1
    queue.append((next_row,next_col,time+1)) 
```

## Solution 

```python
from collections import deque
from math import inf

def bfs(activated_viruses):

    visited=[[inf] * n for _ in range(n)]
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    queue=deque()
    for row,col in activated_viruses:
        queue.append((row,col,0))
        visited[row][col]=0
    max_time=0
    while queue:
        row,col,time=queue.popleft()
        if visited[row][col] < time:
            continue
        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if next_row < 0 or next_row >=n or next_col < 0 or next_col >=n:
                continue
            #벽인 경우 퍼지지 못한다.
            if board[next_row][next_col]==1:
                continue
            
            #이미 바이러스가 있는 칸인 경우 활성화만 시켜주면 되므로 시간이 증가하지 않는다.
            if time+1 < visited[next_row][next_col]:
                #비활성화 상태의 바이러스가 있는 칸에 퍼지는 경우 시간은 체크하지 않는다.
                if board[next_row][next_col]!=2:
                    max_time=max(max_time,time+1)
                visited[next_row][next_col]=time+1
                queue.append((next_row,next_col,time+1))
            
                    

    #모든 칸이 바이러스로 덮였는 지 확인한다.
    for row in range(n):
        for col in range(n):
            #빈칸인데, 바이러스가 없는 경우
            if board[row][col]==0 and visited[row][col]==inf:
                    return inf
    return max_time
    
    
def solution(start_index,count,activated_viruses):
    global min_time,visited
    #활성화된 바이러스 m개를 선택완료한 경우
    if count==m:
        min_time=min(min_time,bfs(activated_viruses))
        return

    for i in range(start_index,n_viruses):
        solution(i+1,count+1,activated_viruses+[viruses[i]])
    
def solution(start_index,count,activated_viruses):
    global min_time,visited
    #활성화된 바이러스 m개를 선택완료한 경우
    if count==m:
        min_time=min(min_time,bfs(activated_viruses))
        return

    for i in range(start_index,n_viruses):
        solution(i+1,count+1,activated_viruses+[viruses[i]])

if __name__ == "__main__":
    #predefined globals
    n,m=map(int,input().split())
    viruses=[]
    board=[]
    for i in range(n):
        row=list(map(int,input().split()))
        board.append(row)
        #바이러스 리스트 초기화
        for j in range(n):
            if row[j]==2:
                viruses.append((i,j))

    
    min_time=inf
    n_viruses=len(viruses)
    visited=[]
    solution(0,0,[])
    
    if min_time==inf:
        print(-1)
    else:
        print(min_time)
```