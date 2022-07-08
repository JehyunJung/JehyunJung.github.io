---
title: "[Programmers] P17678 셔틀버스 "
excerpt: "2018 카카오 공채 문제 4"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17678 셔틀버스
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17678)
## Language: Python

1. 셔틀 버스 시간표를 만들어 낸다. 09:00부터 시작해서 n 회수, t분 주기를 가지는 버스 시간표 dictionary를 만들어서 각각의 시간에 대해 리스트를 할당한다.

2. 크루의 도착 시간표를 토대로 버스 시간표에 시간에 맞게 집어 넣는다. 출발 시간에 도착해 있고, 자리가 m 개가 안 됬을 경우에만 추가한다.

3. 전체 크루 정보를 할당하고 나면, 마지막 배차 시간표를 확인한다.

4. 만약 마지막 배차에 자리가 남아있으면 마지막 배차의 출발 시간에 맞춰 콘이 도착하도록 하고, 만약 자리가 꽉 차있으면 마지막에 도착한 인원보다 1분 일찍 도착한다. (같은 시간에 도착하게 되면 그 크루보다 뒤에 서서 버스에 탑승하지 못한다.)

시간:분 단위로 저장되기 때문에 간편하게 비교하기 위해 분으로 다 통일한다.


## Solution

```python
def solution(n, t, m, timetable):
    answer = ''
    #1    
    shuttles={(540+i*t):[] for i in range(n)}
    
    shuttles_keys=list(shuttles.keys())
    index=0
    timetable.sort()
    
    #2
    for time in timetable:
        hour,min=map(int,time.split(":"))
        min+=hour*60
        
        while index < len(shuttles_keys):
            shuttle_time=shuttles_keys[index]
            # 출발 시간 이전에 도착했고, 자리가 남아 있는 경우 추가한다.
            if min <= shuttle_time and len(shuttles[shuttle_time]) < m:
                shuttles[shuttle_time].append(min)
                break
            # 그렇지 않은 경우 다음 배차를 확인한다.
            else:
                index+=1

    #3                
    shuttle_time=shuttles_keys[-1]
    shuttle_waitings=shuttles[shuttle_time]

    #4
    answer=shuttle_time    
    if len(shuttle_waitings)>=m:
        answer=shuttle_waitings[-1]-1
        
    hour=answer//60
    min=answer-hour*60

    answer="%02d:%02d" % (hour,min)

    return answer
```
