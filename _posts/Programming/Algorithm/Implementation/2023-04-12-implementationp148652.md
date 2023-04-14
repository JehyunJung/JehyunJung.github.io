---
title: "[Programmers] Q148652 유사 칸토어 비트열"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - Programmers
  - recursion
---
# [Programmers] Q148652 유사 칸토어 비트열
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/148652)
## Language: Python
## Difficulty: Level 2

해당 문제는 규칙성을 파악하는 것이 중요하다. 

![148652_1](/assets/images/algorithm/148652_1.jpg)

각 n번째 단계의 칸토어 비트열을 5<sup>n-1</sup> 단위로 쪼개면 n-1 번째와 동일한 모양인 것을 확인할 수 있다. *중간 비트열은 생략*
따라서, 재귀문을 통해 n-1 번째로 치환해서 판단해야되는 배열의 크기를 줄일 수 있다. 

n-1 번째로 재귀문을 넘길 때 판단해야되는 구간의 index을 조정해주는 작업을 수행한다. 아래와 같이 4가지 경우로 구분해서 처리를 진행한다.

![148652_2](/assets/images/algorithm/148652_2.jpg)

## Solution

```python
def cantor(n,start,left,right):
    #마지막에 도달한 경우
    if n==1:
        return [1,1,0,1,1][left-start:right-start+1].count(1)
    count=0
    for i in [0,1,3,4]:
        fragment_start=start + (5 **(n-1))*i
        fragment_end=start + (5 **(n-1))*(i+1) -1
        #넘어서는 경우
        if left < fragment_start and right > fragment_end:
            count+=cantor(n-1,fragment_start,fragment_start,fragment_end)
        #포함되는 경우
        elif fragment_start <= left <= right <=fragment_end:
            count+=cantor(n-1,fragment_start,left,right)
        #left가 걸치는 경우
        elif fragment_start <= left<=fragment_end:
            count+=cantor(n-1,fragment_start,left,fragment_end)
        #right가 겹치는 경우
        elif fragment_start<= right<= fragment_end:
            count+=cantor(n-1,fragment_start,fragment_start,right)
        #인덱스 범위에 포함되지 않는 경우
        else:
            continue
            
    return count
    
def solution(n, l, r):
    return cantor(n,0,l-1,r-1)    

```
