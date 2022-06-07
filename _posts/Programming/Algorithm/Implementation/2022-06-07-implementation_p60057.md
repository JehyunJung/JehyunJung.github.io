---
title: "[Programmers] 문자열 압축"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
---
# [Programmers] Q60057 문자열 압축
## [Question](https://programmers.co.kr/learn/courses/30/lessons/60057)
## Language: Python

주어진 문자열에 대해 반복되는 부분을 문자열과 반복 횟수를 이용해서 압축을 진행하여, 압축해서 얻을 수 있는 최소 길이의 문자열을 구하는 것이다. 반복되는 문자열의 길이를 1부터 문자열 길의 절반까지 진행했을때, 최소 길이를 구하면 된다.

문제의 입력 조건을 보면 최대 문자열의 길이는 1000이므로, 문자열 단위 1~500의 경우 대해서 모두 검사한다고 하더라도 시간 내에 문제풀이가 가능하다.


## Solution

```python
def solution(s):
    length=len(s)
    answer=length
    for token_length in range(1,length//2 +1):
        compressed_string=""
        index=0
        while index < length:
            token=s[index:index+token_length]
            token_repetition=1
            index+=token_length
            while token == s[index:index+token_length]:
                token_repetition+=1
                index+=token_length
            if token_repetition >1:
                compressed_string+=(str(token_repetition)+token)
            else:
                compressed_string+=token
        answer=min(answer,len(compressed_string))
        
    return answer
```
