---
title: "[Programmers] P17684 압축"
excerpt: "2018 카카오 공채 3차 문제 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17684 압축
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17684)
## Language: Python

1. 사전 dictionary를 하나 준비한다.
2. 문자열을 앞에서부터 조사해서 사전에 들어있는 가장 긴 문자열 w 을 찾아낸다. 
3. 해당 문자열에 대한 인덱스를 answer list에 추가한다.
4. 해당 단계에서 처리 되지 않은 문자 c에 대해 문자열 w+c를 dictionary에 추가한다.
5. 문자 c 부터 다시 2번의 과정을 이어나간다.

## Solution

```python
def solution(msg):
    answer = []
    #1
    dictionary={k:v for (k,v) in zip(alphabet, list(range(1,27)))}
    
    index=27
    i,j=0,0
    
    while i< len(msg):
        temp=msg[i]
        j=i+1
        #2
        while j < len(msg):
            temp+=msg[j]
            if temp not in dictionary:
                break
            j+=1
        #마지막 문자인 경우 더 이상 검색할 문자가 남지 않아서 해당 인덱스 값을 바로 출력해준다.
        if j==len(msg):
            answer.append(dictionary[temp])
            break
        else:
            i=j
            #4 w+c
            dictionary[temp]=index
            index+=1
            temp=temp[:-1]
            #3 w (위의 temp=temp[:-1]을 통해 문자 c를 제거한다.
            answer.append(dictionary[temp])
                 
            
    return answer
```
