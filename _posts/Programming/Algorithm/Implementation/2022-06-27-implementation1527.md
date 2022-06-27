---
title: "[BOJ] Q1527 금민수의 개수"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
---
# [BOJ] Q1527 금민수의 개수
## [Question](https://www.acmicpc.net/problem/1527)
## Language: Python
## Difficulty: Silver1

큐를 이용해서 4,7을 이용해서 만들 수 있는 숫자들을 구해본다. 이때, 최소,최대값이 있으므로 해당 사이에 존재하는 숫자들의 갯수를 구해주면 된다.

## Solution

```python
from collections import deque
def solution():
    count=0
    queue=deque([4,7])
    while queue:
        value=queue.popleft()

        if min_num<=value<=max_num:
            count+=1
        if value> max_num:
            break

        for concat_value in [4,7]:
            queue.append(value*10 + concat_value)
    return count

if __name__ == "__main__":
    min_num,max_num=map(int,input().split())
    print(solution())
```
