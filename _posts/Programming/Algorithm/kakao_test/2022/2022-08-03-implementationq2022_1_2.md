---
title: "[Programmers] P92335 k진수에서 소수 개수 구하기"
excerpt: "2022 카카오 공채 문제 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P92335 k진수에서 소수 개수 구하기
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/92335)
## Language: Python

해당 문제는 소수 판별법, 진수 표현법을 구현할 수 있는 지 여부를 판단하는 문제이다.

1. 소수 판별법
2. 진수 변환법
3. 문제에 주어진 패턴 이해
    - 0P, 0P0, P0 이라고 하는 것은 0으로 둘러쌓인 부분, 즉 0으로 구분되어 진 P를 찾는 것이다. 이는 0을 구분자로 인식해서 문자열을 분할하면 된다.

## Solution

```python
from math import sqrt
#소수 판별
def is_prime(num):
    count=0
    if num <2:
        return False
    
    sqrt_num=int(sqrt(num))
    for i in range(2,sqrt_num+1):
        if num % i ==0:
            return False
    
    return True
    
#진수 변환
def conversion(n,k):
    s=""
    while n > 0:
        s+=str(n%k)
        n//=k
    return s[::-1]


def solution(n, k):
    answer = 0  
    splitted_data=conversion(n,k).split("0")

    for string in splitted_data:
        if string == "":
            continue
            
        if is_prime(int(string)):
            answer+=1
    
    return answer
```
