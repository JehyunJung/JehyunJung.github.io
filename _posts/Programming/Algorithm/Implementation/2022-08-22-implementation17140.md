---
title: "[BOJ] Q17140 이차원 배열과 연산"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q17140 이차원 배열과 연산
## [Question](https://www.acmicpc.net/problem/17140)
## Language: Python
## Difficulty: Gold 4

시뮬레이션 유형의 문제이다.

1초간에 이루어지는 내용은 R연산 혹은 S연산이다.
R연산은 각각의 행에 대해 적용되는 연산이며, S연산은 열에 대해 적용된다. 따라서, 이 둘의 동작과정은 매우 유사하다

각각의 행,열에 대해서 연산을 수행하기 때문에, 행,열을 각각 따로 리스트 형태로 저장하고 있는 것이 연산을 적용하기에 수월하다.

R연산의 동작과정을 살펴보자

1. 각각의 행에 대해서, 정렬을 수행하는데, 이때 각각의 수에 대해서 등장하는 횟수를 알아야한다.
그런뒤, 등장하는 횟수가 작은 순으로, 횟수가 같은 경우는 숫자가 작은 순으로 정렬을 수행한다.

이 부분을 쉽게 하기 위해 Counter을 활용한다.

```python
row_Counter=list(Counter(rows[row_index]).items())
row_Counter.sort(key=lambda x : (x[1],x[0]))
```

2. key,value 형태로 row에 새로 저장한다. 이때, key가 0인 경우는 무시한다.

```python
for key,value in row_Counter:
    if key==0:
        continue
    temp_row.append(key)
    temp_row.append(value)
```

3. 위와 같은 방식으로 정렬을 수행하다보면, 행의 길이 제각각이 되는데, 이때 가장 길이 긴 행을 기준으로 0으로 추가시키면서 길이를 맞춰준다.
또한, 문제에서 주어진 행/열의 최대길이는 100이라고 했으므로, 가장 길이가 긴 행의 길이를 최대 100으로 설정하고, 길이가 100이 넘어가는 행에 대해서는 index가 100을 넘어가는 항목에 대해서는 제거한다.
```python
largest_size=min(largest_size,100)
#append 0 for blank spots
for row_index in range(n_rows):
    row_size=len(rows[row_index])
    #길이가 최대 100이 되도록 설정
    if row_size >= 100:
        rows[row_index]=rows[row_index][:101]
        continue

    rows[row_index].extend([0]*(largest_size-row_size))
```
4. 위와 같이 R연산을 수행하게 되면, 그래프의 값이 바뀌게 되므로, column 배열에 대해 새롭게 추출해야한다.

```python
cols=extract_cols(n_rows,n_cols,rows)
```

## Solution

```python
from collections import Counter

def extract_cols(n_rows,n_cols,rows):
    cols=[]
    for col_index in range(n_cols):
        col=[]
        for row_index in range(n_rows):
            col.append(rows[row_index][col_index])
        cols.append(col)
    
    return cols

def extract_rows(n_rows,n_cols,cols):
    rows=[]
    for row_index in range(n_rows):
        row=[]
        for col_index in range(n_cols):
            row.append(cols[col_index][row_index])
        rows.append(row)
    
    return rows

def operation_R(rows,n_rows):
    largest_size=0
    for row_index in range(n_rows):
        temp_row=[]
        row_Counter=list(Counter(rows[row_index]).items())
        row_Counter.sort(key=lambda x : (x[1],x[0]))
        for key,value in row_Counter:
            if key==0:
                continue
            temp_row.append(key)
            temp_row.append(value)

        rows[row_index]=temp_row
        largest_size=max(largest_size,len(temp_row))
    
    largest_size=min(largest_size,100)
    #append 0 for blank spots
    for row_index in range(n_rows):
        row_size=len(rows[row_index])

        if row_size >= 100:
            rows[row_index]=rows[row_index][:101]
            continue

        rows[row_index].extend([0]*(largest_size-row_size))
    
    #열 늘려주기
    return largest_size

def operation_C(cols,n_cols):
    largest_size=0
    for col_index in range(n_cols):
        temp_col=[]
        col_Counter=list(Counter(cols[col_index]).items())
        col_Counter.sort(key=lambda x : (x[1],x[0]))
        for key,value in col_Counter:
            if key==0:
                continue
            temp_col.append(key)
            temp_col.append(value)
        cols[col_index]=temp_col
        largest_size=max(largest_size,len(temp_col))
    
    largest_size=min(largest_size,100)
    #append 0 for blank spots
    for col_index in range(n_cols):
        col_size=len(cols[col_index])

        if col_size >= 100:
            cols[col_index]=cols[col_index][:101]
            continue
        cols[col_index].extend([0]*(largest_size-col_size))
    
    #열 늘려주기
    return largest_size

def print_graph(times,rows):
    print("GRAPH ",times)
    for row in rows:
        print(row)

def solution():
    n_rows,n_cols=3,3
    times=0
    rows=graph
    cols=extract_cols(n_rows,n_cols,graph)

    while True:
        if times >100:
            times=-1
            break

        if r <= n_rows and c <= n_cols:
            if rows[r-1][c-1] ==k:
                break

        if n_rows >=n_cols:
            n_cols=operation_R(rows,n_rows)
            cols=extract_cols(n_rows,n_cols,rows)
        else:
            n_rows=operation_C(cols,n_cols)
            rows=extract_rows(n_rows,n_cols,cols)
        
        times+=1


    return times

if __name__ =="__main__":
    r,c,k=map(int,input().split())
    graph=[list(map(int,input().split())) for _ in range(3)]

    print(solution())
```