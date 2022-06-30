---
title: "[BOJ] Q2143 두 배열의 합"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - prefix sum
---
# [BOJ] Q2143 두 배열의 합
## [Question](https://www.acmicpc.net/problem/2143)
## Language: Python
## Difficulty: Gold 3

해당 문제는 각 배열의 일부분의 합을 서로 더했을 때 특정 숫자가 되는 경우의 수를 구하는 문제이다.

일부분의 합을 구하기 위해 구간합을 이용한다.

이때, A의 구간합을 defaultdict에 보관해서 특정 합에 대한 개수를 보관하자.단, 모든 조합의 구간합을 구하기 위해 아래와 같은 방식으로 수행한다.

```python
accum_A=[]
 for i in range(numA):
    temp=A[i]
    accum_A.append(temp)
    for j in range(i+1,numA):
        temp+=A[j]
        accum_A.append(temp)
```

이렇게 dictionary에 보관하게 되면 A[] + B[] = T를 만족하는 과정에 특정 B의 구간합에 대해 T-B 구간합의 개수를 dictionary에서 쉽게 찾아낼 수 있다. 이를 통해 반복되는 연산을 최소화할 수 있다.


## Solution

```python
from collections import defaultdict
def solution():
    accum_A=defaultdict(int)
    count=0

    for i in range(numA):
        temp=A[i]
        accum_A[temp]+=1
        for j in range(i+1,numA):
            temp+=A[j]
            accum_A[temp]+=1

    for i in range(numB):
        temp=B[i]
        count+=(accum_A[sub_sum-temp])
        for j in range(i+1,numB):
            temp+=B[j]
            count+=(accum_A[sub_sum-temp])

    print(count)

if __name__ == "__main__":
    sub_sum=int(input())

    numA=int(input())
    A=list(map(int,input().split()))

    numB=int(input())
    B=list(map(int,input().split()))
        
    solution()
```
