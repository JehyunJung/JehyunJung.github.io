---
title: "[Programmers] 자물쇠와 열쇠"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
---
# [Programmers] Q60059 자물쇠와 열쇠
## [Question](https://programmers.co.kr/learn/courses/30/lessons/60059)
## Language: Python

자물쇠는 고정되어 있고 열쇠는 회전을 할 수 있으며, 이동을 할 수 있다. 이 말은 자물쇠는 고정된 위치에 저장해놓고, 열쇠를 회전(동/서/남/북)해보거나 [0][0] 좌표에서부터 [n-1][n-1] 까지 이동시켜서 홈이 일치하는 지 여부를 판단한다.

또한 문제의 조건에서 열쇠는 자물쇠의 영역의 벗어나는 부분에 대해서는 무시하고, 홈만 맞으면 되니까 
아래의 오른쪽 그림처럼 자물쇠의 영역을 확대시켜서 생각하면 벗어나는 영역의 크기를 고려하는데 수월하다.
![q60059](/assets/images/algorithm/q60059.png)

## Solution

>Rotation 

90도 방향으로 회전하는 함수 같은 경우 종종 쓰인다.
```python
def rotate(arr,m):
    new_arr=[[0]*m for _ in range(m)]
    
    for i in range(m):
        for j in range(m):
            new_arr[j][m-i-1]=arr[i][j]
    
    return new_arr   
```


```python
def rotate(arr,m):
    new_arr=[[0]*m for _ in range(m)]
    
    for i in range(m):
        for j in range(m):
            new_arr[j][m-i-1]=arr[i][j]
    
    return new_arr      

def check_if_true(arr,n):
    for i in range(n,2*n):
        for j in range(n,2*n):
            if arr[i][j]==0:
                return False
    return True

def solution(key, lock):
    m=len(key)
    n=len(lock)
    
    new_lock=[[0]*(n*3) for _ in range(n*3)]
    
    for i in range(n):
        for j in range(n):
            new_lock[i+n][j+n]=lock[i][j]
    
    for dir in range(4):
        key=rotate(key,m)
        for shift_row in range(n*2):
            for shift_col in range(n*2):
                for i in range(m):
                    for j in range(m):
                        new_lock[i+shift_row][j+shift_col] += key[i][j]
                        
                if check_if_true(new_lock,n):
                    return True
                
                for i in range(m):
                    for j in range(m):
                        new_lock[i+shift_row][j+shift_col] -= key[i][j]
    return False  
            
```
