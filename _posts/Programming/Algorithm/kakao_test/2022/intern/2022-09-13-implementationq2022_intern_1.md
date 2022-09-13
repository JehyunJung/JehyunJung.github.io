---
title: "[Programmers] P118666 성격 유형 검사하기"
excerpt: "2022 카카오 인턴 1"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P118666 성격 유형 검사하기
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/118666)
## Language: Python

각각의 성격 유형 지표 값을 저장하는 dictionary를 두고

주어진 성격 유형 지표의 순서와 choice를 통해 해당 값을 매긴다.

이후, 각각의 유형의 점수를 비교해서 해당 유형을 선택한다.

## Solution 

```python
def solution(survey, choices):
    answer = ''
    #각각의 유형에 대한 점수
    attribute_counts={
        "R":0,"T":0,"C":0,"F":0,"J":0,"M":0,"A":0,"N":0,
    }
    
    length=len(survey)

    #유형별 점수 매기기
    for index in range(length):
        attributes=survey[index]
        choice=choices[index]
        
        if choice < 4:
            attribute_counts[attributes[0]]+=(4-choice)
        elif choice > 4:
            attribute_counts[attributes[1]]+=(choice-4)
    #유형 선택
    for index in ["RT","CF","JM","AN"]:
        if attribute_counts[index[0]]>=attribute_counts[index[1]]:
            answer+=index[0]
        else:
            answer+=index[1]
        
    return answer
```
