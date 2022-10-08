---
title: "[SWEA] 1767 프로세서 연결하기"
excerpt: "BackTracking"

categories:
  - codetest
tags:
  - backtracking
  - codetest
  - boj
  - bruteforce
  - samsung
  - try_again
---
# [SWEA] 1767 프로세서 연결하기
## [Question](https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=AV4suNtaXFEDFAUf)
## Language: Python
 
해당 문제는 모든 경우의 수에 대해 고려하는 대표적인 BruteForce + BackTracking 유형의 문제이다. 주어진 문제에서, 모든 코어에 대해 각 4방향을 고려하여 전선을 연결하였을 때, 최대한 많은 코어를 연결하려고 할때, 전선의 길이를 최소로 설정하는 방법을 구해야한다. 완전탐색의 시간을 줄이기 위해 우선, 벽에 붙어 있는 코어를 제외한 나머지 코어를 list 형태로 저장해서 해당 리스트을 BruteForce 하도록 한다.

```python
for row in range(n):
    for col in range(n):
        if board[row][col]==1:
            #벽에 붙어 있는 core인 경우 이미 전원 공급이 되는 상황임
            if row==0 or row==n-1 or col==0 or col==n-1:
                continue
            n_cores+=1
            cores.append((row,col))
```

그리고, BackTracking을 수행하면서, 해당 방향으로 전선을 연결할 수 있는 지 확인한다.(전선이 놓일 경로에 이미 전선이 있거나 다른 코어가 위치한 경우 해당 방향으로 전선을 놓을 수 없다.)

> 모든 코어 * 모든 방향에 대한 Backtracking

```python
for i in range(index,n_cores):
    row,col=cores[i]
    for dir in range(4):
        result=check_if_possible(row,col,dir)
        if result==None:
            continue
        else:
            for r,c in result:
                cable_info[r][c]=True
            solution(i+1,core_count+1,cable_length+len(result))
            for r,c in result:
                cable_info[r][c]=False
```

> 전선을 놓을 수 있는 지 여부 판단

```python
def check_if_possible(start_row,start_col,dir):
    locations=[]
    for i in range(1,n+1):
        next_row=start_row+dy[dir]*i
        next_col=start_col+dx[dir]*i
        #전선이 정상적으로 코어에 설치되는 경우 해당 코어에 전선을 부착한다.
        if next_row < 0 or next_row >=n or next_col < 0 or next_col>=n:
            return locations
        #해당 공간이 빈칸이 아니거나 이미 전선이 설치되어 있는 경우 전선을 놓지 않는다.
        if board[next_row][next_col]!=0 or cable_info[next_row][next_col]:
            return None
        locations.append((next_row,next_col))
```

모든 코어에 대한 검사를 수행하고 나면, 코어 최대값을 갱신한다. 이때, 주의 해야할 것은 아래와 같이 최소 전선의 길이를 갱신할때 min 함수를 활용해서 하면 문제가 발생한다.
예를 들어, 현재 저장된 최대 코어 개수가 3개이고, 최소 전선의 길이가 2라고 가정했을 때, 코어의 개수가 4개 전선의 길이가 6인 경우가 탐색되면 코어의 개수는 갱신되지만, 전선의 길이는 min 함수에 의해서 기존 최소값인 2가 유지된다. 

```python
if max_count <= core_count:
    max_count=core_count
    min_length=min(min_length,cable_length)
```
위의 코드의 문제의 해결하기 위해 코어의 개수가 최대 코어 개수와 같을 때만 min함수를 통한 전선의 길이를 비교한다.

```python
if max_count < core_count:
    max_count=core_count
    min_length=cable_length
if max_count==core_count:
    min_length=min(min_length,cable_length)
```

**하나의 배열을 공유해야하는 경우 deepcopy 대신 전역변수로 배열을 둬서 backtracking을 하도록 하여 시간 초과를 방지한다.**

```python
from math import inf
 
def check_if_possible(start_row,start_col,dir):
    locations=[]
    for i in range(1,n+1):
        next_row=start_row+dy[dir]*i
        next_col=start_col+dx[dir]*i
        #전선이 정상적으로 코어에 설치되는 경우 해당 코어에 전선을 부착한다.
        if next_row < 0 or next_row >=n or next_col < 0 or next_col>=n:
            return locations
        #해당 공간이 빈칸이 아니거나 이미 전선이 설치되어 있는 경우 전선을 놓지 않는다.
        if board[next_row][next_col]!=0 or cable_info[next_row][next_col]:
            return None
        locations.append((next_row,next_col))
 
def solution(index,core_count,cable_length):
    global max_count,min_length,cable_info
    if index==n_cores:
        if max_count < core_count:
            max_count=core_count
            min_length=cable_length
        if max_count==core_count:
            min_length=min(min_length,cable_length)
        return
    #각각의 코어에 대해 케이블을 설치 가능한지 판단한다.
    for i in range(index,n_cores):
        row,col=cores[i]
        for dir in range(4):
            result=check_if_possible(row,col,dir)
            if result==None:
                continue
            else:
                for r,c in result:
                    cable_info[r][c]=True
                solution(i+1,core_count+1,cable_length+len(result))
                for r,c in result:
                    cable_info[r][c]=False
if __name__ == "__main__":
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    T = int(input())
    # 여러개의 테스트 케이스가 주어지므로, 각각을 처리합니다.
    for test_case in range(1, T + 1):
        # ///////////////////////////////////////////////////////////////////////////////////
        n=int(input())
        board=[list(map(int,input().split())) for _ in range(n)]
        cable_info=[[False] * n for _ in range(n)]
        cores=[]
        n_cores=0
        min_length=inf
        max_count=0
         
        #코어의 좌표 구하기
        for row in range(n):
            for col in range(n):
                if board[row][col]==1:
                    #벽에 붙어 있는 core인 경우 이미 전원 공급이 되는 상황임
                    if row==0 or row==n-1 or col==0 or col==n-1:
                        continue
                    n_cores+=1
                    cores.append((row,col))
         
        solution(0,0,0)
        if max_count==0:
            min_length=0
        print("#{} {}".format(test_case,min_length))
    # ///////////////////////////////////////////////////////////////////////////////////  
```



