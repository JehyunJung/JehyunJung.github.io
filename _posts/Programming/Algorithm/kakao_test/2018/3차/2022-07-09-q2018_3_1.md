---
title: "[Programmers] P17687 N진수 게임"
excerpt: "2018 카카오 공채 3차 문제 1"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17687 N진수 게임
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17687)
## Language: Python

1. 주어진 진법에 따라 미리 진수 표현법을 표현해주는 함수 구현
2. 최대로 필요한 개수 만큼 진수 표현법을 구한다.튜브의 차례와 게임에 참여하는 인원의 곱 만큼의 코드 개수가 필요하다.
3. 튜브의 차례에 해당하는 코드를 출력한다.(이때 10~15는 A~F로 표현한다.)



## Solution

```python
codes=[]
#1
def n_digits(number,digit):
    global codes
    if number//digit >0:
        n_digits(number//digit,digit)
    codes.append(number%digit)

def solution(n, t, m, p):
    answer = ''
    convertion={10:"A",11:"B",12:"C",13:"D",14:"E",15:"F"}
    for i in range(10):
        convertion[i]=str(i)
    
    #2
    index=0
    while len(codes)<=t*m:
        n_digits(index,n)
        index+=1
    
    #3
    for times in range(t):
        answer+=convertion[codes[p-1+m*times]]
 
    return answer
```
