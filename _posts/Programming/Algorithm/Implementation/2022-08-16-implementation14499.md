---
title: "[BOJ] Q14499 주사위 굴리기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q14499 주사위 굴리기
## [Question](https://www.acmicpc.net/problem/14499)
## Language: Python
## Difficulty: Gold 4

해당 문제의 핵심은 주사위를 이동하는 부분을 정확하게 구현하는 것이다.

![q14499](/assets/images/algorithm/q14499.png)

위 그림과 같이 주사위 전개도를 바탕으로 주사위 이동방향을 고려해서 구현한다.

이때, 가로 부분/세로 부분을 따로 리스트 형태로 저장해서 관리하면 수월하게 구현할 수 있다.
```python
if dir==1:
    #동쪽
    dice_row.insert(0,dice_col.pop(-1))
    dice_col.append(dice_row.pop(-1))
    dice_col[1]=dice_row[1]
elif dir==2:
    #서쪽
    dice_row.append(dice_col.pop(-1))
    dice_col.append(dice_row.pop(0))
    dice_col[1]=dice_row[1]
elif dir==3:
    #북쪽
    dice_col.append(dice_col.pop(0))
    dice_row[1]=dice_col[1]

elif dir==4:
    #남쪽
    dice_col.insert(0,dice_col.pop(-1))
    dice_row[1]=dice_col[1]
```

## Solution

```python
def rotate_dice(dir,dice_row,dice_col):
    if dir==1:
        #동쪽
        dice_row.insert(0,dice_col.pop(-1))
        dice_col.append(dice_row.pop(-1))
        dice_col[1]=dice_row[1]
    elif dir==2:
        #서쪽
        dice_row.append(dice_col.pop(-1))
        dice_col.append(dice_row.pop(0))
        dice_col[1]=dice_row[1]
    elif dir==3:
        #북쪽
        dice_col.append(dice_col.pop(0))
        dice_row[1]=dice_col[1]
    
    elif dir==4:
        #남쪽
        dice_col.insert(0,dice_col.pop(-1))
        dice_row[1]=dice_col[1]

    
def solution():
    dice_row=[0,0,0]
    dice_col=[0,0,0,0]

    dy=[0,0,-1,1]
    dx=[1,-1,0,0]

    row,col=start_row,start_col
    
    for operation in operations:
        next_row=row+dy[operation-1]
        next_col=col+dx[operation-1]

        #경계를 넘어가는 경우, 이동하지 않는다.
        if next_row < 0 or next_row >= n_rows or next_col < 0 or next_col >=n_cols:
            continue

        rotate_dice(operation,dice_row,dice_col)

        #바닥이 0인 경우,주사위의 숫자가 바닥에 복사된다.
        if graph[next_row][next_col]==0:
            graph[next_row][next_col]=dice_col[3]
        #바닥이 0이 아니면 주사위 바닥으로 숫자가 복사되며, 바닥은 0이 된다.
        else:
            dice_col[3]=graph[next_row][next_col]
            graph[next_row][next_col]=0
        
        row=next_row
        col=next_col

        print(dice_col[1])
    
    

if __name__ == "__main__":
    n_rows,n_cols,start_row,start_col,n_operations=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(n_rows)]
    operations=list(map(int,input().split()))
    
    solution()
```
