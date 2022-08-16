---
title: "[BOJ] Q14891 톱니바퀴"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q14891 톱니바퀴
## [Question](https://www.acmicpc.net/problem/14891)
## Language: Python
## Difficulty: Gold 5

특정 톱니바퀴를 회전시키게 되면, 맞물려있는 축에 따라 인접한 톱니바퀴가 회전할 수도 있고, 안 할 수도 있는데, 

해당 문제를 풀이할 때, 가장 중요한 것은, 톱니바퀴의 회전은 마지막에 한꺼번에 이루어진다는 점이다, 즉 하나의 톱니바퀴를 회전시킬 때, 다른 인접한 톱니바퀴도 함께 움직이게 되므로, 우선적으로 회전하는 톱니바퀴를 먼저 구해야한다.

필요한 함수 목록

1. 회전을 반영하는 함수, 시계/반시계 방향
2. 회전하는 톱니바퀴를 기준으로 왼쪽에 있는 톱니바퀴들 조건 검색, 오른쪽에 있는 톱니바퀴에 대해서도 조건 검색



```python
from collections import deque
def clockwise(wheel):
    end=wheel.pop()
    wheel.appendleft(end)

def counter_clockwise(wheel):
    end=wheel.popleft()
    wheel.append(end)

def solution():
    for wheel_num,direction in rotations:
        #1번 톱니바퀴는 0번 index에 존재한다.
        wheel_num-=1
        #회전이 이루어지는 톱니바퀴 목록
        rotated_wheels=[]

        rotated_wheels.append((wheel_num,direction))

        right_wheel=wheel_num
        right_direction=direction

        #왼쪽 비교
        for left_wheel in range(right_wheel-1,-1,-1):
            #극이 같은 경우 회전을 수행하지 않는다.
            if wheels[right_wheel][6] == wheels[left_wheel][2]:
                break
            #극이 다른 경우
            else:
                #다음 톱니바퀴 비교를 오른쪽 톱니바퀴를 새로 갱신한ㄷ.
                right_wheel=left_wheel
                #인접한 톱니바퀴는 해당 톱니바퀴의 회전 방향의 반대방향으로 회전한다.
                right_direction*=-1
                
                rotated_wheels.append((right_wheel,right_direction))
        
        left_wheel=wheel_num
        left_direction=direction

        #오른쪽 비교
        for right_wheel in range(left_wheel+1,4):
             #극이 같은 경우 회전을 수행하지 않는다.
            if wheels[left_wheel][2] == wheels[right_wheel][6]:
                break
            #극이 다른 경우
            else:
                left_wheel=right_wheel
                left_direction*=-1
                rotated_wheels.append((left_wheel,left_direction))

        #마지막에 회전이 되는 톱니바퀴들을 회전시킨다.
        for wheel_num, direction in rotated_wheels:
            if direction == -1:
                counter_clockwise(wheels[wheel_num])
            else:
                clockwise(wheels[wheel_num])
    #톱니바퀴의 12시 방향에 있는 점에 대해서 계산을 수행한다. S극이면 -> 점수 포함
    count=0
    for i in range(4):
        if wheels[i][0]==1:
            count += (2**i)

    return count

if __name__ == "__main__":
    wheels=[deque(list(map(int,input().strip()))) for _ in range(4)]
    num=int(input())
    rotations=[list(map(int,input().split())) for _ in range(num)]
    
    print(solution())

```
