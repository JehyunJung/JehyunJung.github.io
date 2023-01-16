---
title: "[BOJ] Q1253 좋다"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - programmers
  - Bruteforce
  - two_pointer

---
# [BOJ] Q1253 좋다
## [Question](https://www.acmicpc.net/problem/1253)
## Language: Python
## Difficulty: Gold 4

처음에 문제를 이해하지 못해서 무작정 서로 다른 수의 합을 구해서 매칭시켰다.

> Failed

```python
def solution():
    combinations=set()
    for i in range(n):
        for j in range(i+1,n):
            combinations.add(numbers[i]+numbers[j])
    
    count=0
    for number in numbers:
        if number in combinations:
            count+=1

    return count
if __name__ == "__main__":
    n=int(input())
    numbers=list(map(int,input().split()))

    print(solution())
```

하지만, 해당 문제에서 요구하는 것은 주어진 수의 집합 속에서 특정 숫자가 다른 두 수의 합을 만족하는 경우의 갯수를 구하는 것으로, 두 수의 합 또한 배열에 포함되어 있어야한다. 즉, 숫자1,숫자2,숫자1+숫자2 모두 배열에 존재할때 숫자1+숫자2가 좋다라고 할 수 있는 것이다. 그렇기 때문에 각각의 숫자 갯수를 고려해서 문제를 풀이해야한다.

## Solution 1

```python
from collections import defaultdict
def solution():
    number_counter=defaultdict(int)

    for number in numbers:
        number_counter[number]+=1

    count=0

    target_numbers=sorted(list(number_counter.keys()))
    handled=set()

    for operand1 in target_numbers:
        for operand2 in target_numbers:
            result=operand1+operand2

            #사용한 횟수만큼 count수 감소
            number_counter[operand1]-=1
            number_counter[operand2]-=1
            number_counter[result]-=1

            # 숫자를 사용하고 난 이후에 숫자에 대한 갯수가 음수일 경우 해당 숫자를 다른 두 수의 합으로 나타내지 못함을 의미하기 때문에 해당 숫자는 좋다라고 할 수 없다.
            if number_counter[operand1] >=0 and number_counter[operand2] >=0 and number_counter[result] >=0:
                handled.add(result)
            
            #사용한 횟수만큼 count 수 증가
            number_counter[operand1]+=1
            number_counter[operand2]+=1
            number_counter[result]+=1

    #연산의 횟수를 줄이기 위해, set을 활용하였고, 해당 숫자가 좋을 경우 counter의 값을 추가시킨다.
    for target_number in target_numbers:
        if target_number in handled:
            count+=number_counter[target_number]
    
    return count

if __name__ == "__main__":
    n=int(input())
    numbers=list(map(int,input().split()))
    print(solution())
```

## Solution 2

위에서는 Bruteforce를 활용하여 만들 수 있는 모든 숫자의 조합을 고려하였지만, Two-Pointer을 활용하여 문제를 풀이할 수 있다.

```python
def two_pointer(array,i):
    start,end=0,n-2
    target_number=numbers[i]
    while start<end:
        result=array[start]+array[end]

        if result==target_number:
            return True
        
        elif result < target_number:
            start+=1

        elif result > target_number:
            end-=1
    
    return False

def solution():
    count=0
    numbers.sort()
    for i in range(n):
        #자기 자신을 제외한 리스트를 새로 만들어서 해당 숫자가 좋은지 여부를 판별한다.
        if two_pointer(numbers[:i]+numbers[i+1:],i):
            count+=1
    return count

if __name__ == "__main__":
    n=int(input())
    numbers=list(map(int,input().split()))
    print(solution())
```
