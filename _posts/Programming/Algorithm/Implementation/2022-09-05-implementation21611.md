---
title: "[BOJ] Q21611 마법사와 블리자드"
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
# [BOJ] Q21610 마법사와 블리자드
## [Question](https://www.acmicpc.net/problem/21611)
## Language: Python
## Difficulty: Gold 1

이번 문제의 핵심 과제는 2차원 리스트 < - > 1차원 리스트 간의 변환을 구현하는 부분이다.

이 문제를 2차원 리스트로 고정해서 생각하기란, 쉽지 않다. 따라서 1차원 리스트로 변환해서 각각의 시뮬레이션을 진행해야한다.

구현해야될 부분은 크게 5가지이다.

1. 2차원 -> 1차원 
2. 구슬 파괴
3. 구슬 폭발
4. 구슬 변환
5. 1차원 - > 2차원

우선적으로, 나선형으로 이동하는 방식의 경우 문제 [Q20057]({% post_url 2022-08-26-implementation20057 %})에서 다룬 대로 방향 이동을 고려한다.

> 1. 2차원 -> 1차원 변환

```python
move_types=[[3,0],[2,1]]
row,col=((N+1)//2)-1,((N+1)//2)-1

for i in range(1,N+1):
    #한번 이동할때 (← + ↓) *1 , (→ + ↑) *2 와 같이 세트 단위로 이동하기 때문에, 세트를 묶어서 고려한다.
    moves=move_types[i%2]
    for dir in moves:
        for _ in range(i):
            row+=dy[dir]
            col+=dx[dir]

            #범위를 벗어나게 되면 멈춘다.
            if row < 0 or row >=N or col < 0 or col>=N:
                return temp

            #비어 있으면 앞에 있는 것을 땡겨온다.
            if graph[row][col] ==0:
                continue
            #1차원 리스트에 추가한다.
            temp.append(graph[row][col])
```

> 2. 구슬 파괴

구슬 파괴의 경우 2차원 리스트에서 고려하는 것이 수월하기 때문에, 구슬 파괴는 2차원 리스트를 활용해서 진행하고, 이후에 1차원 리스트로 변환하도록 한다.

```python
def destroy_marvels(blizard):
    global graph
    dir,speed=blizard
    row,col=((N+1)//2)-1,((N+1)//2)-1
    for i in range(1,speed+1):
        next_row=row+dy[dir-1]*i
        next_col=col+dx[dir-1]*i
        #구슬 파괴
        graph[next_row][next_col]=0
```

> 3. 구슬 폭발

똑같은 번호가 연속적으로 나오는 칸에 대해서, 임시 리스트로 보관하고 있다가 번호가 바뀌게 되면 그때, 해당 번호를 가진 칸의 개수를 검사한다. 이때 만약 개수가 4개가 넘어가게 되면 일차원 리스트에 저장하지 않고, 폭발 시키는 경우로 처리한다.

```python
while index < length:
    #이전과 똑같은 번호를 가진 구슬이라면 temp 배열에 넣는다.
    if linear_list[index] == prev_index:
        temp_list.append(linear_list[index])
        count+=1
    #이전 칸과 다른 번호를 가지는 경우
    else:
        #같은 번호를 가진 구슬의 개수가 4개 이상인경우 -> 폭발시킨다.
        if count >= 4:
            check=True
            #번호에 따라, 폭발되는 구슬의 개수를 증가시킨다.
            exploded_marvels[prev_index]+=count
        #폭발되지 않는 구슬은 따로 빼놓는다.
        else:
            new_list.extend(temp_list)
        #다음 구슬에 대해서 계속 순회 진행
        prev_index=linear_list[index]
        temp_list=[prev_index]
        count=1

    index+=1
```

> 주의점

마지막 구슬 목록에 대해서는 처리가 되지 않으므로, 해당 부분은 따로 처리하는 것을 잊지 않도록 한다.

```python
#마지막 구슬 목록에 대해서, 갯수가 4개이면 폭발 시킨다.
if count>=4:
    check=True
    exploded_marvels[prev_index]+=count
#그렇지 않은 경우, 구슬 목록을 추가시킨다.
else:
    new_list.extend(temp_list)
```

> 4. 구슬 변환

위의 구슬 폭발과 비슷한 방식으로 동작하게 된다. 각각의 번호와 번호가 얼만큼 중복되는 지를 검사해서 (번호 index, 번호 count) 이 두 값을 추가하도록 한다.

```python
while index < length:
    #같은 번호를 가진 구슬의 경우 개수 증가
    if linear_list[index] == prev_index:
        count+=1
    else:
        #같은 번호의 구슬에 대해, 몇개 반복했는지에 따라 -> A,B 그룹으로 변환해서 해당 값들을 추가
        new_list.append(count)  
        new_list.append(prev_index)
        prev_index=linear_list[index]
        count=1
    index+=1
```

이때, 위의 연산 결과 리스트가 원래의 2차원 리스트를 넘어서는 만큼의 데이터 갯수를 가질 수 있기 때문에 이에 대한 처리도 해야한다.

```python
if len(new_list) >= (N**2)-1:
    new_list=new_list[:(N**2)-1]
```

> 5. 1차원 - > 2차원

이 부분은 2차원 -> 1차원 부분과 유사한 방식으로 진행하면 되는데, 이때는 1차원 리스트의 값을 2차원 리스트로 옮겨 주도록 한다.

```python
for i in range(1,N+1):
    moves=move_types[i%2]
    for dir in moves:
        for _ in range(i):
            row+=dy[dir]
            col+=dx[dir]
            #모두 다 당겼으면 나오도록 한다.
            if index == len(linear_list):
                graph=new_graph
                return
            
            new_graph[row][col]=linear_list[index]
            index+=1
```

## Solution

```python
def destroy_marvels(blizard):
    global graph
    dir,speed=blizard
    row,col=((N+1)//2)-1,((N+1)//2)-1
    for i in range(1,speed+1):
        next_row=row+dy[dir-1]*i
        next_col=col+dx[dir-1]*i
        #구슬 파괴
        graph[next_row][next_col]=0

def extract_to_linear_list():
    temp=[]
    check=False
    move_types=[[3,0],[2,1]]
    row,col=((N+1)//2)-1,((N+1)//2)-1
    for i in range(1,N+1):
        moves=move_types[i%2]
        for dir in moves:
            for _ in range(i):
                row+=dy[dir]
                col+=dx[dir]

                #범위를 벗어나게 되면 멈춘다.
                if row < 0 or row >=N or col < 0 or col>=N:
                    return temp

                #비어 있으면 앞에 있는 것을 땡겨온다.
                if graph[row][col] ==0:
                    continue
                    
                temp.append(graph[row][col])

def compose_to_doubly_list(linear_list):
    global graph
    new_graph=[[0] *N for _ in range(N)]
    move_types=[[3,0],[2,1]]
    row,col=((N+1)//2)-1,((N+1)//2)-1
    index=0
    #새로운 값들로 그래프를 초기화한다.
    for i in range(1,N+1):
        moves=move_types[i%2]
        for dir in moves:
            for _ in range(i):
                row+=dy[dir]
                col+=dx[dir]
                #모두 다 당겼으면 나오도록 한다.
                if index == len(linear_list):
                    graph=new_graph
                    return
                
                new_graph[row][col]=linear_list[index]
                index+=1

#구슬 폭발 함수                   
def explode_marvels(exploded_marvels,linear_list):
    new_list=[]
    if len(linear_list)==0:
        return False,new_list
    length=len(linear_list)
    prev_index=linear_list[0]
    temp_list=[prev_index]
    count=1

    check=False
    index=1

    while index < length:
        #이전과 똑같은 번호를 가진 구슬이라면 temp 배열에 넣는다.
        if linear_list[index] == prev_index:
            temp_list.append(linear_list[index])
            count+=1
        #이전 칸과 다른 번호를 가지는 경우
        else:
            #같은 번호를 가진 구슬의 개수가 4개 이상인경우 -> 폭발시킨다.
            if count >= 4:
                check=True
                #번호에 따라, 폭발되는 구슬의 개수를 증가시킨다.
                exploded_marvels[prev_index]+=count
            #폭발되지 않는 구슬은 따로 빼놓는다.
            else:
                new_list.extend(temp_list)
            #다음 구슬에 대해서 계속 순회 진행
            prev_index=linear_list[index]
            temp_list=[prev_index]
            count=1

        index+=1
    #마지막 구슬 목록에 대해서, 갯수가 4개이면 폭발 시킨다.
    if count>=4:
        check=True
        exploded_marvels[prev_index]+=count
    #그렇지 않은 경우, 구슬 목록을 추가시킨다.
    else:
        new_list.extend(temp_list)
    return check, new_list

def change_marvels(linear_list):
    new_list=[]
    if len(linear_list)==0:
        return new_list
    length=len(linear_list)
    prev_index=linear_list[0]
    count=1
    index=1
    while index < length:
        #같은 번호를 가진 구슬의 경우 개수 증가
        if linear_list[index] == prev_index:
            count+=1
        else:
            #같은 번호의 구슬에 대해, 몇개 반복했는지에 따라 -> A,B 그룹으로 변환해서 해당 값들을 추가
            new_list.append(count)  
            new_list.append(prev_index)
            prev_index=linear_list[index]
            count=1
        index+=1
  
    #마지막 구슬에 대한 처리
    new_list.append(count)  
    new_list.append(prev_index)
    
    #혹 그래프의 길이를 능가하게 되는 경우 조절한다.
    if len(new_list) >= (N**2)-1:
        new_list=new_list[:(N**2)-1]

    return  new_list
def solution():
    exploded_marvels=[0] *4
    for blizard in blizards:
        #구슬의 파괴
        destroy_marvels(blizard)
        #구슬의 이동 -> 2차원 리스트를 1차원 리스트로 변환해서 진행하면 쉽게 연산을 수행하는 것이 가능하다.
        linear_list=extract_to_linear_list()

        #빈칸이 없을때까지 계속 반복
        while True:  
            #구슬의 폭발, 만약 폭발하지 않으면 종료
            result,linear_list=explode_marvels(exploded_marvels,linear_list)
            
            #더 이상 폭발할 구슬이 없는 경우
            if not result:
                break
        #구슬의 벼화
        linear_list=change_marvels(linear_list)
        
        #구슬이 없는 경우
        if len(linear_list)==0:
            break
            
        #1차원 리스트를 다시 2차원 리스트로 변환
        compose_to_doubly_list(linear_list) 
    
    return exploded_marvels[1] + 2*exploded_marvels[2] + 3*exploded_marvels[3]


if __name__ == "__main__":
    dy=[-1,1,0,0]
    dx=[0,0,-1,1]

    N,M=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(N)]
    blizards=[list(map(int,input().split())) for _ in range(M)]
    
    print(solution())
```