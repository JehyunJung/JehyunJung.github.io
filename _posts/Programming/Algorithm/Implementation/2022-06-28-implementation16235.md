---
title: "[BOJ] Q16235 나무 재테크"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
---
# [BOJ] Q16235 나무 재테크
## [Question](https://www.acmicpc.net/problem/16235)
## Language: Python
## Difficulty: Gold 3


해당 문제는 주어진 조건에 따라 시뮬레이션을 수행하면 된다. 각각의 조건들을 정확히 파악하고 그대로 구현하는 것이 중요하다.

>Spring

```python
dead_map=[[0]*N for _ in range(N)]
# 봄
for i in range(N):
    for j in range(N):
        #해당 좌표에 나무가 있으면 수행한다.
        if graph[i][j]!=0:
            trees=graph[i][j]
            #나무의 나이가 적은 순서대로 탐색을 수행
            trees.sort()
            #살아있는 나무 목록
            temp=[]
            #죽어있는 나무 목록
            dead_map[i][j]=[]
            while trees:
                tree=trees.pop(0)
                #만약 양분이 충분하면 나무의 나이를 1 늘리고
                if tree <= nutrition_level[i][j]:
                    temp.append(tree+1)
                    nutrition_level[i][j]-=tree
                #그렇지 않은 경우 죽은 나무에 올린다.
                else:
                    dead_map[i][j].append(tree//2)
            graph[i][j]=temp
```

> Summer

```python
#여름
for i in range(N):
    for j in range(N):
        if dead_map[i][j] !=0:
            nutrition_level[i][j]+=sum(dead_map[i][j])
```
각각의 죽은 나무에 대해서 나이의 반값을 양분으로 추가한다. (봄에서 죽은 나무 목록을 구할때 미리 반값으로 저장했으므로 간편하게 합을 구할 수 있다.)

> Autumn

```python
new_growings=[]
        for i in range(N):
            for j in range(N):
                if graph[i][j]!=0:
                    trees=graph[i][j]
                    # 살아있는 나무에 대해서
                    for tree in trees:
                        #나무의 나이가 5의 배수 인경우
                        if tree % 5 !=0:
                            continue
                        #각각의 8방향에 대해 나무를 추가로 심는다.
                        for dir in range(8):
                            new_row=i+dy[dir]
                            new_col=j+dx[dir]

                            if new_row < 0 or new_row >=N or new_col < 0 or new_col >=N:
                                continue
                            new_growings.append((new_row,new_col))
        #새로 심어질 나무를 추가한다.
        for row,col in new_growings:
            if graph[row][col]==0:
                graph[row][col]=[]
            graph[row][col].append(1)
```

>Winter

```java
for i in range(N):
    for j in range(N):
        nutrition_level[i][j]+=adding_nutrition_level[i][j]
```
각 칸별로 양분을 추가한다.

이렇게 봄,여름,가을,겨울을 k번 반복후 남아있는 나무 수를 구한다.


## Solution

```python
def solution():
    global nutrition_level,graph
    dy=[-1,-1,-1,0,1,1,1,0]
    dx=[-1,0,1,1,1,0,-1,-1]
    for _ in range(K):
        dead_map=[[0]*N for _ in range(N)]
        # 봄
        for i in range(N):
            for j in range(N):
                if graph[i][j]!=0:
                    trees=graph[i][j]
                    trees.sort()
                    temp=[]
                    dead_map[i][j]=[]
                    while trees:
                        tree=trees.pop(0)
                        if tree <= nutrition_level[i][j]:
                            temp.append(tree+1)
                            nutrition_level[i][j]-=tree
                        else:
                            dead_map[i][j].append(tree//2)
                    graph[i][j]=temp
                        
        #여름
        for i in range(N):
            for j in range(N):
                if dead_map[i][j] !=0:
                    nutrition_level[i][j]+=sum(dead_map[i][j])
        
        #가을
        new_growings=[]
        for i in range(N):
            for j in range(N):
                if graph[i][j]!=0:
                    trees=graph[i][j]
                    for tree in trees:
                        if tree % 5 !=0:
                            continue
                        for dir in range(8):
                            new_row=i+dy[dir]
                            new_col=j+dx[dir]

                            if new_row < 0 or new_row >=N or new_col < 0 or new_col >=N:
                                continue
                            new_growings.append((new_row,new_col))
        for row,col in new_growings:
            if graph[row][col]==0:
                graph[row][col]=[]
            graph[row][col].append(1)

        #겨울
        for i in range(N):
            for j in range(N):
                nutrition_level[i][j]+=adding_nutrition_level[i][j]

    count=0
    for i in range(N):
        for j in range(N):
            if graph[i][j]!=0:
                count+=len(graph[i][j])
    return count                    


if __name__ == "__main__":
    N,M,K=map(int,input().split())

    adding_nutrition_level=[list(map(int,input().split())) for _ in range(N)]
    nutrition_level=[[5]*N for _ in range(N)]
    trees=[]
    graph=[[0] * N for _ in range(N)]

    for _ in range(M):
        row,col,age=map(int,input().split())
        if graph[row-1][col-1]==0:
            graph[row-1][col-1]=[]
        graph[row-1][col-1].append(age)
    print(solution())

```
