---
title: "[Programmers] P17682 다트 게임 "
excerpt: "2018 카카오 공채 1차 문제 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17682 다트 게임
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17682)
## Language: Python

1. 각 다트 점수에 대해서 점수/보너스/옵션을 parsing 해야하는 데 이는 정규 표현식을 이용한다.

2. 보너스를 합한 점수를 계산하며, 옵션을 적용한다.


## Solution

```python
import re
def solution(dartResult):
    answer = [0]*3
    
    points={"S":1,"D":2,"T":3}
    options={"*":2,"#":-1,"":1}
    
    #1
    pattern=re.compile("(\d+)([SDT])([*#]?)")
    groups=pattern.findall(dartResult)
    
    for i in range(3):
      #2
        answer[i]=int(groups[i][0])**(points[groups[i][1]])*options[groups[i][2]]
        
        if i>0 and groups[i][2] == "*":
            answer[i-1]*=options[groups[i][2]]
        
    return sum(answer)
```
