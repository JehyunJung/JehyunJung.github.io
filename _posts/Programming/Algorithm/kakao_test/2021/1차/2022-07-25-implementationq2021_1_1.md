---
title: "[Programmers] P72410 신규 아이디 추천"
excerpt: "2021 카카오 공채 1차 문제 1"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P72410 신규 아이디 추천
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/P72410)
## Language: Python

주어진 아이디 추천 알고리짐에 따라 아이디 필터링을 수행한다.
이때, 문자열 처리 과정에서 정규 표현식을 활용하는 것이 좋다.

## Solution

```python
import re
def solution(new_id):
    answer = ''

    #1단계
    new_id=new_id.lower()
 
    #2단계
    new_id=re.sub("[^a-zA-Z0-9-_.]","",new_id)
    
    #3단계
    new_id=re.sub("[.]+",".",new_id)
    
    #4단계
    new_id=new_id.strip(".")
    
    #5단계
    if new_id=="":
        new_id="a"
    
    #6단계
    if len(new_id)>=16:
        new_id=new_id[:15]
        new_id=new_id.strip(".")
    
    #7단계
    if len(new_id)<=2:
        new_id=new_id+new_id[-1]*(3-len(new_id))
    
    answer=new_id
    return answer
```


