---
title: "[Programmers] P67256 키패드 누르기"
excerpt: "2020 카카오 인턴 1"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P67256 키패드 누르기
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/67256)
## Language: Python

## Solution 

이번 문제는 implementation 문제로, 주어진 조건에 따라 처리를 하면된다.

1. 각각의 키패드에 대한 위치 정보 할당
2. 키패드에 따라 왼손/오른손 여부 선택
    - [1,4,7]은 왼손이 처리
    - [3,6,9]는 오른손이 처리
    - [2,5,8,0]은 왼손/오른손의 위치에 따라 거리가 가까운 손이 처리
        - 만약 왼손과 오른손으로부터의 거리가 모두 같은 경우 왼손/오른손잡이의 여부를 통해 결정
    - 키패드를 누르게 되면 왼손/오른손의 위치 정보를 갱신해야한다.
    
```python
def solution(numbers, hand):
    answer = ''
    locations={}
    index=1
    #각 번호에 대해 위치 좌표를 설정
    for i in range(3):
        for j in range(3):
            locations[index]=(i,j)
            index+=1
    locations[0]=(3,1)
    
    #왼손,오른손의 초기 위치 설정
    left_index=(3,0)
    right_index=(3,2)
    result=""
    
    for number in numbers:
        #누를 번호에 대한 위치 정보
        location=locations[number]
        #왼손이 누르는 경우
        if number in [1,4,7]:
            result+="L"
            left_index=location
        #오른손이 누르는 경우
        elif number in [3,6,9]:
            result+="R"
            right_index=location
        else:
            #왼손,오른손으로부터의 거리 비교해서 짧은 쪽이 해당 번호를 누르게 된다. 만약 같으면 왼손잡이/오른손잡이 여부 판단
            left_distance=abs(location[0]-left_index[0])+abs(location[1]-left_index[1])
            right_distance=abs(location[0]-right_index[0])+abs(location[1]-right_index[1])
            #왼손
            if left_distance < right_distance:
                result+="L"
                left_index=location
            #오른손
            elif left_distance> right_distance:
                    result+="R"
                    right_index=location
            #거리가 같은 경우 -> 왼손/오른손잡이에 따라 달라진다.
            else:
                if hand=="left":
                    result+="L"
                    left_index=location
                else:
                    result+="R"
                    right_index=location
                                
                    
    answer=result
    return answer
```
