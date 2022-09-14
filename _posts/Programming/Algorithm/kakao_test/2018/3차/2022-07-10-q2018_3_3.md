---
title: "[Programmers] P17686 파일명 정렬"
excerpt: "2018 카카오 공채 3차 문제 3"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17686 파일명 정렬
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17686)
## Language: Python

1. 주어진 파일 이름에 대해서, head, number, 이외 부분으로 파싱해야된다.
2. 해당 부분에 head, number 기준으로 정렬을 수행한다.
(head 는 대소문자 구분 없이, number는 숫자에 대한 정렬을 수행해야한다. ("010" -> 10))

[regex](https://www.w3schools.com/python/python_regex.asp)

## Solution

```python
 import re
def solution(files):
    answer = []
    pattern=re.compile("([^0123456789]+)(\d{1,5})")
    
    temp=[]
    #1
    for file in files:
        segments=pattern.findall(file)[0]
        temp.append((segments[0].lower(),int(segments[1]),file))
    #2 
    temp.sort(key=lambda x: (x[0],x[1]))
    answer=[file for head,number,file in temp]
    return answer
```


