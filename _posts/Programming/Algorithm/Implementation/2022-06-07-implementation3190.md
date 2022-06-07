---
title: "[BOJ] Q3190 뱀"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
---
# [BOJ] Q3190 뱀
## [Question](https://www.acmicpc.net/problem/3190)
## Language: Python
## Difficulty: Gold 4

뱀은 지도 내를 돌아다니면서 사과를 먹으면 자기의 몸길이가 커지게 되고, 벽이나, 자기 몸에 부딛히게 되면 게임은 종료하게 된다. 또한, 한 번씩 방향을 전환을 하기도 한다.

뱀이 있는 위치를 기록하기 위해 list에 뱀이 차지하고 있는 좌표들을 기록하며, index=0 을 꼬리로, index=1을 head으로 생각해서 주어진 조건에 따라 시뮬레이션을 진행하면 된다.

## Solution

```python
def rotate(direction,way):
    if way=="L":
        direction-=1
        if direction==-1:
            direction=3
    else:
        direction+=1
        if direction == 4:
            direction=0
    return direction
    
def solution():
    graph=[[0]* (n+1) for _ in range(n+1)]
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    direction=1
    snale=[(1,1)]

    for row,col in apples:
        graph[row][col]=1
    
    time=0
    turn_index=0
    while True:
        head_row,head_col=snale[-1]

        new_row=head_row+dy[direction]
        new_col=head_col+dx[direction]

        if new_row < 1 or new_row >n or new_col < 1 or new_col >n:
            break

        if (new_row,new_col) in snale:
            break

        snale.append((new_row,new_col))

        if graph[new_row][new_col]==1:   
            graph[new_row][new_col]=0
        else:
            snale.pop(0)
        time+=1
        if turn_index < L and turns[turn_index][0]==time:
            direction=rotate(direction,turns[turn_index][1])
            turn_index+=1
    return time+1


        
    
if __name__ == "__main__":
    n=int(input())
    k=int(input())
    apples=[list(map(int,input().split())) for _ in range(k)]
    L=int(input())
    turns=[]
    for _ in range(L):
        time,rotation=input().split()
        turns.append((int(time),rotation))

    print(solution())
```
