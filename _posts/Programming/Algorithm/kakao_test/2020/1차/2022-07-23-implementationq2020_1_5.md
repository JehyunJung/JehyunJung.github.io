---
title: "[Programmers] P60061 기둥과 보 설치"
excerpt: "2020 카카오 공채 1차 문제 5"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P60061 기둥과 보 설치
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/P60061)
## Language: Python

build_frame을 통해 주어진 건축 시공 과정에 따라, 건축할 수 있으면, 건축하고, 그렇지 않은 경우 해당 과정을 무시하면서 건축을 이어나간다.

1. 해당 시공이 설치인지/삭제인지에 따라 경우를 나눠서 생각한다.
    - 설치이면, 설치해보고 조건에 부합하면 그대로 놔두고, 부합하지 않으면 설치했던 것을 원복한다.
    - 삭제인 경우도 비슷하게 고려한다.
2. 조건에 부합하는 지 여부를 조사하는 부분은 문제에 주어진 보/기둥의 조건에 따라 구현하면 된다.

## Solution
```python
def check_if_true(answer):
    for x,y,building in answer:
        #기둥인 경우
        if building==0:
            #바닥에 위에 있는 경우
            if y==0:
                continue
            #보의 한쪽 끝 위에 있는 경우
            elif [x-1,y,1] in answer or [x,y,1] in answer:
                continue
                
            #기둥 위에 있는 경우
            elif [x,y-1,0] in answer:
                continue
                    
            else:    
                return False
                                
        #보인 경우
        elif building==1:  
            #보의 한쪽 끝에 기둥이 있는 경우
            if [x,y-1,0] in answer or [x+1,y-1,0] in answer:
                continue

            #보로 둘러쌓인 경우
            elif [x-1,y,1] in answer and [x+1,y,1] in answer:
                continue

            else:    
                return False
                
    return True
    
def solution(n, build_frame):
    answer = []
    for x,y,building,option in build_frame:
        #설치
        if option:
            answer.append([x,y,building])
            if not check_if_true(answer):
                answer.remove([x,y,building])
        #삭제
        else:
            answer.remove([x,y,building])
            if not check_if_true(answer):
                answer.append([x,y,building])

    answer.sort()
    
    return answer
```