---
title: "[BOJ] Q1713 후보 추천하기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj

---
# [BOJ] Q1713 후보 추천하기
## [Question](https://www.acmicpc.net/problem/1713)
## Language: Python
## Difficulty: Silver 1

해당 문제는 [q1700]({% post_url 2022-06-18-greedy1700 %}) 처럼 제한된 크기의 리스트를 유지하면서 자리가 없는 경우, 조건에 부합하는 값을 제거하여 추가하는 방식으로 반복하면서 최종적으로 남는 리스트를 출력하는 것이다.

추천수, 등록 시간이 정렬의 기준점이 되기 때문에 이 2개의 값을 리스트에 저장한다.

> 자리가 없을 때, 제거할 대상을 찾는 로직

자리가 없는 경우, 가장 추천수가 작은 학생, 만약 그러한 학생이 두 명이상인 경우 그런 학생들중에서 가장 오래전에 등록된 학생을 제거한다.

```python
if len(candidates) == n:
    candidates.sort(key=lambda x:(x[0],x[1]))
    del candidates[0]
```

## Solution

```python
def solution():
    time=0

    candidates=[]

    for vote in votes:
        #이미 존재하는 학생이면 추천수를 올린다.
        for index in range(len(candidates)):
            vote_count,register_time,student_index=candidates[index]
            if vote==student_index:
                candidates[index]=(vote_count+1,register_time,student_index)
                break
        else:
            #사진틀에 자리가 없는 경우 추천수가 가장 적고 (동률이면 가장 오래된 학생 제거)
            if len(candidates) == n:
                candidates.sort(key=lambda x:(x[0],x[1]))
                del candidates[0]
            candidates.append((1,time,vote))   
            time+=1
    
    candidates.sort(key=lambda x:x[2])
    for candidate in candidates:
        print(candidate[2],end=" ")
        
if __name__ == "__main__":
    n=int(input())
    n_votes=int(input())
    votes=list(map(int,input().split()))
    solution()
```