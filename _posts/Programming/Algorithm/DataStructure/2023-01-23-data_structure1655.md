---
title: "[BOJ] Q1655 가운데를 말해요"
excerpt: "Data Structure 활용하는 유형"

categories:
  - codetest
tags:
  - data_structure
  - stack
  - programmers
  - Bruteforce

---
# [BOJ] Q1655 가운데를 말해요
## [Question](https://www.acmicpc.net/problem/1655)
## Language: Python
## Difficulty: Gold 2

해당 문제는 최대힙과 최소힙을 활용하여 문제를 풀이하는 문제이다.

왼쪽에는 최대힙을 활용하고, 오른쪽에는 최소힙을 활용하여 항상 중앙값이 최대힙의 가장 큰 값이 되도록한다.

heap에 데이터를 넣을 때는 아래와 같이 길이가 동일한 경우 왼쪽에, 그렇지 않은 경우 오른쪽에 넣는다.

![heap_insertion](/assets/images/algorithm/q1655.jpg)

또한, 왼쪽의 최대값과 오른쪽의 최솟값을 비교해서 중앙값을 맞춰준다.

![heap_exchange](/assets/images/algorithm/q1655_1.jpg)

## Solution

stack을 활용하는 방식

![2493_stack](/assets/images/algorithm/2493_stack.jpg)

현재 탑이 이전에 저장된 탑 보다 크기 작을 때까지 스택에서 저장된 탑들을 pop을 반복하고 top보다 작은 경우가 발생하였을 때 해당 top의 index값을 정답에 추가한다.

만약, stack이 비는 경우는 현재 탑이 가장 크기가 큰 것이므로 수신할 수 있는 레이더가 없기 때문에 정답에 0을 추가한다. 

그런 다음, 마지막으로 해당 탑의 정보를 stack에 추가한다.

```python           
from heapq import heappush,heappop
def solution():
    left_heap,right_heap=[],[]
    left_count,right_count=0,0

    for index in range(n):
        data=datas[index]
        if left_count != right_count:
            heappush(right_heap,data)
            right_count+=1
        else:
            heappush(left_heap,-data)
            left_count+=1

        
        if right_heap and -left_heap[0] > right_heap[0]:
            left_data=-heappop(left_heap)
            right_data=heappop(right_heap)
            heappush(right_heap,left_data)
            heappush(left_heap,-right_data)
        
        print(-left_heap[0])   

if __name__ == "__main__":
    n=int(input())
    datas=[]

    for _ in range(n):
        datas.append(int(input()))
    
    solution()
```
