---
title: "[BOJ] Q1039 교환"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - Bruteforce
  - try_again
---
# [BOJ] Q1039 교환
## [Question](https://www.acmicpc.net/problem/1039)
## Language: Python
## Difficulty: Gold 3

해당 문제는 얼핏 보면  순차적으로 앞자리에 높은 숫자값을 배치하면 되는 greedy 유형의 문제로 보일 수 있다. 하지만, 변경횟수가 총 자릿수를 넘어서는 경우가 있기 때문에, greedy 형태로 문제를 풀이할 수 없다. 

따라서, 해당 문제의 경우 BruteForce 방식을 통해 변경횟수 k에 대해 모든 경우를 고려하여 최종적으로 남는 최대값을 구할 수 있다. 이때, visited 배열을 관리하여 중복된 경우에 대한 처리를 배체하여 시간을 단축시킨다.

## Solution

```python
from collections import deque
def solution():
    length=len(n)
    visited=set()

    candidates=[]

    queue=deque([(n,0)])

    while queue:
        numbers,count=queue.popleft()

        #변경횟수가 m번인 경우
        if count==m:
            candidates.append(numbers)
            continue
        
        for i in range(length-1):
            for j in range(i+1,length):
                temp=numbers[:i]+numbers[j]+numbers[i+1:j]+numbers[i]+numbers[j+1:]
                #앞자리에는 0이 올 수 없다.
                if temp[0]=="0":
                    continue
                #이미 처리된 경우인 경우 
                if (temp,count+1) in visited:
                    continue
                
                visited.add((temp,count+1))
                queue.append((temp,count+1))

    #맨 마지막, 즉 모든 변경을 처리한 이후에 남는 값들에 대해 정렬 수행
    candidates.sort()

    print(candidates[-1] if candidates else -1)

if __name__ == "__main__":
    n,m=input().split()
    m=int(m)
    solution()
```