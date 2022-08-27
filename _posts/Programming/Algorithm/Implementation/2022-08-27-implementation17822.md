---
title: "[BOJ] Q17822 원판 돌리기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - bfs
  - codetest
  - boj
  - samsung
---
# [BOJ] Q17822 원판 돌리기
## [Question](https://www.acmicpc.net/problem/17822)
## Language: Python
## Difficulty: Gold 3

해당 문제에서 구현해야 되는 부분은 원판을 회전시키는 부분과 인접한 수를 찾아서 빈칸으로 만드는 부분이다.

1. 원판을 회전하는 부분은 시계방향과 시계반대방향을 나눠서 고려해보면 아래와 같이 쉽게 구현할 수 있다

```python
if option==0:
    for _ in range(move_range):
        arr.insert(0,arr.pop(-1))
#option==1 (counter-clockwise)
else:
    for _ in range(move_range):
        arr.append(arr.pop(0))
```

또한, i가 주어질 때, i의 배수에 해당하는 원판에 대해서만 회전을 수행하기 때문에 아래와 같이, 배수를 고려해야한다.

```python
for multiplier in range(1,(N//i)+1):
        rotation(plates[(i*multiplier)-1],dir,move_range)
```

2. 인접한 수 중에서 같은 숫자를 가지는 경우에 대해서 제거를 해야한다. 이때, 문제에 주어진 조건에 따른 인접한 수는 자세히 보면 상하좌우 연결되어 있으면 인접해있음을 알 수 있다. --> 이에 따라 bfs를 생각해서 component을 구하는 것을 생각해볼 수 있다.

또한, 추가로 행의 첫 부분과 끝부분이 연결되어 있음을 인지해야한다.

```python
#끝과 처음을 연결하는 부분
if next_col ==M:
    next_col=0
if next_col == -1:
    next_col=M-1
```

여기서 제일 중요한 부분은 인접한 같은 수가 없는 경우에 대한 처리이다. check라는 전역변수를 하나 설정해서 인접한 같은 수가 있는 지 여부를 저장하고 있어야한다. bfs을 돌리는 과정에서 인접한 같은 수에 해당하는 숫자를 찾게 되면 check=True으로 지정하도록 하고, 아래와 같이, 인접한 같은 수가 없는 경우에는 False가 유지되게 된다.

```python 
if len(components) <=1:
    return

#component에 대해서 0처리
for row,col in components:
    plates[row][col]=0

check=True
```

check가 False가 유지되게 되면 문제에 주어진 조건에 따라, 동작을 수행하도록 한다.

```python
if not check:
    ...
```

## Solution

```python
from collections import deque
def rotation(arr,option,move_range):
    #option==0 (clockwise)
    if option==0:
        for _ in range(move_range):
            arr.insert(0,arr.pop(-1))
    #option==1 (counter-clockwise)
    else:
        for _ in range(move_range):
            arr.append(arr.pop(0))

def bfs(visited,start_row,start_col,color):
    global check
    components=[]

    queue=deque([(start_row,start_col)])

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    while queue:
        row,col=queue.popleft()

        if visited[row][col]:
            continue
        visited[row][col]=True

        components.append((row,col))

        for dir in range(4):
            next_row=row+dy[dir]
            next_col=col+dx[dir]
            
            #인접한 부분 연결
            if next_col ==M:
                next_col=0
            if next_col == -1:
                next_col=M-1

            if next_row < 0 or next_row >=N:
                continue
            #같은 색깔에 대해서만 bfs 수행
            if plates[next_row][next_col] != color:
                continue
            queue.append((next_row,next_col))
    #인접한 같은 수가 자기 자신만 있는 경우 빈칸으로 만드는 작업을 하지 않고, check도 True로 만들지 않는다.
    if len(components) <=1:
        return

    #component에 대해서 0처리
    for row,col in components:
        plates[row][col]=0
    
    check=True

def sum_of_plates():
    count=0
    sum_of_values=0

    for row in range(N):
        for col in range(M):
            if plates[row][col] ==0:
                continue
            count+=1
            sum_of_values+=plates[row][col]

    return sum_of_values,count
       
def print_plates():
    print("PLATES")
    for plate in plates:
        print(plate)

def solution():
    global check

    for i,dir,move_range in operations:
        #원판 회전 진행
        for multiplier in range(1,(N//i)+1):
            rotation(plates[(i*multiplier)-1],dir,move_range)

        visited=[[0] * M for _ in range(N)]
        check=False

        #bfs을 이용해서 인접한 같은 숫자에 대한 텀색을 진행
        for row in range(N):
            for col in range(M):
                if not visited[row][col] and plates[row][col]!=0:
                    bfs(visited,row,col,plates[row][col])
        
        #인접한 같은 수가 없는 경우
        if not check:
            sum_of_values,count_of_value=sum_of_plates()
            if count_of_value==0:
                continue
            #원판에 남아있는 수의 평균을 구해서 아래와 같이 동작을 수행하도록 한다.
            avg_of_values=sum_of_values/count_of_value

            for row in range(N):
                for col in range(M):
                    if plates[row][col] ==0:
                        continue
                    if plates[row][col] < avg_of_values:
                        plates[row][col] +=1

                    elif plates[row][col] > avg_of_values:
                        plates[row][col] -=1

    sum_of_values,count_of_value=sum_of_plates()

    return sum_of_values

if __name__ == "__main__":
    N,M,T=map(int,input().split())
    plates=[list(map(int,input().split())) for _ in range(N)]
    operations=[list(map(int,input().split())) for _ in range(T)]
    check=False
    print(solution())
```