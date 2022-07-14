---
title: "[Programmers] P17683 방금그곡"
excerpt: "2018 카카오 공채 3차 문제 4"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17683 방금그곡
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17683)
## Language: Python

1. C#, D#, 와 같은 음에 대해서 한 문자로 인식할 수 있도록 특정 문자로 치환하도록 한다

2. HH:MM 형태로 되어 있는 문자를 파싱해서 해당 문자에 대해 분 형태로 나타낼 수 있는 함수를 구현한다.

3. 재생시간 동안 재생되는 멜로디의 배열을 만들어낸다.

4. 기억하는 멜로디와 재생된 멜로디를 서로 비교해서 일치하는 부분이 있으면, 이때까지 살펴본 재생 길이와 비교를 해서 재생길이가 가장 긴 경우 최신화 한다.
    - 기억하는 멜로디가 재생된 멜로디 속에 포함될 수도 있고, 
    - 재생된 멜로디가 기억하는 멜로디 속에 포함될 수 있으므로 두 경우 모두를 비교해야한다.


## Solution

```python
#1
def melody_convertion(melody):
    convertion={
        "C#":"H",
        "D#":"I",
        "F#":"J",
        "G#":"K",
        "A#":"L"
    }
    
    for key,value in convertion.items():
        melody=melody.replace(key,value)
    return melody
#2
def time_convertion(time_str):
    time_segments=time_str.split(":")
    return int(time_segments[0]) *60 + int(time_segments[1])

def solution(m, musicinfos):
    answer = ''
    max_duration=0
    max_match=0
    
    #기억하는 멜로디에 대해서 #이 붙은 음표를 변환한다.
    m=melody_convertion(m)
    musicinfos.sort()
    
    for music in musicinfos:
        start,end,name,melody=music.split(",")        
        duration=time_convertion(end)-time_convertion(start)
        
        #재생된 멜로디에 대해서 #이 붙은 음표를 변환한다. 전체 재생된 멜로디를 만들기 전에 변환 작업을 먼저 해줘야한다....
        melody=melody_convertion(melody)
        #3 재생길이가 주어진 악보의 길이보다 길면 반복이 있다는 것이고, 그렇지 않으면 일부분만 재생되게 된다.
        played_melody=melody*(duration//len(melody))+melody[:duration%len(melody)]
        
        #4-1
        if len(m) < len(played_melody):
            if m in played_melody and len(played_melody) > max_duration:
                max_duration=len(played_melody)
                answer=name
        #4-2
        else:
            if played_melody in m  and len(played_melody) > max_duration:
                max_duration=len(played_melody)
                answer=name   
                
    if answer=="":
        answer="(None)"
        
    return answer
```


