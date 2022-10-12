---
title: "[BOJ] Q20061 모노미노도미노 2"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q20061 모노미노도미노 2
## [Question](https://www.acmicpc.net/problem/20061)
## Language: Python
## Difficulty: Gold 2

해당 시뮬레이션 문제에서 필요한 동작은 크게 4가지이다.

1. 특정 블록이 초록색 영역과 파란색 영역으로 이동하는 함수
2. 초록색/파란색 영역에서 꽉 차 있는 행 또는 열이 있는 지 파악해서 해당 행/열을 지우는 함수
3. 비어있는 행/열에 대해 위에서/오른쪽에서 밀어내는 함수
4. 연한 영역에서 블록이 있는 지 여부를 파악해서, 끝 행/열을 제거하고 밀어내는 함수

이 문제의 핵심 기능은 아래의 행/열에 대해서 밀어내는 함수이다.

```python
def move_rows(graph,start_row):
    for row in range(start_row,3,-1):
        for col in range(4):
            graph[row][col]=graph[row-1][col]

    for col in range(4):
        graph[4][col]=0


def move_cols(graph,start_col):
    for col in range(start_col,3,-1):
        for row in range(4):
            graph[row][col]=graph[row][col-1]
    
    for row in range(4):
        graph[row][4]=0        
```

항상 밀어내게 되면 제일 위에 있는 행 혹은 제일 왼쪽에 있는 열은 비게 된다.


## Solution 1

```python
def block_move(graph,locations,type):
    if type==1:
        row,col=locations[0]
    
        #move to green
        while row < 9 and graph[row+1][col] ==0:
            row+=1
        graph[row][col]=1

        #move to blue
        row,col=locations[0]
        while col < 9 and graph[row][col+1] ==0:
            col+=1
        graph[row][col]=1
    
    #위치 좌표가 2개인 경우
    else:
        row1,col1=locations[0]
        row2,col2=locations[1]

        #move to green
        while row1 < 9 and row2 <9 and graph[row1+1][col1] ==0 and graph[row2+1][col2] ==0:
            row1+=1
            row2+=1
        graph[row1][col1]=1
        graph[row2][col2]=1

        row1,col1=locations[0]
        row2,col2=locations[1]

        #move to blue
        while col1 < 9 and col2 <9 and graph[row1][col1+1] ==0 and graph[row2][col2+1] ==0:
            col1+=1
            col2+=1
        graph[row1][col1]=1
        graph[row2][col2]=1
  

def check_green(graph):
    erase_count=0
    for row in range(6,10):
        count=0
        for col in range(4):
            if graph[row][col]==1:
                count+=1
        if count==4:
            move_rows(graph,row)
            erase_count+=1
    
    return erase_count

def check_blue(graph):
    erase_count=0
    for col in range(6,10):
        count=0
        for row in range(4):
            if graph[row][col]==1:
                count+=1
        if count==4:
            move_cols(graph,col)
            erase_count+=1
    
    return erase_count


#green area
def check_light_green(graph):
    for row in [4,5]:
        for col in range(4):
            if graph[row][col]:
                move_rows(graph,9)
                break
#blue area
def check_light_blue(graph):
    for col in [4,5]:
        for row in range(4):
            if graph[row][col]==1:
                move_cols(graph,9)
                break

def move_rows(graph,start_row):
    for row in range(start_row,3,-1):
        for col in range(4):
            graph[row][col]=graph[row-1][col]

    for col in range(4):
        graph[4][col]=0


def move_cols(graph,start_col):
    for col in range(start_col,3,-1):
        for row in range(4):
            graph[row][col]=graph[row][col-1]
    
    for row in range(4):
        graph[row][4]=0        


def solution():
    graph=[
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0]
    ]
    result=0
    for t,row,col in blocks:
        locations=[(row,col)]
        if t==2:
            locations.append((row,col+1))
        elif t==3:
            locations.append((row+1,col))
        
        block_move(graph,locations,t)

        #초록색 영역에서 행이 가득 차있는지 여부 판단
        result+=check_green(graph)

        #파란색 영역에서 열이 가득 차있는지 여부 판단
        result+=check_blue(graph)

        #연한 초록 부분에 블록이 있는지 여부 조사
        check_light_green(graph)
       
        #연한 파란 부분에 블록이 있는지 여부 조사
        check_light_blue(graph)


    #초록색 칸과, 파란색 칸에 블록이 들어있는 칸의 개수
    count=64
    for row in graph:
        count-=row.count(0)
    
    print(result)
    print(count)

if __name__ == "__main__":
    n=int(input())
    blocks=[list(map(int,input().split())) for _ in range(n)]

    solution()
```

## Solution 2

green box, blue box을 따로 둬서 고려하면 조금 더 쉽게 구현하는 것이다 가능하다.

```python
from os.path import dirname,join
from collections import deque

def insert_square(box,col):
    index=0
    while index<5:
        if box[index+1][col]==0:
            index+=1
        else:
            break
    box[index][col]=1

#1*2 직사각형 추가
def insert_1by2_rectangle(box,col):
    index=0
    while index<5:
        if box[index+1][col]==0 and box[index+1][col+1]==0:
            index+=1
        else:
            break
    box[index][col],box[index][col+1]=1,1


#2*1 직사각형 추가
def insert_2by1_rectangle(box,col):
    index=0
    while index<5:
        if box[index+1][col]==0:
            index+=1
        else:
            break
    box[index][col],box[index-1][col]=1,1

def erase_block(box):
    erase_count=0
    while True:
        for index in range(2,6):
            if sum(box[index])==4:
                box.pop(index)  
                box.insert(0,([0]*4))
                erase_count+=1
                break
        else:
            break
    return erase_count

def check_if_exists_and_erase(box):
    for _ in range(2):
        for col in range(4):
            if box[1][col]!=0:
                box.pop(-1)
                box.insert(0,([0]*4))
                break
    

def solution():
    green_box=[[0]*4 for _ in range(6)]
    blue_box=[[0]*4 for _ in range(6)]
    points=0
    for t,row,col in blocks:
        green_index,blue_index=0,0
        if t==1:
            insert_square(green_box,col)
            insert_square(blue_box,row)
        elif t==2:
            insert_1by2_rectangle(green_box,col)
            insert_2by1_rectangle(blue_box,row)

        elif t==3:
            insert_2by1_rectangle(green_box,col)
            insert_1by2_rectangle(blue_box,row)
        
        #특정 행/열이 가득 차면 해당 행/열을 제거한다.
        points+=erase_block(green_box)
        points+=erase_block(blue_box)

        #연한색 칸에 블록이 들어가는 경우에 대한 처리
        check_if_exists_and_erase(green_box)
        check_if_exists_and_erase(blue_box)

    count=0
    for row in range(2,6):
        count+=sum(green_box[row])
        count+=sum(blue_box[row])
    
    print(points)
    print(count)



if __name__ == "__main__":
    scriptpath = dirname(__file__)
    filename = join(scriptpath, 'input.txt')

    #predefined globals
    n=int(input())
    blocks=[list(map(int,input().split())) for _ in range(n)]
    
    solution()
```