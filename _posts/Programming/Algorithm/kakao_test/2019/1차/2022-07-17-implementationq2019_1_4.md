---
title: "[Programmers] P42891 무지의 먹방 라이브"
excerpt: "2019 카카오 공채 1차 문제 4"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P42891 뮤지의 먹방 라이브
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/42891)
## Language: Python

[풀이 참조]({% post_url 2022-06-05-greedy_p42891 %})

## Solution

```python
import heapq    
def solution(food_times, k):
    answer = 0
    if sum(food_times) <=k:
        return -1
    heap=[]
    for i,food in enumerate(food_times):
        heapq.heappush(heap,(food,i+1))
    
    prev=0
    sub_sum=0
    length=len(heap)
    while sub_sum + (heap[0][0]-prev)*length <=k:    
        item,i=heapq.heappop(heap)
        sub_sum+=((item-prev) * length)
        prev=item
        length-=1
    
    heap.sort(key=lambda x: x[1])
    answer=heap[(k-sub_sum)%length][1]
    
    return answer
```
