---
title: "[Programmers] 오픈 채팅방"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - codetest
  - Programmers
  - implementation
---
# [Programmers] 오픈 채팅방
## [Question](https://programmers.co.kr/learn/courses/30/lessons/42888)
## Language: Python

유저 id와 이름을 저장하고 있는 dictionary 형태의 변수를 생성해서 유지 하고 있다가, 모든 닉네임이 수정이 완료된 다음, 들어왔습니다. 나갔습니다 와 같은 메세지들을 추가해주면 된다.

데이터가 100,000 개 이므로 O(n<sup>2</sup>) 이하의 알고리즘을 수행해야한다.

## Solution

```python
def solution(record):
    answer = []
    members={}
    for message in record:
        message_segments=message.split(" ")
        action=message_segments[0]
        id=message_segments[1]
        
        if action != "Leave":
            name=message_segments[2]
            members[id]=name

    
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
