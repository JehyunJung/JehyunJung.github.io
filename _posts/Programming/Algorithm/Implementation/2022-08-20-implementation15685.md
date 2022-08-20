---
title: "[BOJ] Q15685 드래곤 커브"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q15685 드래곤 커브
## [Question](https://www.acmicpc.net/problem/15685)
## Language: Python
## Difficulty: Gold 4

해당 문제는 드래곤 커브를 만드는 방법을 구현하는 것이 핵심 포인트이다.

처음에는, 드래곤 커브를 만들어 가는 과정에서 이차원 회전을 통한 방식으로 회전을 구현하려고 했으나, 이는 매우 복잡하는 방법이다. 

첫 시작점을 기준으로 드래곤 커브를 만들어가는 경로를 분석해보면 아래와 같은 규칙성을 확인할 수 있다.

![q15685](/assets/images/algorithm/q15685.png)

```python

def rotation(dir):
    if dir == 3:
        return 0

    return dir+1
    
past_dragon_curve=dragon_curves[type][generation]
dragon_curves[type].append(past_dragon_curve+list(map(rotation,past_dragon_curve[::-1])))
```


## Solution 

```python
def rotation(dir):
    if dir == 3:
        return 0

    return dir+1

def dragon_curve_maker():
    dragon_curves=dict()
    dragon_curves[0]=[[0]]
    dragon_curves[1]=[[1]]
    dragon_curves[2]=[[2]]
    dragon_curves[3]=[[3]]

    for generation in range(10):
        for type in range(4):
            past_dragon_curve=dragon_curves[type][generation]
            dragon_curves[type].append(past_dragon_curve+list(map(rotation,past_dragon_curve[::-1])))

    return dragon_curves

def solution():
    graph=[[False] * 101 for _ in range(101)]

    dy=[0,-1,0,1]
    dx=[1,0,-1,0]

    dragon_curves=dragon_curve_maker()

    for start_col,start_row,type,generation in curves:
        row,col=start_row,start_col
        graph[start_row][start_col]=True
        for dragon_curve_direction in dragon_curves[type][generation]:
            col+= dx[dragon_curve_direction]
            row+= dy[dragon_curve_direction]
            graph[row][col]=True

    count=0
    for row in range(100):
        for col in range(100):
            if graph[row][col] == True and graph[row+1][col] == True and graph[row][col+1] == True and graph[row+1][col+1] == True:
                count+=1
    
    return count

if __name__ == "__main__":
    num=int(input())
    curves=[list(map(int,input().split())) for _ in range(num)]
    
    print(solution())
```
