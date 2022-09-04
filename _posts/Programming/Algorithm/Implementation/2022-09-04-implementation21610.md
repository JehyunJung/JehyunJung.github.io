---
title: "[BOJ] Q21610 마법사와 비바라기"
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
# [BOJ] Q21610 마법사와 비바라기
## [Question](https://www.acmicpc.net/problem/21610)
## Language: Python
## Difficulty: Gold 5

이번 문제에서 구현해야되는 시뮬레이션은 크게 5가지이다
1. 구름의 이동
2. 구름이 이동한 칸에 대해 물의 양 1증가
3. 물이 증가한 칸(즉 구름이 있는 칸)에 대해 대각선에 물이 있는 칸의 개수 만큼 증가
4. 기존의 구름이 아닌 칸 중에 물의 양이 2이상인 칸에 새로운 구름 추가

## Solution

```python
#구름의 이동 
def move_clouds(clouds,dir,speed):
    visited=[[False] * N for _ in range(N)]
    for i in range(len(clouds)):
        cloud_row=clouds[i][0]
        cloud_col=clouds[i][1]

        cloud_row = (cloud_row+ dy[dir-1]*speed)%N
        cloud_col = (cloud_col+ dx[dir-1]*speed)%N
        visited[cloud_row][cloud_col]=True
        clouds[i]=[cloud_row,cloud_col]
    return visited
#구름이 있는 칸에 대해 물의 양 증가
def increase_water(clouds):
    for row ,col in clouds:
        graph[row][col]+=1
#구름이 있는 칸에 대해, 대각선 반경에 물이 있는 칸 만큼 해당 칸 증가
def copy_water(clouds):
    for row,col in clouds:
        count=0
        for dir in range(1,8,2):
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            if next_row < 0 or next_row >= N or next_col < 0 or next_col>=N:
                continue

            if graph[next_row][next_col]!=0:
                count+=1
        
        graph[row][col]+=count
#물의 양이 2이상 되는 칸 중에서, 현재 구름이 있는 칸들로 새로운 구름 생성
def new_clouds(clouds,visited):
    new_clouds=[]
    for row in range(N):
        for col in range(N):
            if graph[row][col] < 2:
                continue

            if not visited[row][col]:
                graph[row][col]-=2
                new_clouds.append((row,col))
    return new_clouds

def solution():
    clouds=[[N-1,0],[N-1,1],[N-2,0],[N-2,1]]

    for dir,speed in moves:
        visited=move_clouds(clouds,dir,speed)
        increase_water(clouds)
        copy_water(clouds)
        clouds=new_clouds(clouds,visited)

    count=0
    for row in graph:
        count+=sum(row)
    
    return count

if __name__ == "__main__":
    dy=[0,-1,-1,-1,0,1,1,1]
    dx=[-1,-1,0,1,1,1,0,-1]

    N,M=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(N)]
    moves=[map(int,input().split()) for _ in range(M)]
    
    print(solution())
```