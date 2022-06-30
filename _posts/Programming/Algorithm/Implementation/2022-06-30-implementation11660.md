---
title: "[BOJ] Q11660 구간 합 구하기 5"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - prefix sum
---
# [BOJ] Q11660 구간 합 구하기 5
## [Question](https://www.acmicpc.net/problem/11660)
## Language: Python
## Difficulty: Silver 1

전형적인 구간합을 이용한 문제 풀이이다

아래와 같은 행렬이 있다고 하자
||1|2|3|4|
|--|--|--|--|--|
|1|1|2|3|4|
|2|2|3|4|5|
|3|3|4|5|6|
|4|4|5|6|7|

해당 행렬에 대한 구간합을 구하면 아래와 같다
||1|2|3|4|5|
|--|--|--|--|--|--|
|1|0|0|0|0|0|
|2|0|1|3|6|10|
|3|0|3|8|15|24|
|4|0|6|15|27|42|
|5|0|10|24|42|64|

행 과 열에 대한 구간합을 구하기 위해 행에대한 구간합과 열에 대한 구간합을 구한 다음, 겹치는 대각선 부분에 대한 합을 빼줘야한다(겹치는 부분에 대한 중복이 생긴다.)

가령, (1,1)~(3,3) 까지의 구간합을 구하는 과정을 보면, (3,3)의 행렬값(5)+ (2,3)까지의 구간합(15)+(3,2)까지의 구간합(15)-(2,2)까지의 구간합(8)=27이 나오는 것이다.
이렇게 해서 구해놓은 구간합 배열을 통해서 같은 방식으로 (x1,y1)~(x2,y2)에 대한 구간합을 구할 수 있다.

> 이차원 배열 구간합 공식

```python
accum_matrix=[[0]*(num+1) for _ in range(num+1)]

for i in range(1,num+1):
    for j in range(1,num+1):
        accum_matrix[i][j]= matrix[i-1][j-1]+accum_matrix[i-1][j]+accum_matrix[i][j-1]-accum_matrix[i-1][j-1]
```

## Solution

```python
def solution():
    row_accum_matrix=[[0]*(num+1) for _ in range(num+1)]

    for i in range(1,num+1):
        for j in range(1,num+1):
            row_accum_matrix[i][j]= matrix[i-1][j-1]+row_accum_matrix[i-1][j]+row_accum_matrix[i][j-1]-row_accum_matrix[i-1][j-1]


    for start_row,start_col, end_row, end_col in queries:
        print(row_accum_matrix[end_row][end_col]-row_accum_matrix[end_row][start_col-1]-row_accum_matrix[start_row-1][end_col]+row_accum_matrix[start_row-1][start_col-1])



if __name__ == "__main__":
    num,n_queries=map(int,input().split())
    matrix=[list(map(int,input().split())) for _ in range(num)]
    queries=[list(map(int,input().split())) for _ in range(n_queries)]
    solution()
```
