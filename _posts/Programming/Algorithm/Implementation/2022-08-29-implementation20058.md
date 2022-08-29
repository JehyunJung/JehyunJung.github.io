---
title: "[BOJ] Q20057 마법사 상어와 파이어스톰"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
  - bfs
---
# [BOJ] Q20058 마법사 상어와 파이어스톰
## [Question](https://www.acmicpc.net/problem/20058)
## Language: Python
## Difficulty: Gold 3~4(예상)

해당 문제의 시뮬레이션에서는 아래의 과정이 연속적으로 이루어진다.

1. 부분 구역에 대한 시계 방향 회전
2. 인접한 칸에 대한 검증 및 얼음 녹이기 
3. 모든 반복을 수행한 이후에 가장 큰 얼음 덩어리 찾기

> 부분 구역에 대한 시계 방향 회전

각각의 부분 구역으로 분할하는 것이 중요하다. 

2<sup>n</sup>의 큰 보드를 2<sup>l</sup>개로 나눠서 생각해야한다. 이때, 길이가 2<sup>l</sup>인 부분구역이 각각 행/열에 대해서, 2<sup>n-l</sup> 만큼씩 있는 것이므로, 이를 잘게 분해해서 생각해보면 된다.

시계 방향에 대한 회전 함수는 아래와 같이 행/열 관계를 생각해보면 쉽게 식을 유추 할 수 있다.

```
sub_graph[dx][length-dy-1]=graph[start_row+dy][start_col+dx]
```

각각의 부분 구역에 대해 시계방향 회전을 수행한 후, 기존 배열에 다시 저장해주면 된다.

> 인접한 칸에 대한 검증 및 얼음 녹이기 

특정 칸에 대해서, 인접한 칸을 검사해서, 얼음이 있는 칸이 3개이상이 있는 경우에는 그대로 놔두게 되지만 3개 미만인 경우에는 해당 칸의 얼음의 양을 1 감소시킨다.

```python
for dir in range(4):
    next_row=row+dy[dir]
    next_col=col+dx[dir]
    #범위를 벗어나는 경우
    if next_row < 0 or next_row >= 2**N or next_col < 0 or next_col >= 2**N:
        continue
    #얼음이 없는 칸
    if graph[next_row][next_col] ==0:
        continue
    count+=1

if count >=3:
    return True
else:
    return False
```

> 모든 과정이 끝난 이후, 가장 얼음 덩어리를 찾는다.

문제에 주어진 조건에 따르면, 덩어리는 인접한 칸들이 모여서 이루어진다. 따라서, bfs을 이용해서 component을 찾는 방향으로 접근한다.


## Solution

```python
from collections import deque

def rotation(L):
    global graph
    length=2**L
    iteration=2**(N-L)

    for row_index in range(iteration):
        for col_index in range(iteration):
            start_row=row_index*length
            start_col=col_index*length
            
            #회전을 진행한 이후의 부분 배열
            sub_graph=[[0] * length for _ in range(length)]
            for dy in range(length):
                for dx in range(length):
                    sub_graph[dx][length-dy-1]=graph[start_row+dy][start_col+dx]
            
            #생성된 부분 배열을 기존 배열에 배치
            for dy in range(length):
                for dx in range(length):
                    graph[start_row+dy][start_col+dx]=sub_graph[dy][dx]
                    
def bfs(visited,start_row,start_col):
    queue=deque([(start_row,start_col)])

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    components=[]

    while queue:
        row,col=queue.popleft()

        if visited[row][col]:
            continue
        visited[row][col]=True
        components.append((row,col))
        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if next_row < 0 or next_row >=2**N or next_col < 0 or next_col >= 2**N:
                continue
        
            if graph[next_row][next_col] ==0:
                continue

            queue.append((next_row,next_col))

    
    return components

def check_if_adjacent(row,col):
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    count=0

    for dir in range(4):
        next_row=row+dy[dir]
        next_col=col+dx[dir]

        if next_row < 0 or next_row >= 2**N or next_col < 0 or next_col >= 2**N:
            continue

        if graph[next_row][next_col] ==0:
            continue
        count+=1
    
    if count >=3:
        return True
    else:
        return False

def solution():
    for L in magics:
        if L!=0:
            rotation(L)
        decreasing_targets=[]
        for row in range(2**N):
            for col in range(2**N):
                if graph[row][col] ==0:
                    continue

                if not check_if_adjacent(row,col):
                    decreasing_targets.append((row,col))
        
        for row,col in decreasing_targets:
            graph[row][col]-=1

    visited=[[False] * (2**N) for _ in range(2**N)]
    max_size=0
    sum_size=0
    for row in range(2**N):
        for col in range(2**N):
            sum_size+=graph[row][col]
            if graph[row][col] ==0 or visited[row][col]:
                continue

            max_size=max(max_size,len(bfs(visited,row,col)))
    
    print(sum_size)
    print(max_size)
if __name__ == "__main__":
    N,Q=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(2**N)]
    magics=list(map(int,input().split()))
    
    solution()
```