---
title: "[Programmers] P118667 두 큐 합 같게 만들기"
excerpt: "2022 카카오 인턴 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P118667 두 큐 합 같게 만들기
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/118667)
## Language: Python

두 개의 queue에 대해 서로 값을 pop/append 하는 과정을 두개의 queue의 합이 일치할 때까지 반복한다.

항상 반복을 수행할 때는, 합이 큰 쪽에서 작은 쪽으로 이동을 시킨다. --> 이러한 반복과정을 최대 두 큐의 길이의 합 만큼 수행할 수 있는데, 주어진 문제의 조건에 최대 길이는 30만이라 나와 있으므로, 최대 600000 번의 반복을 수행할 수 있다.

> 주의점

인자로 주어진 list을 사용하게 되면 시간 초과가 발생하기 때문에, python의 deque 모듈을 이용해야한다.

아래 게시글을 확인해보면 삽입삭제가 빈번하게 발생하는 경우, deque를 활용하는 것이 효율적임을 알 수 있다.

[list_vs_deque]({% post_url 2022-09-13-list_vs_deque %})

## Solution 

```python
from math import inf
from collections import deque
def solution(queue1, queue2):
    answer = inf
    
    queue1=deque(queue1)
    queue2=deque(queue2)
    
    sum1=sum(queue1)
    sum2=sum(queue2)
    count=0
    
    while count <=600000:
        if sum1 < sum2:
            value=queue2.popleft()
            sum2-=value
            sum1+=value
            queue1.append(value)
        elif sum1 > sum2:
            value=queue1.popleft()
            sum1-=value
            sum2+=value
            queue2.append(value)
        else:
            answer=count
            break
        count+=1    
        
    return answer if answer !=inf else -1
```
