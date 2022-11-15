---
title: "[SWEA] Q5650 핀볼 게임"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - samsung
---
# [SWEA] Q5650 핀볼 게임
## [Question](https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=AWXRF8s6ezEDFAUo#)
## Language: Python
## Difficulty: D3

해당 문제의 핵심은 각각의 블록에 대해 어떠한 방향으로 마주쳤을 때 어떠한 방향으로 변하는 지에 대한 정보를 배열을 통해 저장해서 방향 전환을 효율적으로 할 수 있도록 해야한다.

![swea5650](/assets/images/algorithm/swea5650.png)

```python
change_dir=[
        [],
        [2,3,1,0],
        [1,3,0,2],
        [3,2,0,1],
        [2,0,3,1],
        [2,3,0,1]
    ]
```

또한, 벽을 부딛히게 되면 5번 블록과 동일한 방향 변화가 발생하게 되므로, 경계면을 모두 5로 초기화하는 것이 좋다

```python
graph=[[5]*(num+2)]
for _ in range(num):
    graph.append([5]+list(map(int,input().split()))+[5])
graph.append([5]*(num+2))
```



```python
from collections import deque,defaultdict

def solution():
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    change_dir=[
        [],
        [2,3,1,0],
        [1,3,0,2],
        [3,2,0,1],
        [2,0,3,1],
        [2,3,0,1]
    ]
    worm_halls=defaultdict(list)
    start_positions=[]
    max_score=0
    for row in range(1,num+1):
        for col in range(1,num+1):
            #웜홀 파악
            if graph[row][col] >5:
                index=graph[row][col]
                worm_halls[index].append((row,col))
            #시작 가능 위치 파악
            if graph[row][col] ==0:
                start_positions.append((row,col))

    worms=dict()
    #각각의 웜홀에 대해 이어준다.(즉 한쪽 끝을 입력하면 다른 한쪽 끝이 반환될 수 있도록 한다.)
    for v1,v2 in worm_halls.values():
        worms[v1]=v2
        worms[v2]=v1

    for start_row,start_col in start_positions:
        for start_dir in range(4):
            row,col,dir,score=start_row,start_col,start_dir,0
            while True:
                row,col=row+dy[dir],col+dx[dir]
                #처음 위치에 다시 오거나 블랙홀을 만나는 경우
                if row==start_row and col==start_col or graph[row][col]==-1:
                    max_score=max(max_score,score)
                    break
                #블록을 만나는 경우
                elif 1<=graph[row][col]<=5:
                    dir=change_dir[graph[row][col]][dir]
                    score+=1
                #웜홀을 만나는 경우
                elif graph[row][col]>=6:
                    worm_index=graph[row][col]
                    row,col=worms[(row,col)]

    return max_score

if __name__== "__main__":
    num=0
    graph=[]
    test_cases=int(input())
    for i in range(test_cases):
        num=int(input())
        graph=[[5]*(num+2)]
        for _ in range(num):
        	graph.append([5]+list(map(int,input().split()))+[5])
        graph.append([5]*(num+2))
        print("#{} {}".format(i+1,solution()))

```
