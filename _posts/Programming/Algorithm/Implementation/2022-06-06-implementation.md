---
title: "Implementation"
excerpt: "구현"

categories:
  - algorithm
tags:
  - implementation
  - algorithm
---

# Implementation
주어진 문제의 상황에 맞게 구현하는 유형의 문제이다. 해당 조건에 맞는 경우의 수는 몇개인지, 주어진 시뮬레이션에 맞게 이동하였을 경우, 목적지의 좌표는 어디인가?,등이 구현 유형의 문제이다. Greedy와 마찬가지로, 정형화된 알고리즘이 존재하지 않고 머리속에 있는 알고리즘을 코드로 구현해내는 것이 핵심이다.

# Question Types
주로 나올 수 있는 유형들은 모든 경우의 수를 다 조사해보는 완전탐색이 있고, 어떠한 로직에 따라 작업을 수행했을 때의 결과물을 출력하는 시뮬레이션이 있다.

## 완전탐색
![brute_force](/assets/images/algorithm/brute_force.jpg)
위와 같은 경우, 00:00:00~N:59:59 까지의 시간에 대해 초단위로 모두 검사해서 3을 포함하고 있는지 여부를 조사하면 쉽게 해결할 수 있다.

>Source

```python
N=int(input()):
count=0
for h in range(N+1):
  for m in range(60):
    for s in range(60):
      if '3' in str(h)+str(m)+str(s):
        count+=1
print(count)
```

## 시뮬레이션
![simulation1](/assets/images/algorithm/simulation1.jpg)
![simulation2](/assets/images/algorithm/simulation2.jpg)

입력에 따라 위치 이동을 진행하고 최종적으로 도달하게 되는 좌표를 구하는 시뮬레이션 유형이다.

>Source

```python
move_type=["L","R","U","D"]
dy=[0,0,1,-1]
dx=[-1,1,0,0]

n=int(input())
moves=list(map(int,input().split()))

row=0
col=0

for move in moves:
  for i in range(4):
    if move==move_type[i]:
      new_row=row+dy[i]
      new_col=col+dx[i]

  if new_row < 0 or new _row>n-1 or new_col < 0 or new_col>n-1:
    continue
      
  row=new_row
  col=new_col
print(new_row+1,new_col+1)
```