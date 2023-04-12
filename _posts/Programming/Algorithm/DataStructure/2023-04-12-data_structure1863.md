---
title: "[BOJ] Q1863 스카이라인 쉬운거"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - data_structure
  - deque
  - boj

---
# [BOJ] Q1863 스카이라인 쉬운거
## [Question](https://www.acmicpc.net/problem/1863)
## Language: Python
## Difficulty: Gold 5

해당 문제는 stack을 활용하여 오름차순 형태로 관리하는 Monotonic Stack를 활용한 문제이다.

현재까지 저장된 건물 중에서 가장 높은 높이(top)보다 큰 값이 들어오게 되면 바로 삽입한다. 만일, top 보다 작은 높이가 탐색 된 경우 top이 작아질때 까지 stack에 pop하고 count을 1증가 시킨다. 이때, top이 같은 값일 경우 count을 증가시키지 않는다. 

## Solution

```python
def solution():
    stack=[]
    count=0

    for height in height_changes:
        #top에 본인보다 큰 값이 있는 경우 빼낸다.
        while stack and stack[-1] >= height:
            #만약 크기가 같은 경우에는 건물의 수를 증가시키지는 않는다.
            if stack[-1] != height:
                count+=1

            stack.pop()

        stack.append(height)

    print(count)
        


if __name__ == "__main__":
    n=int(input())
    height_changes=[list(map(int,input().split()))[1] for _ in range(n)]+[0]
    
    solution()
```