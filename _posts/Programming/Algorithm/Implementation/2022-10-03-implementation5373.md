---
title: "[BOJ] Q5373 큐빙"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - try_again
---
# [BOJ] Q5373 큐빙
## [Question](https://www.acmicpc.net/problem/5373)
## Language: Python
## Difficulty: Platinum 5

3차원 구조를 가지는 큐브에 대해서, 각각의 면을 분리해서 회전을 고려해야한다.

각 면에 대한 회전을 수행할때, 아래의 2가지 회전이 발생한다

1. 해당 면에 대한 회전
- 이 부분은 2차원 배열의 시계방향 회전, 시계 반대 방향 회전 함수를 통해 구현할 수 있다.

```python
def clock_wise(list):
new_list=[[0] * 3 for _ in range(3)]
for i in range(3):
    for j in range(3):
        new_list[j][2-i]=list[i][j]
return new_list

def counter_clock_wise(list):
new_list=[[0] * 3 for _ in range(3)]
for i in range(3):
    for j in range(3):
        new_list[j][i]=list[i][2-j]
return new_list
```
2. 해당 면을 둘러싸고 있는 4면에 대한 회전
각각의 면에 대해서 둘러싸고 있는 면들을 구해서 해당 면 간에 회전 연산을 구현해야한다.

가령 L의 경우를 살펴 보자

> L 시계 방향

L 주위의 U,F,D,B 면 간에 회전이 발생한다

U면의 0열 -> F면의 0열 -> D면의 0열 -> B면의 2열

이때, 회전을 고려할때, 각 면의 시작점이 어디에 있는지 파악하는 것이 중요하다 그래서, B면과 D면간의 회전을 생각할때 시작 좌표가 다르기 때문에 역순으로 입력한다.

```python
for i in range(3):
    new_dice[2][i][0]=dice[0][i][0]
    new_dice[1][i][0]=dice[2][i][0]
    new_dice[3][i][2]=dice[1][2-i][0]
    new_dice[0][i][0]=dice[3][2-i][2]
new_dice[4]=clock_wise(dice[4])
```

> L 반시계 방향

L 주위의 U,F,D,B 면 간에 회전이 발생한다

B면의 2열 -> D면의 0열 -> F면의 0열 -> U면의 0열

```python
for i in range(3):
    new_dice[3][i][2]=dice[0][2-i][0]
    new_dice[1][i][0]=dice[3][2-i][2]
    new_dice[2][i][0]=dice[1][i][0]
    new_dice[0][i][0]=dice[2][i][0]
new_dice[4]=counter_clock_wise(dice[4])
```

## Solution

```python
from copy import deepcopy
def clock_wise(list):
    new_list=[[0] * 3 for _ in range(3)]
    for i in range(3):
        for j in range(3):
            new_list[j][2-i]=list[i][j]
    return new_list

def counter_clock_wise(list):
    new_list=[[0] * 3 for _ in range(3)]
    for i in range(3):
        for j in range(3):
            new_list[j][i]=list[i][2-j]
    return new_list

def solution(operations):
    #윗면,아랫면,앞면,뒷면,왼쪽면,오른쪽면
    dice=[
        [['w'] * 3 for _ in range(3)],
        [['y'] * 3 for _ in range(3)],
        [['r'] * 3 for _ in range(3)],
        [['o'] * 3 for _ in range(3)],
        [['g'] * 3 for _ in range(3)],
        [['b'] * 3 for _ in range(3)]
        ]
    for operation in operations:
        new_dice=deepcopy(dice)
        #윗면
        if operation[0] == "U":
            if operation[1]=="+":
                for i in range(3):
                    new_dice[5][0][i]=dice[3][0][i]
                    new_dice[2][0][i]=dice[5][0][i]
                    new_dice[4][0][i]=dice[2][0][i]
                    new_dice[3][0][i]=dice[4][0][i]
                new_dice[0]=clock_wise(dice[0])

            if operation[1]=="-":
                for i in range(3):
                    new_dice[4][0][i]=dice[3][0][i]
                    new_dice[2][0][i]=dice[4][0][i]
                    new_dice[5][0][i]=dice[2][0][i]
                    new_dice[3][0][i]=dice[5][0][i]                   
                new_dice[0]=counter_clock_wise(dice[0])
        
        #아랫면
        if operation[0] == "D":
            if operation[1]=="+":
                for i in range(3):
                    new_dice[4][2][i]=dice[3][2][i]
                    new_dice[2][2][i]=dice[4][2][i]
                    new_dice[5][2][i]=dice[2][2][i]
                    new_dice[3][2][i]=dice[5][2][i]   
                    
                new_dice[1]=clock_wise(dice[1])
      
            if operation[1]=="-":
                for i in range(3):
                    new_dice[5][2][i]=dice[3][2][i]
                    new_dice[2][2][i]=dice[5][2][i]
                    new_dice[4][2][i]=dice[2][2][i]
                    new_dice[3][2][i]=dice[4][2][i]
                new_dice[1]=counter_clock_wise(dice[1])
        #앞면
        if operation[0] == "F":
            if operation[1]=="+":
                for i in range(3):
                    new_dice[5][i][0]=dice[0][2][i]
                    new_dice[1][0][i]=dice[5][2-i][0]
                    new_dice[4][i][2]=dice[1][0][i]
                    new_dice[0][2][i]=dice[4][2-i][2]
                new_dice[2]=clock_wise(dice[2])

            if operation[1]=="-":
                for i in range(3):
                    new_dice[4][i][2]=dice[0][2][2-i]
                    new_dice[1][0][i]=dice[4][i][2]
                    new_dice[5][i][0]=dice[1][0][2-i]
                    new_dice[0][2][i]=dice[5][i][0]
                    
                new_dice[2]=counter_clock_wise(dice[2])
        #뒷면
        if operation[0] == "B":
            if operation[1]=="+":
                for i in range(3):
                    new_dice[4][i][0]=dice[0][0][2-i]
                    new_dice[1][2][i]=dice[4][i][0]
                    new_dice[5][i][2]=dice[1][2][2-i]
                    new_dice[0][0][i]=dice[5][i][2]
                new_dice[3]=clock_wise(dice[3])
            
            if operation[1]=="-":
                for i in range(3):
                    new_dice[5][i][2]=dice[0][0][i]
                    new_dice[1][2][i]=dice[5][2-i][2]
                    new_dice[4][i][0]=dice[1][2][i]
                    new_dice[0][0][i]=dice[4][2-i][0]
                new_dice[3]=counter_clock_wise(dice[3])
        #왼쪽면
        if operation[0] == "L":
            if operation[1]=="+":
                for i in range(3):
                    new_dice[2][i][0]=dice[0][i][0]
                    new_dice[1][i][0]=dice[2][i][0]
                    new_dice[3][i][2]=dice[1][2-i][0]
                    new_dice[0][i][0]=dice[3][2-i][2]
                new_dice[4]=clock_wise(dice[4])
            
            if operation[1]=="-":
                for i in range(3):
                    new_dice[3][i][2]=dice[0][2-i][0]
                    new_dice[1][i][0]=dice[3][2-i][2]
                    new_dice[2][i][0]=dice[1][i][0]
                    new_dice[0][i][0]=dice[2][i][0]
                new_dice[4]=counter_clock_wise(dice[4])
        #오른쪽면
        if operation[0] == "R":
            if operation[1]=="+":
                for i in range(3):
                    new_dice[3][i][0]=dice[0][2-i][2]
                    new_dice[1][i][2]=dice[3][2-i][0]
                    new_dice[2][i][2]=dice[1][i][2]
                    new_dice[0][i][2]=dice[2][i][2]
                new_dice[5]=clock_wise(dice[5])
            
            if operation[1]=="-":
                for i in range(3):
                    new_dice[2][i][2]=dice[0][i][2]
                    new_dice[1][i][2]=dice[2][i][2]
                    new_dice[3][i][0]=dice[1][2-i][2]
                    new_dice[0][i][2]=dice[3][2-i][0]
                new_dice[5]=counter_clock_wise(dice[5])

        dice=new_dice
    for i in range(3):
        print("".join(dice[0][i]))

if __name__ == "__main__":
    test_cases=int(input())
    for _ in range(test_cases):
        n_rotates=int(input())
        operations=list(map(str,input().split()))
        solution(operations)
```