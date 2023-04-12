---
title: "[BOJ] Q1027 고층 건물"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - ccw
---
# [BOJ] Q1027 고층 건물
## [Question](https://www.acmicpc.net/problem/1027)
## Language: Python
## Difficulty: Gold 4

해당 문제의 경우, 단순하게 두 좌표를 활용해서 직선의 방정식을 세워 두 좌표 사에 있는 점들에 대해 직선을 관통을 하는지 여부를 판단하면 되므로 간단하게 풀이가 가능하다.

## Solution 1

```python
def line_function(slope,intercept,x):
    return slope*x+intercept

def check(left_index,right_index):
    left_height=buildings[left_index]
    right_height=buildings[right_index]

    slope=float(right_height-left_height)/(right_index-left_index)
    intercept=-slope*left_index+left_height

    for index in range(left_index+1,right_index):
        if line_function(slope,intercept,index)<=buildings[index]:
            return False
    
    return True

    
def solution():
    max_count=0
    for index in range(n):
        count=0
        for left_index in range(index-1,-1,-1):
            if check(left_index,index):
                count+=1
        for right_index in range(index+1,n):
            if check(index,right_index):
                count+=1
        max_count=max(max_count,count)
    
    print(max_count)

if __name__ == "__main__":
    n=int(input())
    buildings=list(map(int, input().split()))

    solution()

```

## Solution 2

또 다른 풀이방법으로는 CCW을 활용하여 선분의 교차 여부를 판단할 수 있다.

![1027](/assets/images/algorithm/1027.jpg)

```python
def ccw(point1,point2,point3):
    return (point1[0] * point2[1] - point2[0] * point1[1])+(point2[0] * point3[1] - point3[0] * point2[1])+(point3[0] * point1[1] - point1[0] *point3[1])
    
def solution():
    max_count=0
    for index in range(n):
        count=0
        if 0 < index:
            
            left_highest_index=index-1
            count+=1
            for left_index in range(index-2,-1,-1):
                if ccw((index,buildings[index]),(left_highest_index,buildings[left_highest_index]),(left_index,buildings[left_index])) >=0:
                    continue
                count+=1
                left_highest_index=left_index
        if index < n-1:
            right_highest_index=index+1
            count+=1
            for right_index in range(index+2,n):
                if ccw((index,buildings[index]),(right_highest_index,buildings[right_highest_index]),(right_index,buildings[right_index])) <=0:
                    continue
                count+=1
                right_highest_index=right_index
            
        max_count=max(max_count,count)
    
    print(max_count)
if __name__ == "__main__":
    n=int(input())
    buildings=list(map(int, input().split()))

    solution()
```