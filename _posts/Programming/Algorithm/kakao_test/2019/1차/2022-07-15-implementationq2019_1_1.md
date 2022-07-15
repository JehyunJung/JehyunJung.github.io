---
title: "[Programmers] P42888 오픈채팅방"
excerpt: "2019 카카오 공채 1차 문제 1"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P42888 오픈채팅방
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/42888)
## Language: Python

1. 유저 아이디에 대한 닉네임을 기록할 수 있는 dictionary를 생성한다.

2. 들어오거나, 닉네임을 수정하게 되는 경우에는 닉네임을 새로 등록한다.

3. dictionary에 저장된 닉네임에 따라 들어오고, 나간 유저에 대한 로그를 찍어낸다.

## Solution

```python
def solution(record):
    answer = []
    #1
    members={}
    for message in record:
        #입력받은 문자열을 파싱해서, message, id, name으로 분리한다.
        message_segments=message.split(" ")
        action=message_segments[0]
        id=message_segments[1]
        #2
        if action != "Leave":
            name=message_segments[2]
            members[id]=name

    #3
    for message in record:
        message_segments=message.split(" ")
        action=message_segments[0]
        id=message_segments[1]
        if action=="Enter":
            answer.append("{}님이 들어왔습니다.".format(members[id]))
        elif action =="Leave":
            answer.append("{}님이 나갔습니다.".format(members[id]))
  
    
    return answer
```
