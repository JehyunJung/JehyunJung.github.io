---
title: "[BOJ] Q10800 컬러볼"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
---
# [BOJ] Q10800 컬러볼
## [Question](https://www.acmicpc.net/problem/10800)
## Language: Python
## Difficulty: Gold 3

공의 크기를 크기가 작은 순서대로 정렬해놓고, 해당 공의 크기보다 작은 공들에 대해서 누적합을 구한다. 이와 동시에, 색깔이 같은 공에 대한 누적합을 함께 구해서, 나중에 이를 빼준다.

누적합을 구하는 부분을 통해 이중 for문의 반복횟수를 줄이는 것이 포인트이다. 직접적으로 누적합 배열을 두는 것이 아닌 누적합 개념에 정확한 이해를 바탕으로 해당 문제를 풀어야한다.


## Solution

```python
from itertools import accumulate
from collections import defaultdict

def solution():
    color_accums=defaultdict(int)
    balls.sort(key=lambda x:x[2])
    
    index_counts=[0 for i in range(num)]
    j=0
    total=0
    for i in range(num):
        index=balls[i][0]
        color=balls[i][1]
        size=balls[i][2]
        while balls[j][2] < size:
            total+=balls[j][2]
            color_accums[balls[j][1]]+=balls[j][2]
            j+=1
        index_counts[index]=total-color_accums[color]

    for i in range(num):
        print(index_counts[i])

if __name__ == "__main__":
    balls=[]
    sizes=[]
    num=int(input())
    for i in range(num):
        color,size=map(int,input().split())
        balls.append((i,color,size))
        sizes.append(size)

    solution()


```
