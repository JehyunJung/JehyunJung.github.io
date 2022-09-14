---
title: "[Programmers] P60058 괄호 변환"
excerpt: "2020 카카오 공채 1차 문제 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P60058 괄호 변환
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/60058)
## Language: Python

## Solution

해당 문제는 주어진 문제의 시뮬레이션 조건에 맞춰 구현을 하는 시뮬레이션 문제이다.

1. 해당 문자열이 균형잡힌 문자열인지 확인하는 함수(규형잡힌 부분 까지의 index 반환)
2. 해당 문자열이 올바른 괄호 문자열인지 여부 확인하는 함수 
3. 괄호의 방향을 바꿔주는 함수

```python
#1
def check_if_balance(str):
    count=0
    for index,char in enumerate(str):
        if char=="(":
            count+=1
        if char==")":
            count-=1
        if count==0:
            return index
#2    
def check_if_perfect(p):
    count=0
    for char in p:
        if char == "(":
            count+=1
        elif char == ")":
            if count==0:
                return False
            count-=1
    return count == 0
#3
def change_parenthesis(p):
    temp=""
    for char in p:
        if char == "(":
            temp+=")"
        else:
            temp+="("
        
    return temp
#나머지 부분은 주어진 시뮬레이션에 따라 구현하면 되는 부분이다.
def solution(p):
    answer = ''
    
    if p == "":
        return answer
    
    index=check_if_balance(p)
    u=p[:index+1]
    v=p[index+1:]
    
    if check_if_perfect(u):
        answer=u+solution(v)
    else:
         answer= "("+solution(v)+")" + change_parenthesis(u[1:-1])
    return answer
```
