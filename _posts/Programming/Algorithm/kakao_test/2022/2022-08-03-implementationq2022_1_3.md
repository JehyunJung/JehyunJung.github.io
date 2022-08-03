---
title: "[Programmers] P92341 주차 요금 계산"
excerpt: "2022 카카오 공채 문제 3"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P92341 주차 요금 계산
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/92341)
## Language: Python

주어진 문제의 조건에 따라 명확하게 구현 하면 된다.

1. 차량의 총 주차 누적 시간, 입차 시간, 주차 상태를 저장하는 dictionary를 만든다.
2. 주차 기록에 따라 누적시간, 입차 시간, 주차 상태를 최신화시킨다.
3. 끝까지 출차하지 않은 차량들에 대해서 마지막 시간을 기준으로 경과한 시간 만큼 누적 시간에 추가시킨다.
4. 주차요금 계산 방식에 따라 각 차량별 주차요금을 계산한다.

이때, 차량 번호에 대해서 정렬을 진행한 후 3번을 진행하게 되면, 최종적으로 차량 번호가 낮은 순으로 주차 요금을 쉽게 구할 수 있다.

## Solution

```python
from math import ceil
from collections import defaultdict
#HH:MM을 분 단위로 변환해주는 함수
def time_to_minute(time):
    fragments=time.split(":")
    return int(fragments[0])*60+int(fragments[1])

def solution(fees, records):
    answer = []
    car_parking_info=dict()
    #주차 기록에 따라, 누적시간, 입차 시간, 주차 상태를 최신화한다.
    for record in records:
        time,car_info,option=record.split(" ")
        #totaltime time status로 저장
        if car_info not in car_parking_info:
            car_parking_info[car_info]=(0,0,"")
        if option=="IN":
            car_parking_info[car_info]=(car_parking_info[car_info][0],time_to_minute(time),"IN")
        else:
            car_parking_info[car_info]=(car_parking_info[car_info][0]+time_to_minute(time)-car_parking_info[car_info][1],0,"OUT")

    #차량 번호에 대해서 정렬을 수행한다.
    car_infos=list(car_parking_info.keys())
    car_infos.sort()
    
    #주차 요금 계산
    for car_info in car_infos:
        total_time,time,status=car_parking_info[car_info]
        #아직 차량이 입차 중인 경우 입차 시간을 기준으로 마지막 시간인 23:59까지의 시간 차이를 누적 시간에 추가시킨다.
        if status == "IN":
            total_time+=(1439-time)
        
        #기본 시간을 넘긴 경우
        if total_time >= fees[0]:
            answer.append(fees[1]+ceil((total_time-fees[0])/fees[2])*fees[3])
        #기본 시간 인 경우
        else:
            answer.append(fees[1])
    
    return answer
```
