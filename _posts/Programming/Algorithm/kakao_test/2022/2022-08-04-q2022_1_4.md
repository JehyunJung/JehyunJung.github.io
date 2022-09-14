---
title: "[Programmers] P92342 양궁대회"
excerpt: "2022 카카오 공채 문제 4"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P92342 양궁대회
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/92342)
## Language: Python

해당 문제는 라이언이 쏠 수 있는 모든 경우의 수에 대해서 조사하는 완전 탐색 유형의 문제이다.
우선 n발을 쏘면, 0~10 까지의 점수를 얻을 수 있다. 
0~10 발을 중복해서 n개를 고르는 중복조합으로 해석해서 문제를 풀이할 수 있다.

또는, dfs을 통해 점수를 하나씩 채워가는 방향으로도 생각해볼 수 있다.
각각의 점수에 대해서, 라이언은 어피치 보다 1개 맞추거나, 맞추지 않은 2가지 경우가 존재한다.
점수를 채워가다 화살이 다 쓰게 되면 나머지 점수에 대해서는 0발 처리를 하면 되고, 1점때까지 채우고 화살이 남은 경우, 남은 화살은 0점으로 처리하면 된다.

두 가지 방식으로 라이언의 화살 정보를 얻었으면, 이제는 어피치와의 화살을 비교하면서, 최대 차이를 가지는 라이언의 화살의 정보를 구하면 된다.

**단, 최대 차이를 가지는 화살의 정보가 여러개면, 가장 낮은 점수를 더 많이 맞춘 화살 정보를 선택한다. 중복조합을 이용하게 되면 정렬된 조합의 형태로 진행되기 때문에, 해당 부분을 고려할 필요가 없다. 하지만 DFS의 경우, 최대 차이가 같은 리스트에 대해서 비교하는 부분이 필요하다.**

> combinations_with_replacement

```python
#0~3 사이의 숫자를 중복 사용해서 만들 수 있는 2자리 조합
combinations_with_replacement(range(4),2)
[(0, 0), (0, 1), (0, 2), (0, 3), (1, 1), (1, 2), (1, 3), (2, 2), (2, 3), (3, 3)]
```

## Solution 1

```python
from itertools import combinations_with_replacement

def solution(n, info):
    answer=[-1]
    max_difference=0
    #중복 조합을 이용하게 되면 낮은 숫자로 이루어진 조합 부터 ~ 높은 숫자로 이루어진 조합까지 정렬된 상태로 반환된다.
    for combination in combinations_with_replacement(range(11),n):
        ryan_info=[0]*11
        #낮은 숫자 -> 낮은 인덱스 -> 높은 점수를 의미하므로, 처음 부터 낮은 점수를 검사하는 방향으로 진행하게 되면 저절로 최대차이를 가지는 리스트가 낮은 점수가 많은 리스트가 되게 된다.
        for i in combination:
            ryan_info[(10-i)]+=1
        
        apache=0
        ryan=0
        for i in range(10):
            if info[i]==0 and ryan_info[i]==0:
                continue
            if info[i] >= ryan_info[i]:
                apache+=(10-i)
            else:
                ryan+=(10-i)

        #만약 apache의 최종점수가 높은 경우
        if apache >= ryan:
            continue
        #라이언이 높은 경우
        dif=ryan-apache
        if max_difference < dif:            
            max_difference=dif
            answer=ryan_info

    return answer
```

## Solution 2

```python
 answer=[]
max_difference=-1
apache_info=[]

def dfs(n,index,ryan_info):
    global answer,max_difference,apache_info
    if n ==0 or index ==10:     
        #남은 화살이 없는 경우, 나머지 점수에 대해서 0발 처리
        if n ==0:
            ryan_info.extend([0]*(11-len(ryan_info)))
        #만약 0점까지 남은 화살이 있는 경우 0점에 나머지 발 처리
        else:
            ryan_info.append(n)
        #점수 계산
        apache=0
        ryan=0
        for i in range(10):
            if apache_info[i]==0 and ryan_info[i]==0:
                continue
            if apache_info[i] >= ryan_info[i]:
                apache+=(10-i)
            else:
                ryan+=(10-i)

        #만약 apache의 최종점수가 높은 경우
        if apache >= ryan:
            return
        
        #라이언이 높은 경우
        dif=ryan-apache
        if max_difference == dif:
            answer.append(ryan_info)
        elif max_difference < dif:
            max_difference=dif
            answer=[ryan_info] 
        return
    
    #apache가 해당 점수에서 쏜 발 수보다 한발 더 맞춘 경우
    num=apache_info[index]+1
    if n >=num:
        dfs(n-num,index+1,ryan_info+[num])
    #해당 점수에 화살을 맞추지 않는 경우
    dfs(n,index+1,ryan_info+[0])

def solution(n, info):
    global answer,max_difference,apache_info
    
    answer=[]
    max_difference=-1
    apache_info=info
    
    dfs(n,0,[])
    
    if answer == [] :
        return [-1]

    answer.sort(key=lambda x:x[::-1],reverse=True)
    return answer[0]
```
