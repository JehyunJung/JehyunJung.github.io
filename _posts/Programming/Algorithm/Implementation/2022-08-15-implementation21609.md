---
title: "[BOJ] Q21609 상어중학교"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q21609 상어중학교
## [Question](https://www.acmicpc.net/problem/21609)
## Language: Python
## Difficulty: Gold 3

시뮬레이션 유형의 문제로 주어진 조건들을 **정확하게 파악해서** 구현하는 것이 중요하다.

해당 문제에서 구현해야되는 함수는 아래와 같다.

1. 블록 그룹을 구하는 함수
2. 해당 블록 그룹을 제거하는 함수
3. 회전을 수행하는 함수
4. 중력 작용을 수행하는 함수

먼저, 블록 그룹을 구하는 함수이다.
같은 색깔을 가지는 블록에 대해서 블록그룹을 형성한다. 따라서, 이는 BFS을 통한 component 찾는 방식을 활용하면 된다.

```python
def find_blockgroups():
    block_groups=[]
    visited=[[False]*num for _ in range(num)]
    for start_row in range(num):
        for start_col in range(num):
            if graph[start_row][start_col] < 1 or visited[start_row][start_col]:
                continue
            queue=deque([(start_row,start_col)])
            color=graph[start_row][start_col]
            rainbow_blocks=[]
            normal_blocks=[]

            while queue:
                row,col=queue.popleft()
                #이미 방문한 노드 이면 검사 생략
                if visited[row][col]:
                    continue
                #무지개 색, 일반 블록을 구분해서 저장
                if graph[row][col]==0:
                    rainbow_blocks.append((row,col))
                else:
                    normal_blocks.append((row,col))

                visited[row][col]=True

                for dir in range(4):
                    next_row=row+dy[dir]
                    next_col=col+dx[dir]

                    if next_row < 0 or next_row >=num or next_col < 0 or next_col>=num:
                        continue
                    #색깔이 같지 않은 블록 중에서
                    if graph[next_row][next_col] != color:
                        #검정색이 블록이거나, 무지개 블록이 아닌 경우 포함하지 않는다.
                        if graph[next_row][next_col] == -1 or graph[next_row][next_col] != 0:
                            continue

                    queue.append((next_row,next_col))
            #무지색 블록에 대해서는 방문 표시 제거
            for row,col in rainbow_blocks:
                visited[row][col]=False
            components=normal_blocks+rainbow_blocks
            if len(components) < 2:
                continue

            normal_blocks.sort(key=lambda x: (x[0],x[1]))

            #크기, 무지개 수, 기준 블록, 블록그룹
            block_groups.append((len(components),len(rainbow_blocks),normal_blocks[0][0],normal_blocks[0][1],components))
            
    return block_groups

```
무지개색 블록의 경우 여러 그룹에서 혼용해서 사용할 수 있으므로, 한 번 그룹을 찾고 나면 방문 표시를 제거해야한다.

```python
for row,col in rainbow_blocks:
    visited[row][col]=False
```

해당 블록 그룹의 기준 블록을 찾기 위해, 일반 블록을 따로 구분해서 저장하였고, 이 중에서 가장 행/열 값이 작은 블록을 기준 블록으로 설정한다.

```python
normal_blocks.sort(key=lambda x: (x[0],x[1]))
```

2. 블록 그룹을 제거하는 함수

```python
def remove_elements(component):
    #-2를 빈칸으로 표현
    for row, col in component:
        graph[row][col]=-2
```

3. 중력을 적용하는 함수

```python
def activate_gravity():
    for row in range(num-2,-1,-1):
        for col in range(num):
            if graph[row][col]==-1:
                continue

            temp_row=row +1
            target_row=row

            while temp_row < num:
                if graph[temp_row][col] !=-2:
                    break
                target_row=temp_row
                temp_row+=1

            graph[row][col],graph[target_row][col]=graph[target_row][col],graph[row][col]
```
경계 혹은 다른 블록을 만나기 전까지 아래로 내린다.

4. 회전을 수행하는 함수

반시계회전을 수행하기 위한 함수이다.

```python

def rotate_counterclockwise():
    global graph
    temp=[[0] *num for _ in range(num)]

    for i in range(num):
        for j in range(num):
            temp[num-j-1][i]=graph[i][j]

    graph=temp
```


## Solution

```python
from collections import deque

def rotate_counterclockwise():
    global graph
    temp=[[0] *num for _ in range(num)]

    for i in range(num):
        for j in range(num):
            temp[num-j-1][i]=graph[i][j]

    graph=temp

def remove_elements(component):
    #-2를 빈칸으로 표현
    for row, col in component:
        graph[row][col]=-2

def activate_gravity():
    for row in range(num-2,-1,-1):
        for col in range(num):
            if graph[row][col]==-1:
                continue

            temp_row=row +1
            target_row=row

            while temp_row < num:
                if graph[temp_row][col] !=-2:
                    break
                target_row=temp_row
                temp_row+=1

            graph[row][col],graph[target_row][col]=graph[target_row][col],graph[row][col]

def find_blockgroups():
    block_groups=[]
    visited=[[False]*num for _ in range(num)]
    for start_row in range(num):
        for start_col in range(num):
            if graph[start_row][start_col] < 1 or visited[start_row][start_col]:
                continue
            queue=deque([(start_row,start_col)])
            color=graph[start_row][start_col]
            rainbow_blocks=[]
            normal_blocks=[]

            while queue:
                row,col=queue.popleft()

                if visited[row][col]:
                    continue

                if graph[row][col]==0:
                    rainbow_blocks.append((row,col))
                else:
                    normal_blocks.append((row,col))

                visited[row][col]=True

                for dir in range(4):
                    next_row=row+dy[dir]
                    next_col=col+dx[dir]

                    if next_row < 0 or next_row >=num or next_col < 0 or next_col>=num:
                        continue
                    #색깔이 같지 않은 블록 중에서
                    if graph[next_row][next_col] != color:
                        #검정색이 블록이거나, 무지개 블록이 아닌 경우 포함하지 않는다.
                        if graph[next_row][next_col] == -1 or graph[next_row][next_col] != 0:
                            continue

                    queue.append((next_row,next_col))

            for row,col in rainbow_blocks:
                visited[row][col]=False
            components=normal_blocks+rainbow_blocks
            if len(components) < 2:
                continue

            normal_blocks.sort(key=lambda x: (x[0],x[1]))

            #크기, 무지개 수, 기준 블록, 블록그룹
            block_groups.append((len(components),len(rainbow_blocks),normal_blocks[0][0],normal_blocks[0][1],components))
            
    return block_groups

def solution():
    count=0
    while True:
        #블록 그룹 찾기
        block_groups=find_blockgroups()
        
        if len(block_groups) ==0 :
            break
        #블록 그룹 중에서 가장 큰 블록 그룹 , 무지개 수가 가장 많은 그룹, 기준 블록의 행/열이 가장 큰 블록 그룹
        block_groups.sort(key=lambda x: (-x[0],-x[1],-x[2],-x[3]))
        target_component=block_groups[0][4]
        count+= (len(target_component) ** 2)
        #해당 블록 그룹에 해당하는 블록 제거
        remove_elements(target_component)
        #중력 작용
        activate_gravity()
        #반시계 회전
        rotate_counterclockwise()
        #중력 작용
        activate_gravity()

    return count   
if __name__ == "__main__":
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    num,colors=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(num)]

    print(solution())
```
