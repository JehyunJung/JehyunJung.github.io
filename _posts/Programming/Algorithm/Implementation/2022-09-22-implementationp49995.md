---
title: "[Programmers] P49995 쿠키 구입"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - programmers
  - try_again
---
# [Programmers] P49995 쿠키 구입
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/49995)
## Language: Python
## Difficulty: Gold 3,4?

해당 문제는 얼핏 보기에는 구간의 합을 이용하는 문제로 Two-pointer의 유형처럼 보인다. 하지만 해당 문제는 특정 기준점을 잡아서 왼쪽, 오른쪽으로 늘려보면서 left_sum, right_sum이 같아지는 left_sum을 구하면 되는 문제이다.

아래의 그림과 같이 기준선을 이동시키면서 과자 개수의 합이 최대값을 찾으면 된다.

![p49995](/assets/images/algorithm/p49995.jpg)


## Solution

```python
def solution(cookie):
    answer = 0
    length=len(cookie)
        
    for mid_index in range(length-1):
        left_index,right_index=mid_index,mid_index+1
        left_sum=cookie[left_index]
        right_sum=cookie[right_index]
        
        while True:
            if left_sum==right_sum:
                answer=max(answer,left_sum)
            
            if left_index>0 and left_sum <=right_sum:
                left_index-=1
                left_sum+=cookie[left_index]
            elif right_index <length-1 and left_sum >=right_sum:
                right_index+=1
                right_sum+=cookie[right_index]
            else:
                break

    return answer
```