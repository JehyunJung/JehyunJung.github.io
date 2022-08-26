---
title: "[BOJ] Q20057 마법사 상어와 토네이도"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
  - try_again
---
# [BOJ] Q20057 마법사 상어와 토네이도
## [Question](https://www.acmicpc.net/problem/20057)
## Language: Python
## Difficulty: Gold 3

해당 문제의 지문을 분석해보면, 이동은 나선형 형태로 이동하게 되며, 모래의 양이 비율에 따라 퍼지게 된다. 

1. 나선형 이동의 구현

자세히 보면  (← + ↓) *1 , (→ + ↑) *2 , (← + ↓) *3 , (→ + ↑) *4 와 같이 이동하는 것을 확인할 수 있다.

따라서, 짝수 길이 이동과, 홀수 길이 이동의 경우를 나눠 아래와 같이 구현할 수 있다.

```python
for i in range(num):
    #좌 + 하 이동
    if i % 2==0:
        move(i,3,left) 
        move(i,2,down)
    #우 + 상 이동
    else:
        move(i,1,right)
        move(i,0,up)
```
2. 주어진 비율에 따라 모래가 퍼지게 되는데, 이동하는 방향이 바뀌게 되면 주어진 비율 그래프를 해당 방향으로 회전 시켜서 고려하면 된다. 그때 그때, 회전을 진행하게 되면 매번 회전을 수행해야하므로, 이는 시간 초과가 발생하게 될 가능성이 높아진다. 따라서, 미리 각 방향 별로 비율 그래프를 정의한다.

```python
left=[(-2,0,0.02),(-1,-1,0.1),(-1,0,0.07),(-1,1,0.01),
(0,-2,0.05),
(1,-1,0.1),(1,0,0.07),(1,1,0.01),
(2,0,0.02),(0,-1,0)]

right=[(x,-y,r) for x,y,r in left]
up=[(y,x,r) for x,y,r in left]
down=[(-y,x,r) for x,y,r in left]
```

3. 모래의 이동 구현

주어진 방향에 대한 비율 그래프를 이용해서 모래 이동을 진행한다. 이때, r=0 인 경우, 즉 α 칸에 대해서는, 비율 칸으로 이동하고 남은 모래의 양을 모두 옮기게 되므로, 따로 처리를 해줘야한다.

```python
current_amount=graph[current_row][current_col]
for y,x,r in direction:
    row=current_row+y
    col=current_col+x

    amount=int(current_amount*r)
    #만약 알파 칸에 대한 이동인 경우 비율칸으로 이동한 나머지의 모래양만큼이 이동하게 된다.
    if r==0:
        amount=(current_amount-spread_amount)

    #경계 밖으로 이동하게 되는 경우 
    if row < 0 or row >=num or col < 0 or col>=num:
        result+=amount
    #해당 칸으로 모래 이동
    else:
        graph[row][col]+=amount

    #이동하는 총 모래의 양
    spread_amount+=amount

```

## Solution

```python
def move(cnt,move_dir,direction):
    global result,graph,current_row,current_col
    for _ in range(cnt+1):
        next_row=current_row+dy[move_dir]
        next_col=current_col+dx[move_dir]

        current_row,current_col=next_row,next_col

        #토네이도 끝까지 이동한 경우
        if current_row < 0 or current_col < 0:
            break

        spread_amount=0
        current_amount=graph[current_row][current_col]
        if current_amount ==0:
            continue
        for y,x,r in direction:
            row=current_row+y
            col=current_col+x

            amount=int(current_amount*r)
            #만약 알파 칸에 대한 이동인 경우 비율칸으로 이동한 나머지의 모래양만큼이 이동하게 된다.
            if r==0:
                amount=(current_amount-spread_amount)

            #경계 밖으로 이동하게 되는 경우 
            if row < 0 or row >=num or col < 0 or col>=num:
                result+=amount
            #해당 칸으로 모래 이동
            else:
                graph[row][col]+=amount

            #이동하는 총 모래의 양
            spread_amount+=amount

        
    
def solution():
    left=[(-2,0,0.02),(-1,-1,0.1),(-1,0,0.07),(-1,1,0.01),
    (0,-2,0.05),
    (1,-1,0.1),(1,0,0.07),(1,1,0.01),
    (2,0,0.02),(0,-1,0)]

    right=[(x,-y,r) for x,y,r in left]
    up=[(y,x,r) for x,y,r in left]
    down=[(-y,x,r) for x,y,r in left]

    for i in range(num):
        #좌 + 하 이동
        if i % 2==0:
            move(i,3,left) 
            move(i,2,down)
        #우 + 상 이동
        else:
            move(i,1,right)
            move(i,0,up)


if __name__ == "__main__":
    num=int(input())
    graph=[list(map(int,input().split())) for _ in range(num)]
    result=0
    current_row,current_col = (num//2,num//2)
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    solution()
    print(result)  print(solution())
```