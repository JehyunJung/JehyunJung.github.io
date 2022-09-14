---
title: "[Programmers] P42889 실패율"
excerpt: "2019 카카오 공채 1차 문제 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P42889 실패율
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/42889)
## Language: Python

1. 각 단계 별로 해당 단계에 머물러 있는 플레이어 수를 구해서, 실패율을 구한다.

2. 해당 단계를 실패한 플레이어는 다음 단계에 도달하지 못했으므로 그 수 만큼을 플레이어 수에서 감한다.

1~2의 과정을 반복하면서 실패율과, 인덱스 값을 리스트에 저장해서 정렬을 수행한다.

## Solution

```python
def solution(N, stages):
    answer=[]
    num_players=len(stages)
    
    for i in range(1,N+1):
        #1
        count=stages.count(i)

        failure=0
        #만약 해당 스테이지에 도달한 플레이어가 없는 경우 실패율을 0으로 둔다.
        if num_players!=0:
            failure=count/num_players
        
        answer.append((failure,i))
        #2
        num_players-=count
    #3
    answer.sort(key=lambda x: (-x[0],x[1]))
    answer=[x[1] for x in answer]
    
    return answer
```
