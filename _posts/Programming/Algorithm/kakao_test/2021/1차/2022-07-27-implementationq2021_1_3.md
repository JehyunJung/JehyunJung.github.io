---
title: "[Programmers] P72412 순위 검색"
excerpt: "2021 카카오 공채 1차 문제 3"

categories:
  - codetest
tags:
  - binary_search
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P72412 순위 검색
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/72412)
## Language: Python

해당 문제는 정확성과 효율성 모두를 만족해야하는 문제로 시간 복잡도가 최대 O(N) 을 넘어가서는 안된다.
그래서 보통은, 이런 유형은 Binary Search 기법을 활용해야한다.

주어진 옵션의 경우의 수를 이용해서 모든 조합을 구해서 이를 dictionary에 key를 구성한다. 그런 후, query를 이용해서 key값으로 만들고 나서 해당 key값에 대한 학생들의 리스트를 이용해서 Binary Search를 통해 해당 점수 이상의 학생 수를 구하도록 한다. 그렇게 하면 모든 학생들을 순차적으로 조회 할 필요없이, 해당하는 키값을 가지는 학생들을 추출할 수 있고, 해당 리스트에서 특정 점수 이상 받은 학생 수를 구할 수 있다.

## Solution 1

```python
from bisect import bisect_left
def solution(info, query):
    data = dict()
    #주어진 직무에 대한 모든 조합에 대해 키값을 생성
    for a in ['cpp', 'java', 'python', '-']:
        for b in ['backend', 'frontend', '-']:
            for c in ['junior', 'senior', '-']:
                for d in ['chicken', 'pizza', '-']:
                    data.setdefault((a, b, c, d), list())
    #학생 정보를 이용해서 해당하는 부분의 dictionary에 저장한다.
    #이때, 모든 옵션에 대해서, "-" 부분은 추가로 등록해주도록 한다.
    for i in info:
        i = i.split()
        for a in [i[0], '-']:
            for b in [i[1], '-']:
                for c in [i[2], '-']:
                    for d in [i[3], '-']:
                        data[(a, b, c, d)].append(int(i[4]))

    for k in data:
        data[k].sort()

    answer = list()
    for q in query:
        q = q.split()

        pool = data[(q[0], q[2], q[4], q[6])]
        find = int(q[7])

        answer.append(len(pool)-bisect_left(pool,find))

    return answer
```
아래의 코드의 경우, Bitmasking을 이용해서 해당 직무를 선택했는 지 여부를 판단하고 있다.

## Solution 2

```python
from collections import defaultdict
from bisect import bisect_left
def str_to_bit(infos):
    type_conversion={
        "cpp":1,
        "java":2,
        "python":3,
        "backend":4,
        "frontend":5,
        "junior":6,
        "senior":7,
        "chicken":8,
        "pizza":9
    }
    bit=0
    for info in infos:
        bit |= 1 << type_conversion[info]
    return bit

def solution(info, query):
    answer = []
    student_infos=defaultdict(list)
    #student info 등록하는 작업
    for student_info in info:
        options=student_info.split(" ")
        techs=options[:4]
        score=int(options[4])
        student_infos[str_to_bit(techs)].append(score)

    for student_scores in student_infos.values():
        student_scores.sort()
    
    #쿼리 수행
    for question in query:
        question=question.replace(" and","").replace(" -","").replace("- ","")
        options=question.split(" ")
        
        techs=options[:-1]
        score=int(options[-1])
        tech_bit=str_to_bit(techs)
        
        count=0
        for student_tech_info in student_infos.keys():
            #쿼리의 직무 내용이 포함되어 있는 키값을 조회해서 해당하는 학생들 리스트에 대해서 특정 점수를 만족하는 학생의 수를 구하도록 한다.
            if tech_bit & student_tech_info == tech_bit:
                count+=len(student_infos[student_tech_info])-bisect_left(student_infos[student_tech_info],score)
   
        answer.append(count)
            
    
    return answer
```
