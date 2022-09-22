---
title: "[Programmers] P68646 풍선 터트리기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - programmers
  - try_again
---
# [Programmers] P68646 풍선 터트리기
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/68646)
## Language: Python
## Difficulty: Gold 4~5?

이번 문제는 문제의 내용을 이해하는 것이 중요하다
인접한 풍선을 골라서, 터뜨리는 과정을 반복하는데, 번호가 작은 풍선을 터뜨리는 기회는 오직 한번이다. 

위와 같은 규칙이 존재할 때, 최후에 남을 수 있는 풍선의 개수를 구하는 것이 목적이다.

풍선을 터뜨리를 수 없는 경우는 아래와 같이, 자신을 기준으로, 왼쪽의 최솟값보다 크고, 오른쪽의 최솟값보다 크게 되면 해당 풍선은 최후까지 남을 수 없다.

```
[-2, 1,-4]
```

> [-2,1] 선택 시

- -2를 선택하는 경우, [1,-4] 항상 1을 선택해야하므로 1은 제거될 수 밖에 없다.

> [1,-4] 선택 시

- -4를 선택하는 경우, [-2,1] 항상 1을 선택해야하므로 1은 제거될 수 밖에 없다.


즉, 양옆의 최소값보다 모두 큰 경우, 항상 제거 될 수 밖에 없다. 따라서, 리스트를 순회하면서 왼쪽, 오른쪽의 최솟값에 대해서 비교하면서, 데이터가 남을 수 있는지 없는지를 판단해야한다.


## Solution

```python
from math import inf

def solution(a):
    data_length=len(a)
    available=[0] * data_length
    
    min_left,min_right=inf,inf
    
    for i in range(data_length):
        if a[i] < min_left:
            min_left= a[i]
            available[i]=1
            
        if a[-i-1] < min_right:
            min_right= a[-i-1]
            available[-i-1]=1
            
    answer=sum(available)
    return answer
```