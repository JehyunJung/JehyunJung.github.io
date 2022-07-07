---
title: "[Programmers] P92334 신고 결과 받기 "
excerpt: "2022 카카오 공채 문제 1"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P92334 신고 결과 받기
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/92334)
## Language: Python

1. 신고된 사람들에 대한 신고회수를 저장하는 list가 필요하다. 
2. 같은 사람에 대한 신고는 최대 1번으로 치기 때문에, set을 이용해서 중복을 미리 제거한다.
3. 신고를 받은 사람은 신고횟수를 1 증가한다.
4. k번 이상의 신고를 받은 사람을 신고한 사람에 대한 처리 메일 결과 수를 1씩 증가한다.


## Solution

```python
def solution(id_list, report, k):
    answer = [0 for _ in range(len(id_list))]
    #1
    reports={id:0 for id in id_list}
    #2
    report=set(report)
    #3
    for r in report:
        reports[r.split()[1]]+=1
    #4
    for r in report:
        if reports[r.split()[1]]>=k:
            answer[id_list.index(r.split()[0])]+=1
    return answer
```
