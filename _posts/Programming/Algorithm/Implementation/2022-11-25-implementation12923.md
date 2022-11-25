---
title: "[Programmers] Q12923 숫자 블록"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - programmers
  - Bruteforce

---
# [Programmers] Q12923 숫자 블록
## [Question](https://www.programmers.co.kr/learn/courses/30/lessons/12923)
## Language: Python

해당 문제에서는 블록을 배치할 때, 특정 구간의 블록 배치를 구하는 문제이다.

1번 블록은 2,3,4,5,6.. 위치에
2번 블록은 4,6,8,10...
3번 블록은 6,9,12...

예를 들어 6번 위치에 있는 블록의 정보는 3번이다. 각각의 위치에 블록을 배치할 때, 기존에 작은 숫자가 이미 있으면 큰 숫자로 해당 index에 블록을 대체한다.

이럴때, 각각의 index에 놓여있는 블록의 규칙을 확인해보면 자기 자신을 제외한 가장 큰 약수값이 오게 된다. 또한 블록의 번호는 최대 10000000이므로 이를 조건문에 포함시켜서 가장 큰 약수를 구한다.

> 약수 구하기

```python
def factorization(number):
    factors=[]
    if number==1:
        return 0
    last_number=1
    for i in range(2,int(sqrt(number))+1):
        if number % i==0 and number//i <= 10000000 :
            last_number=number//i
            break
    return last_number
```

## Solution

```python
from math import sqrt
def factorization(number):
    factors=[]
    if number==1:
        return 0
    last_number=1
    for i in range(2,int(sqrt(number))+1):
        if number % i==0 and number//i <= 10000000 :
            last_number=number//i
            break
    return last_number
            
def solution(begin, end):
    answer=[]
    
    for index in range(begin,end+1):
        answer.append(factorization(index))

    return answer
```