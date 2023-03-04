---
title: "[BOJ] Q3020 개똥벌레"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - binary_search
  - prefix_sum
---
# [BOJ] Q3020 개똥벌레
## [Question](https://www.acmicpc.net/problem/3020)
## Language: Python
## Difficulty: Gold 5

해당 문제는 2가지 방식으로 문제 풀이가 가능하다. 우선, 누적합을 활용한 풀이방식을 알아보자

## Solution 1

> 누적합 활용

![3020_1](/assets/images/algorithm/3020_1.jpg)

위의 그림과 같이, 석순, 종유석으로 이루어진 동굴을 눕혀서 생각하여 높이를 기준으로 고려하도록 한다. 각각의 석순, 종유석에 대하여 시작점, 끝점을 표시해서 나중에 일괄적으로 누적합을 통해 계산하게 되면 최종적으로 해당 높이에 장애물의 갯수가 구해지게 된다. 이를 활용하여 장애물의 갯수가 가장 적은 구간의 갯수를 구할 수 있게 된다. 

[추석_트래픽]({% post_url 2022-07-09-q2018_1_7 %}) 문제에서도 비슷한 개념이 활용된다.


```python
from math import inf
def solution():
    heights=[0]*(h+1)

    #각각의 높이에 대해 장애물의 시작높이, 끝높이에 해당하는 값에 경계표시
    for index in range(n):
        height=stones[index]
        #석순
        if index % 2==0:
            heights[height]+=1
            heights[0]-=1

        #종유석
        else:
            heights[h]+=1
            heights[h-height]-=1
        

    #각 높이에 대해 장애물이 있는 구간을 찾기 위해 누적합을 수행한다.
    min_height=inf
    count=0
    for index in range(h,0,-1):
        heights[index-1]+=heights[index]

        #최솟값 갱신 및 갯수 카운팅
        if min_height > heights[index]:
            min_height=heights[index]
            count=1
        elif min_height==heights[index]:
            count+=1
    
    print(min_height,count)
    
if __name__ == "__main__":
    n,h=map(int,input().split())
    stones=[int(input()) for _ in range(n)]
    solution()
```

## Solution 2

이분탐색을 활용한 문제 풀이도 가능하다.

![3020_2](/assets/images/algorithm/3020_2.jpg)

종유석, 석순을 각각 분리해서, 높이 순서대로 정렬을 수행한다. 이후에, 검증하고자 할 높이에 대해 종유석, 석순 배열에서 각각 index을 찾게 되면 해당 index을 통해 걸쳐지는 종유석, 석순의 갯수를 구할수 있게 된다. 

```python
from math import inf
from bisect import bisect_left
def solution():
    heights=[0]*(h+1)
    tops=[]
    bottoms=[]

    #각각의 높이에 대해 장애물의 시작높이, 끝높이에 해당하는 값에 경계표시
    for index in range(n):
        height=stones[index]
        #석순
        if index % 2==0:
            bottoms.append(height)

        #종유석
        else:
            tops.append(height)
    
    tops.sort()
    bottoms.sort()

    min_obstacles=inf
    count=0

    for height in range(1,h+1):
        top_index=bisect_left(tops,(h+1)-height)
        bottom_index=bisect_left(bottoms,height)

        obstacle_count=n-top_index-bottom_index

        if obstacle_count < min_obstacles:
            min_obstacles=obstacle_count
            count=1
        elif obstacle_count==min_obstacles:
            count+=1
    
    print(min_obstacles,count)
    
if __name__ == "__main__":
    n,h=map(int,input().split())
    stones=[int(input()) for _ in range(n)]
    solution()
```

