---
title: "[Programmers] P81301 숫자 문자열과 영단어"
excerpt: "2021 카카오 인턴 1"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P81301 숫자 문자열과 영단어
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/81301)
## Language: Python

## Solution 

이번 문제는 주어진 문자열에 들어 있는 "one" 과 같은 문자로 나타낸 숫자를 숫자로 변환하면 되는 문제이다.
String class의 replace 함수를 이용해서 쉽게 문자열을 치환할 수 있다.

```python
def solution(s):
    answer = 0
    conversion={
        "zero":"0","one":"1","two":"2","three":"3","four":"4","five":"5","six":"6","seven":"7","eight":"8","nine":"9"
    }
    for key,value in conversion.items():
        s=s.replace(key,value)
    
    answer=int(s)
    return answer
```
