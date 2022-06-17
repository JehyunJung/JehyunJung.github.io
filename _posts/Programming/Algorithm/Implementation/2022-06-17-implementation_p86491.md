---
title: "[Programmers] 최소직사각형"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
---
# [Programmers] 최소직사각형
## [Question](https://programmers.co.kr/learn/courses/30/lessons/86491)
## Language: Python

해당 문제는 어렵게 생각하면 어려울 수 있는데, 쉽게 생각하면 아주 간단한 문제이다.
중구난방으로 된 가로, 세로 크기를 정렬하는 게 포인트이다.

항상 가로는 세로 보다 크게끔 만들어서, 최대 가로 값 * 최대 세로값을 구한다.

## Solution

```python
def solution(sizes):
    answer = 0
    max_width,max_height=0,0
    for i in range(len(sizes)):
        if sizes[i][0] < sizes[i][1]:
            sizes[i][0],sizes[i][1]=sizes[i][1],sizes[i][0]
        max_width=max(max_width,sizes[i][0])
        max_height=max(max_height,sizes[i][1])
    answer=max_width*max_height
    return answer
```
