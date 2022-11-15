---
title: "[SWEA] Q1859 백만장자 프로젝트"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - samsung
---
# [SWEA] Q1859 백만장자 프로젝트
## [Question](https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=AV5LrsUaDxcDFAXc)
## Language: Python
## Difficulty: D2

항상 판매는 최대값을 가지는 부분에서 이루어진다. 가장 큰 보상을 가지는 경우는 가장 높은 매매가에서 1차 판매를 진행하고, 해당 매매가 다음에 가장 높은 매매가 나오는 날에 2차 판매 ... 이런식으로 매매를 진행해야한다.

따라서, 최대값들을 찾아줘야한다.

```python
def find_max_value_index(arr,index):
    max_value=0
    max_index=0
    for i in range(index,n):
        value=arr[i]

        if value > max_value:
            max_value=value
            max_index=i

    return max_value,max_index

def solution():
    reward=0
    index=0
    max_values=[]

    while index != n:
        max_value,max_index=find_max_value_index(prices,index)
        max_values.append(max_value)
        index=max_index+1

```

이렇게, 최대값들을 구해준 다음에는 매매를 진행하면 된다.

```python
for price in prices:
        if price==max_values[0]:
            max_values.pop(0)
        else:
            reward+=(max_values[0]-price)
```

## Solution 1

```python
def find_max_value_index(arr,index):
    max_value=0
    max_index=0
    for i in range(index,n):
        value=arr[i]

        if value > max_value:
            max_value=value
            max_index=i

    return max_value,max_index

def solution():
    reward=0

    index=0
    max_values=[]

    while index != n:
        max_value,max_index=find_max_value_index(prices,index)
        max_values.append(max_value)
        index=max_index+1

    for price in prices:
        if price==max_values[0]:
            max_values.pop(0)
        else:
            reward+=(max_values[0]-price)

    return reward


if __name__ == "__main__":
    n=0
    prices=[]
    testcases=int(input())
    for case in range(testcases):
        n=int(input())
        prices=list(map(int,input().split()))
        print("#{} {}".format(case+1,solution()))
```

하지만 위와 같이 모든 최대값을 가지는 지점들을 찾게 되면 무수히 많은 반복이 수행된다. 그래서 반복을 최소화하기 위해 역산을 진행한다.
마지막 날의 매매가격을 최대값을 잡은 후, 해당 값보다 작은 매매가격에 대해서는 구매를 수행하면 된다. 만약 마지막 날의 매매가격 보다 높은 매매가를 가지는 날이 나오게 되면 그날의 매매가를 최대값을 잡은 후 계속 작업을 이어나간다.

## Solution 2

```python
def solution():
    reward=0

    max_value=prices[-1]

    for index in range(n-2,-1,-1):
        price=prices[index]

        if price > max_value:
            max_value=price
        else:
            reward+=max_value-price

    return reward

if __name__ == "__main__":
    n=0
    prices=[]
    testcases=int(input())
    for case in range(testcases):
        n=int(input())
        prices=list(map(int,input().split()))
        print("#{} {}".format(case+1,solution()))
```