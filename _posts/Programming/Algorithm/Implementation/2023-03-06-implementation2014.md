---
title: "[BOJ] Q2014 소수의 곱"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - prime_numbers
---
# [BOJ] Q2014 소수의 곱
## [Question](https://www.acmicpc.net/problem/2014)
## Language: Python
## Difficulty: Gold 1

소수의 곱들로 만들 수 있는 숫자들을 정렬해서 N 번째 오는 값을 구하는 문제로, Heap을 활용하여 간단하게 구현하는 것이 가능하다.

하지만, 주의해야할 점은 소수의 곱을 구하는 과정에서 중복이 발생할 수 있다는 부분이다. 아래의 예시를 확인해보자

||2|3|5|7|
|--|--|--|--|--|
|2|2x2|2x3|2x5|2x7|
|3|3x2|3x3|3x5|3x7|
|5|5x2|5x3|5x5|5x7|
|7|7x2|7x3|7x5|7x7|

보면 대각선을 기준으로 아랫쪽과 윗쪽이 서로 중복되는 부분을 확인할 수 있다. 이를 해결하기 위해 heap에 저장되어 있는 값이 특정 소수에 나눠떨어지기 전까지만 곱셈을 처리하므로써 중복연산을 피하여 메모리 초과 문제를 해결할 수 있다.


## Solution 

```python
from heapq import heappush,heappop,heapify
def solution():
    last_result=0
    heap=primes[:]
    heapify(heap)

    for _ in range(n):
        last_result=heappop(heap)
        
        for prime in primes:
            heappush(heap,last_result*prime)

            if last_result % prime==0:
                break

    print(last_result)


if __name__ == "__main__":
    k,n=map(int,input().split())
    primes=list(map(int,input().split()))

    solution()
```
