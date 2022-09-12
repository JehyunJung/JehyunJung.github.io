---
title: "[BOJ] Q17136 색종이 붙이기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - dfs
  - codetest
  - boj
  - samsung
  - try_again
---
# [BOJ] Q17136 색종이 붙이기
## [Question](https://www.acmicpc.net/problem/17136)
## Language: Python
## Difficulty: Gold 2

처음에는 무조건 큰 색종이로만 커버 하면 된다고 생각했다. 하지만, 이렇게 하게 될 경우 만족하지 않는 경우가 발생하게 된다.

## Failed Solution

```python
def check_rectangle(size,start_row,start_col):
    for row in range(start_row,start_row+size):
        for col in range(start_col,start_col+size):
            if row < 0 or row >=10 or col <0 or col>=10:
                return False
            if graph[row][col]==0:
                return False
    return True

def cover_rectangle(size,start_row,start_col):
    global graph
    for row in range(start_row,start_row+size):
        for col in range(start_col,start_col+size):
            graph[row][col]=0

def solution():
    rectangles=[5,5,5,5,5]
    count=0
    for size in range(5,0,-1):
        for row in range(10):
            #해당 크기의 색종이를 다 사용했는 지
            if rectangles[size-1]==0:
                break
            for col in range(10):
                #해당 크기의 색종이를 다 사용했는 지
                if rectangles[size-1]==0:
                    break
                if graph[row][col]==1:
                    if check_rectangle(size,row,col):
                        cover_rectangle(size,row,col)
                        rectangles[size-1]-=1
                        count+=1
    #모두가 덮었는 지 확인
    for row in range(10):
        for col in range(10):
            if graph[row][col]==1:
                return -1

    return count

if __name__ =="__main__":
    graph=[list(map(int,input().split())) for _ in range(10)]
    print(solution())
```

결국 모든 사이즈를 고려한 Brute-Force 방식으로 접근해야한다. 즉, 모든 size에 대해 backtracking을 수행해야한다.

> 해당 색종이를 붙일 수 있는지 여부 판단

```python
for row in range(start_row,start_row+size):
    for col in range(start_col,start_col+size):
        if graph[row][col]==0:
            return False
return True
```

> 주의사항

모든 dfs 과정에 있어, 아래의 반복과정을 수행하면 너무 많은 반복이 발생하게 된다.

```python
for row in range(10):
    for col in range(10):
        ...
```

따라서,row, col를 매개변수로 전달하여 아래와 같이 반복을 통제해야한다.

```python
def dfs(count,row,col):
    global min_result,rectangles

    if row >=10:
        min_result=min(min_result,count)
        return 

    if col >=10:
        dfs(count,row+1,0)
        return
```

이는 [15684]({% post_url 2022-08-20-backtracking15684 %}) 문제에서 모든 dfs 과정에서 모든 row에 대해서 조사하지 않고, 이전에 조사한 row의 다음 row부터 조사를 이어가는 것과 같은 원리이다.


## Solution

```python
from math import inf
#색종이 붙이 가능 여부 판단
def check_rectangle(size,start_row,start_col):
    for row in range(start_row,start_row+size):
        for col in range(start_col,start_col+size):
            if graph[row][col]==0:
                return False
    return True
#색종이를 붙인다.
def cover_rectangle(size,start_row,start_col):
    global graph
    for row in range(start_row,start_row+size):
        for col in range(start_col,start_col+size):
            graph[row][col]=0
#색종이를 뗀다.
def uncover_rectangle(size,start_row,start_col):
    global graph
    for row in range(start_row,start_row+size):
        for col in range(start_col,start_col+size):
            graph[row][col]=1

def dfs(count,row,col):
    global min_result,rectangles
 
    if row >=10:
        min_result=min(min_result,count)
        return 
    
    if col >=10:
        dfs(count,row+1,0)
        return

    if graph[row][col]==1:
        for size in range(5,0,-1):
            #범위를 벗어나는 경우
            if (row+size) >10 or (col+size)>10:
                continue
            #색종이를 다 쓴 경우
            if rectangles[size-1]==0:
                continue      
                    
            if check_rectangle(size,row,col):
                cover_rectangle(size,row,col)
                rectangles[size-1]-=1
                dfs(count+1,row,col+size)                
                rectangles[size-1]+=1
                uncover_rectangle(size,row,col)
    else:
        dfs(count,row,col+1)



def solution():
    dfs(0,0,0)
    return -1 if min_result==inf else min_result

if __name__ =="__main__":
    rectangles=[5,5,5,5,5]
    min_result=inf
    graph=[list(map(int,input().split())) for _ in range(10)]
    print(solution())
```