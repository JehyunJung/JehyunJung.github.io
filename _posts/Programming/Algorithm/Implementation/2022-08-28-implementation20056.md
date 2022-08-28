---
title: "[BOJ] Q20057 마법사 상어와 파이어볼"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q20057 마법사 상어와 파이어볼
## [Question](https://www.acmicpc.net/problem/20056)
## Language: Python
## Difficulty: Gold 4

시뮬레이션 내용을 살펴보면 아래와 같다.

1. 파이어볼 이동과 관련된 함수
2. 파이버볼 합치기 + 분할과 관련된 함수

> 파이어볼의 이동

이동에서의 핵심은 격자를 넘어서는 범위에 대한 처리이다. 아래의 알고리즘을 통해 행의 끝과 처음, 열의 끝과 처음을 이어줄 수 있게 된다. 양수,음수인 경우 모두 처리된다.

```python
next_row=(row+dy[direction]*speed)%N
next_col=(col+dx[direction]*speed)%N
```

> 파이어볼 합치기

**같은 칸에 여러 개의 파이어볼이 있을때만 분할을 수행한다.**

```python
for mass,speed,direction in graph[row][col]:
    sum_mass+=mass
    sum_speed+=speed
    
    if direction % 2==0:
        even_directions=True
    else:
        odd_directions=True

divided_mass=sum_mass//5
divided_speed=sum_speed//fireball_count
graph[row][col]=[]

#질량이 0이 되는 경우 소멸시킨다.
if divided_mass==0:
    continue
#방향이 모두 짝수 이거나, 홀수 인경우
if (odd_directions & even_directions) == False:
    for i in range(4):
        graph[row][col].append((divided_mass,divided_speed,2*i))

else:
    for i in range(4):
        graph[row][col].append((divided_mass,divided_speed,2*i+1))
```

방향에 대한 위와 같이, 홀수/짝수 여부에 대해서 저장하게 되면, 모두 홀수 혹은 모두 짝수인 경우, even_directions & odd_directions은 한쪽만 True가 되므로 FALSE값이 나오게 된다. 만약 홀수/짝수가 섞여서 나오게 되면 TRUE & TRUE로 인해 TRUE가 된다.


## Solution

```python
def move_fireball(graph):
    temp_graph=[[[] for _ in range(N)]for _ in range(N)]

    for row in range(N):
        for col in range(N):
            #파이어볼이 들어있지 않은 경우
            if len(graph[row][col])==0:
                continue
            for mass,speed,direction in graph[row][col]:
                #각각의 행/열은 처음과 끝이 연결되어 있기 때문
                next_row=(row+dy[direction]*speed)%N
                next_col=(col+dx[direction]*speed)%N


                temp_graph[next_row][next_col].append((mass,speed,direction))
    
    #새로운 그래프를 기존의 그래프로 설정
    return temp_graph

def fireball_fusion(graph):
    for row in range(N):
        for col in range(N):
            fireball_count=len(graph[row][col])
            #파이어볼이 들어있지 않은 경우
            if fireball_count<=1:
                continue
            sum_mass=0
            even_directions=False
            odd_directions=False
            sum_speed=0
            
            for mass,speed,direction in graph[row][col]:
                sum_mass+=mass
                sum_speed+=speed
                
                if direction % 2==0:
                    even_directions=True
                else:
                    odd_directions=True
            
            divided_mass=sum_mass//5
            divided_speed=sum_speed//fireball_count

            graph[row][col]=[]

            #질량이 0이 되는 경우 소멸시킨다.
            if divided_mass==0:
                continue
            #방향이 모두 짝수 이거나, 홀수 인경우
            if (odd_directions & even_directions) == False:
                for i in range(4):
                    graph[row][col].append((divided_mass,divided_speed,2*i))
            
            else:
                for i in range(4):
                    graph[row][col].append((divided_mass,divided_speed,2*i+1))
              

def solution():
    graph=[[[] for _ in range(N)]for _ in range(N)]

     #초기 파이어볼 추가
    for row,col,mass,speed,direction in fireballs:
        graph[row-1][col-1].append((mass,speed,direction))

    
     
    for _ in range(K):
        graph=move_fireball(graph)
        fireball_fusion(graph) 
    
    sum_of_fireball_mass=0

    for row in range(N):
        for col in range(N):
            #파이어볼이 들어있지 않은 경우
            if len(graph[row][col])==0:
                continue
            for mass,speed,direction in graph[row][col]:
                sum_of_fireball_mass+=mass
    
    return sum_of_fireball_mass

if __name__ == "__main__":
    dy=[-1,-1,0,1,1,1,0,-1]
    dx=[0,1,1,1,0,-1,-1,-1]

    N,M,K=map(int,input().split())
    fireballs=[list(map(int,input().split())) for _ in range(M)]
    
    print(solution())

```