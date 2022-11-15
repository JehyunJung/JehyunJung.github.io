---
title: "[SWEA] Q1206 View"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - samsung
---
# [SWEA] Q1206 View
## [Question](https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=AV134DPqAA8CFAYh)
## Language: Python
## Difficulty: D3

이번 문제는 특정 건물에 대한 조망권이 있는 층들의 개수를 구하는 문제이다. 조망권을 가지기 위해서는 좌우 인접한 2칸에 대해서 다른 건물에 의해 막혀서는 안된다. 

인접한 좌우 2칸에 대해 가장 높은 층을 구해서, 현재 층과 비교한 후 현재층이 더 높은 경우에 대해 (현재층 - 인접한 가장 높은 층)이 조망권이 확보된 층들의 갯수가 된다.

```python
current_height=heights[i]
left_right_max=max(heights[i-2],heights[i-1],heights[i+1],heights[i+2])
    
if current_height > left_right_max:
    count+=(current_height-left_right_max)
```
## Solution

```python
def solution():
    count=0
 
    for i in range(2,n-2):
        current_height=heights[i]
        left_right_max=max(heights[i-2],heights[i-1],heights[i+1],heights[i+2])
         
        if current_height > left_right_max:
            count+=(current_height-left_right_max)
 
    return count
 
 
if __name__ == "__main__":
    n=0
    heights=[]
    for i in range(10):
        n=int(input())
        heights=list(map(int,input().split()))
        print("#{} {}".format(i+1, solution()))
```
