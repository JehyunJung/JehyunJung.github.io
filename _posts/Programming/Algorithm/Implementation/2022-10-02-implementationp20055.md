---
title: "[BOJ] Q20055 컨베이어 벨트 위의 로봇"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - programmers
  - try_again
---
# [BOJ] Q20055 컨베이어 벨트 위의 로봇  
## [Question](https://www.acmicpc.net/problem/20055)
## Language: Python
## Difficulty: Gold 5?

해당 문제에 대한 시뮬레이션 과정을 분석하면 크게 3가지가 있다.

1. 컨베이어 벨트의 회전
컨베이어 벨트를 한 칸씩 오른쪽으로 이동시켜주는 작업을 진행해야하는데, 일반적인 리스트를 이용하게 되면 아래와 같이
반복을 수행하며, O(N)의 시간 복잡도가 발생한다. 

```python
new_list=[0]*(2*N)
for i in range(N-1):
    new_list[i+1]=list[i]
new_list[0]=list[2*N-1]
```

이를 효율적으로 해결하기 위해 queue를 활용한다.

```python
conveyor=deque(list(range(2*N)))
#컨베이어 벨트 이동
conveyor.rotate(1)
```

2. 로봇의 이동

로봇은 스스로 움직일 수 있는데, 다음 칸에 로봇이 없거나, 내구도가 0 보다 큰 경우 이동가능하다.

```python
#컨베이어의 내리는 위치의 전칸에 있는 로봇 부터 이동 가능한지 여부를 검사해서 이동한다.(내리는 위치에 있는 로봇은 이동할 필요가 없다.)
for i in range(N-2,-1,-1):
    location=conveyor[i]
    next_location=conveyor[i+1]
    #해당 자리에 로봇이 있고, 다음 자리에 로봇이 없고, 다음 벨트의 내구도가 0이 아니면 이동 가능하다.
    if is_robots[location] and is_robots[next_location]==False and belts[next_location]!=0:
        belts[next_location]-=1 
        is_robots[location],is_robots[next_location]=is_robots[next_location],is_robots[location] 
```

3. 로봇 추가

컨베이어 첫번째 자리에 해당하는 칸에 내구도가 0보다 클때 로봇을 추가할 수 있고, 로봇을 추가하는 순간 내구도가 1 감소한다.

```python
location=conveyor[0]
    
    if belts[location]!=0:
        is_robots[location]=True
        belts[location]-=1
```

## Solution

```python
from collections import deque

def check_if_zero():
    return belts.count(0) < K

def rotate():
    global is_robots,end_point

    #컨베이어 벨트 이동
    conveyor.rotate(1)

    #마지막 위치에 있는 로봇 내린다.
    end_point=conveyor[N-1]
    is_robots[end_point]=False

def robot_move():
    global belts,is_robots
    for i in range(N-2,-1,-1):
        location=conveyor[i]
        next_location=conveyor[i+1]
        #해당 자리에 로봇이 있고, 다음 자리에 로봇이 없고, 다음 벨트의 내구도가 0이 아니면 이동 가능하다.
        if is_robots[location] and is_robots[next_location]==False and belts[next_location]!=0:
            belts[next_location]-=1 
            is_robots[location],is_robots[next_location]=is_robots[next_location],is_robots[location]    
    
    #마지막 위치에 로봇이 도달한 경우 제거한다.
    is_robots[end_point]=False

def put_robot():
    location=conveyor[0]
    
    if belts[location]!=0:
        is_robots[location]=True
        belts[location]-=1

def solution():
    index=0
    while check_if_zero():
        #회전
        rotate()
        #로봇의 이동
        robot_move()
        #로봇 올리기
        put_robot()
        index+=1
    
    return index
if __name__  == "__main__":
    end_point=0
    N,K=map(int,input().split())
    belts=list(map(int,input().split()))
    is_robots=[False]*(2*N)

    conveyor=deque(list(range(2*N)))
    print(solution())

```