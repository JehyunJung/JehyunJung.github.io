---
title: "[Programmers] P81302 거리두기 확인하기"
excerpt: "2021 카카오 인턴 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P81302 거리두기 확인하기
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/81302)
## Language: Python

응시자 간에 거리두기 조항을 만족하고 있는 지 여부를 판단하기 위해 각각의 응시자에 대해 맨허튼 거리 2이하의 영역에 대해 응시자가 있는 지 확인하고 있으면 중간에 파티션이 있는 지 여부를 조사한다.

- 거리가 1인 경우는 무조건 거리두기를 지키지 못하는 상황이다

```python
if place[next_row][next_col]=="P":
    return 0
```

- 가로로 거리가 2인 경우에는 중간지점(1개)에 파티션이 있는지 확인한다

```python
if place[next_row][next_col]=="P":
    if place[row+dy//2][col+dx//2] == "X":
        continue
    else:
        return 0
```
- 대각선으로 거리가 2인 경우에는 2개의 중간 지점 모든 곳에 파티션이 있는지 확인한다.

```python
if place[next_row][next_col]=="P":
    if place[row][next_col] == "X" and place[next_row][col] == "X":
        continue
    else:
        return 0
```

## Solution

```python
def check_if_true(place):
    first_movements=[(-1,0),(1,0),(0,-1),(0,1)]
    second_movements=[(-2,0),(2,0),(0,-2),(0,2)]
    diagonal_movements=[(-1,-1),(-1,1),(1,-1),(1,1)]
    for row in range(5):
        for col in range(5):
            #현재 자리에 응시자가 있을때
            if place[row][col]=="P":
                #거리 1 조사
                for dy,dx in first_movements:
                    next_row=row+dy
                    next_col=col+dx

                    if next_row <0 or next_row>=5 or next_col<0 or next_col >=5:
                        continue
                    #거리가 1만큼 떨어져있는 곳에 응시자가 있는 경우는 어떠한 경우에도 거리두기가 지켜지지 않는다.
                    if place[next_row][next_col]=="P":
                        return 0
                #거리 2 조사(가로)
                for dy,dx in second_movements:
                    next_row=row+dy
                    next_col=col+dx

                    if next_row <0 or next_row>=5 or next_col<0 or next_col >=5:
                        continue

                    #거리가 2 응시자가 있을 때, 중간에 파티션이 있는 경우 거리두기는 지켜진다.
                    if place[next_row][next_col]=="P":
                        if place[row+dy//2][col+dx//2] == "X":
                            continue
                        else:
                            return 0
                #거리 2 조사(대각선)
                for dy,dx in diagonal_movements:
                    next_row=row+dy
                    next_col=col+dx

                    if next_row <0 or next_row>=5 or next_col<0 or next_col >=5:
                        continue

                    #거리가 2 응시자가 있을 때, 중간에 파티션이 있는 경우 거리두기는 지켜진다.
                    if place[next_row][next_col]=="P":
                        if place[row][next_col] == "X" and place[next_row][col] == "X":
                            continue
                        else:
                            return 0
    return 1
        
    
def solution(places):
    answer=[]

    for place in places:
        answer.append(check_if_true(place))
    
    return answer
```
