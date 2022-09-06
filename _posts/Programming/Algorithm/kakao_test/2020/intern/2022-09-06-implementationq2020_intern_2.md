---
title: "[Programmers] P67257 수식 최대화"
excerpt: "2020 카카오 인턴 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P67257 수식 최대화
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/67257)
## Language: Python

## Solution 

해당 문제에서 고려해야되는 것은 아래와 같다

1. 연산자 우선순위를 설정 --> permutation 활용
2. 각각의 연산자 우선순위를 토대로 식 계산 
    --> 이때, 연속적인 split 과정을 통해 피연산자 항이 1개가 될때 까지 분리한다.

    가령 500+300-2+500 이라고 했을때, 연산자 우선순위가 + > - 인경우
    1차 분할:[500+300 , 2+500] (-을 기준으로 피연사자항 분리)
    2차 분할:[[500,300],[2,500]] (+을 기준으로 피연산자항 분리 

    이렇게 피연산자 항이 1개씩으로 분리되면 다시 분리될 때의 연산자를 기준으로 결합된다.

    1차 결합:[500+300,2+500](+을 기준으로 결합)
    2차 결합:[800-502](-을 기준으로 결합)

이러한 방식을 활용하기 위해 Recursion을 활용한다.


```python
from itertools import permutations

def dfs(cnt,expression,operators):
    #피연산자항이 1개가 될때까지 분할
    if cnt==3:
        return int(expression)
    
    operator=operators[cnt]
    #분할 수행
    expression_list=expression.split(operator)
    
    #결합 진행
    result=dfs(cnt+1,expression_list[0],operators)
    
    for i in range(1,len(expression_list)):
        if operator == "+":
            result += dfs(cnt+1,expression_list[i],operators)
        elif operator == "-":
            result -= dfs(cnt+1,expression_list[i],operators)
        elif operator == "*":
            result *= dfs(cnt+1,expression_list[i],operators)   
    return result
        
def solution(expression):
    answer = 0   
    max_result=0
    for permutation in permutations(["+","-","*"]):
        max_result=max(max_result,abs(dfs(0,expression,permutation)))
    answer=max_result
    return answer
```
