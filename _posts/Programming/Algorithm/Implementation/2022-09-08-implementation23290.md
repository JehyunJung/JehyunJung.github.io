---
title: "[BOJ] Q23290 마법사 상어와 복제"
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
# [BOJ] Q23290 마법사 상어와 복제
## [Question](https://www.acmicpc.net/problem/23290)
## Language: Python
## Difficulty: Gold1

해당 문제의 시뮬레이션 과정은 아래의 5가지이다.

1. 물고기 이동
 
물고기는 원래 자기 방향으로 이동할 수 있는데, 이때 격자를 벗어나거나, 냄새가 있거나, 상어가 있는 경우 45도씩 반시계 방향 회전을 수행해야한다.
[q19237]({% post_url 2022-09-02-implementation19237%})와 유사한 방향 움직임을 가진다.

```python
flag=False
for i in range(8):
    next_fish_dir=(fish_dir-i)%8

    next_row=row+fish_dy[next_fish_dir]
    next_col=col+fish_dx[next_fish_dir]
    #격자 내부, 냄새가 없는 칸, 상어가 없는 칸을 찾은 경우 해당 자리에 물고기를 이동시킨다.
    if 0<=next_row<4 and 0<=next_col<4:
        if smell_graph[next_row][next_col]==0 and not(next_row == shark_row and next_col == shark_col):    
            flag=True
            temp_graph[next_row][next_col].append(next_fish_dir)
            break
#8번의 회전을 수행해도 자리가 없는 경우 원래 자리 유지
if not flag:
    temp_graph[row][col].append(fish_dir)
```

2. 상어의 이동
상어의 경우 연속적으로 3번의 이동을 수행하는 데, 이때 이동하는 경로 내에 물고기를 먹게 된다. 그러한 경로 중에서 물고기를 가장 먹는 경로를 선택한다. 만약 그런 경로가 다수인 경우 상,좌,하,우 에 따른 사전순으로 가장 빠른 경로 조합을 선택한다. --> 문제의 조건 참조

여러 경로가 발생할 수 있기 때문에 해당 부분은 dfs을 이용해서 최적의 경로를 찾아야한다.

> 최적의 경로 찾기

```python
if cnt==3:
    if count > max_count:
        max_count=count
        selected_path=deepcopy(path)
    return

for i in range(4):
    next_row=row+dy[i]
    next_col=col+dx[i]
    if next_row < 0 or next_row>=4 or next_col < 0 or next_col >=4:
        continue
    #이미 방문한 노드이면 먹이를 먹지 않는다.
    if visited[next_row][next_col]:
        dfs(cnt+1,count,next_row,next_col,path+[i])
    else:
        #방문하는 노드의 경우 해당 자리에 있는 먹이를 먹는다.
        visited[next_row][next_col]=True
        dfs(cnt+1,count+len(graph[next_row][next_col]),next_row,next_col,path+[i])
        visited[next_row][next_col]=False
```

경로를 찾은 이후에는 경로를 따라가면서 상어를 이동시키고 그 자리에 물고기가 있었다면 냄새를 추가한다.

```python
for dir in selected_path:
    shark_row+=dy[dir]
    shark_col+=dx[dir]
    #원래 먹이가 없는 자리였으면 넘어간다.
    if len(graph[shark_row][shark_col])==0:
        continue
    graph[shark_row][shark_col]=[]
    smell_graph[shark_row][shark_col]=3
```

3. 냄새양 감소

이 부분은 냄새 그래프의 양수의 값을 1씩 감소 시키면 된다.
```python
for row in range(4):
    for col in range(4):
        if smell_graph[row][col] ==0:
            continue
        smell_graph[row][col]-=1
```

4. 물고기 복제

1~3의 연산을 수행하기 이전에 물고기 그래프를 따로 저장해놓은 다음, 맨 마지막에 저장해둔 그래프를 물고기 그래프에 추가해주면 된다.

```python
#복제할 물고기 목록을 뽑아낸다.
fishes=deepcopy(graph)
#물고기의 이동
fish_move()

#상어의 먹이활동 + 냄새
shark_eat()

#냄새 1씩 감소
decrease_smell()

#물고기 복제
for row in range(4):
    for col in range(4):
        graph[row][col].extend(fishes[row][col])
```


## Solution

```python
from copy import deepcopy

def decrease_smell():
    global smell_graph
    for row in range(4):
        for col in range(4):
            if smell_graph[row][col] ==0:
                continue
            smell_graph[row][col]-=1

def fish_move():
    global graph
    temp_graph=[[[] for _ in range(4)] for _ in range(4)]

    for row in range(4):
        for col in range(4):
            if len(graph[row][col])==0:
                continue

            for fish_dir in graph[row][col]:
                flag=False
                for i in range(8):
                    next_fish_dir=(fish_dir-i)%8

                    next_row=row+fish_dy[next_fish_dir]
                    next_col=col+fish_dx[next_fish_dir]

                    if 0<=next_row<4 and 0<=next_col<4:
                        if smell_graph[next_row][next_col]==0 and not(next_row == shark_row and next_col == shark_col):    
                            flag=True
                            temp_graph[next_row][next_col].append(next_fish_dir)
                            break
                
                if not flag:
                    temp_graph[row][col].append(fish_dir)
    
    graph=temp_graph

def dfs(cnt,count,row,col,path):
    global max_count,selected_path
    if cnt==3:
        if count > max_count:
            max_count=count
            selected_path=deepcopy(path)
        return

    for i in range(4):
        next_row=row+dy[i]
        next_col=col+dx[i]
        if next_row < 0 or next_row>=4 or next_col < 0 or next_col >=4:
            continue
        #이미 방문한 노드이면 먹이를 먹지 않는다.
        if visited[next_row][next_col]:
            dfs(cnt+1,count,next_row,next_col,path+[i])
        else:
            #방문하는 노드의 경우 해당 자리에 있는 먹이를 먹는다.
            visited[next_row][next_col]=True
            dfs(cnt+1,count+len(graph[next_row][next_col]),next_row,next_col,path+[i])
            visited[next_row][next_col]=False


def shark_eat():
    global max_count,shark_row,shark_col,graph,smell_graph
    max_count=-1

    dfs(0,0,shark_row,shark_col,[])

    #상어는 이동하면서 물고기를 먹고 해당 자리에는 냄새가 들어가게 된다.
    for dir in selected_path:
        shark_row+=dy[dir]
        shark_col+=dx[dir]
        #원래 먹이가 없는 자리였으면 넘어간다.
        if len(graph[shark_row][shark_col])==0:
            continue
        graph[shark_row][shark_col]=[]
        smell_graph[shark_row][shark_col]=3


def solution():

    for _ in range(S):
        #복제할 물고기 목록을 뽑아낸다.
        fishes=deepcopy(graph)
        #물고기의 이동
        fish_move()

        #상어의 먹이활동 + 냄새
        shark_eat()

        #냄새 1씩 감소
        decrease_smell()
        
        #물고기 복제
        for row in range(4):
            for col in range(4):
                graph[row][col].extend(fishes[row][col])


    count=0
    for row in range(4):
        for col in range(4):
            #냄새
            count+=len(graph[row][col])

    return count   

if __name__ == "__main__":
    M,S=0,0
    fishes=[]
    shark_row,shark_col=0,0

    fish_dy=[0,-1,-1,-1,0,1,1,1]
    fish_dx=[-1,-1,0,1,1,1,0,-1]
    dy=[-1,0,1,0]
    dx=[0,-1,0,1]
    max_count=[]
    selected_path=[]
    graph=[[[] for _ in range(4)] for _ in range(4)]
    smell_graph=[[0]*4 for _ in range(4)]
    visited=[[False]*4 for _ in range(4)]
    M,S=map(int,input().split())
    for _ in range(M):
        row,col,dir=map(int,input().split())
        graph[row-1][col-1].append(dir-1)

    shark_row,shark_col=map(int,input().split())
    shark_row-=1
    shark_col-=1

    print(solution())
```