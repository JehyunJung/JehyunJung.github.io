---
title: "[BOJ] Q12919 A와B 2"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - programmers
  - Bruteforce

---
# [BOJ] Q12919 A와B 2
## [Question](https://www.acmicpc.net/problem/12919)
## Language: Python
## Difficulty: Gold 5

해당 문제를 풀이할 때, 시작 문자열을 활용하여 연산을 통해 목표 문자열을 만드는 과정을 진행하게 되면 최대 2<sup>50</sup>의 연산 과정이 발생하게 되므로 시간 초과가 발생하게 된다. 

따라서, 위와 같은 문제는 목표 문자열을 활용하여 시작 문자열을 만드는 것과 같이 역으로 접근해야한다.

> 연산 알고리즘

```python
#맨앞에 B가 오는 경우는 B를 추가하고 뒤집는 경우이므로 이를 역으로 생각하여 B를 제거하고 뒤집는 과정을 적용
if str[0]=="B":
    queue.append((str[:0:-1]))
#맨 뒤가 A가 인경우는 A를 추가하는 연산을 적용한 결과로 만들 수 있다.
if str[-1]=="A":
    queue.append((str[:-1]))
```

## Solution 

```python
from collections import deque
def solution():
    queue=deque([(end)])

    while queue:
        str=queue.popleft()
        if len(str) < len(start):
            continue
        elif len(str)==len(start) and str==start:
            return True
        
        if str[0]=="B":
            queue.append((str[:0:-1]))
        if str[-1]=="A":
            queue.append((str[:-1]))
    
    return False

if __name__ == "__main__":
    start=list(input().strip())
    end=list(input().strip())
    print(1 if solution() else 0)
```
