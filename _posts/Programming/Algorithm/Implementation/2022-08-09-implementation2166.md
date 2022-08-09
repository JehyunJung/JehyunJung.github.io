---
title: "[BOJ] Q2166 다각형의 면적"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
---
# [BOJ] Q2166 다각형의 면적
## [Question](https://www.acmicpc.net/problem/2166)
## Language: Python
## Difficulty: Gold 5

주어진 점들로 이루어진 다각형 면적의 합은 사선공식을 이용하면 쉽게 풀이할 수 있다.

> 사선공식

A(x<sub>1</sub>,y<sub>1</sub>),B(x<sub>2</sub>,y<sub>2</sub>),C(x<sub>3</sub>,y<sub>3</sub>)...(x<sub>n</sub>,y<sub>n</sub>)

위의 다각형의 넓이는 아래의 공식을 통해 구할 수 있다.

0.5*|x<sub>1</sub>y<sub>2</sub>+x<sub>2</sub>y<sub>3</sub>+ ... x<sub>3</sub>y<sub>n</sub>+x<sub>n</sub>y<sub>1</sub> - y<sub>1</sub>x<sub>2</sub>+y<sub>2</sub>x<sub>3</sub>+ ... y<sub>3</sub>x<sub>n</sub> + y<sub>n</sub>x<sub>1</sub>|

아래와 같이 점 4개로 이루어진 다각형이 있다고 하면 

A(x<sub>1</sub>,y<sub>1</sub>),B(x<sub>2</sub>,y<sub>2</sub>),C(x<sub>3</sub>,y<sub>3</sub>),D(x<sub>4</sub>,y<sub>4</sub>)

ABCD의 넓이는

0.5*|x<sub>1</sub>y<sub>2</sub>+x<sub>2</sub>y<sub>3</sub>+x<sub>3</sub>y<sub>4</sub>+x<sub>4</sub>y<sub>1</sub> - y<sub>1</sub>x<sub>2</sub>+y<sub>2</sub>x<sub>3</sub>+y<sub>3</sub>x<sub>4</sub> + y<sub>4</sub>x<sub>1</sub>|

을 통해 구할 수 있다.
## Solution

```python
def solution():
    x,y=0,1
    zero_point=points[0]
    points.append(zero_point)

    plus,minus=0,0

    for i in range(num):
        plus+=(points[i][x]*points[i+1][y])
        minus+=(points[i][y]*points[i+1][x])
    area=0.5*(abs(plus-minus))
    print(round(area,1))

if __name__ == "__main__":
    num=int(input())
    points=[list(map(int,input().split())) for _ in range(num)]
    solution()
```
