---
title: "[BOJ] Q22251 빌런 호석"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - Bruteforce

---
# [BOJ] Q22251 빌런 호석
## [Question](https://www.acmicpc.net/problem/22251)
## Language: Python
## Difficulty: Gold 5

해당 문제는 현재층에서 몇번의 led 반전을 통해 디지털 수를 변화시켜 만들 수 있는 층의 갯수를 구하는 문제이다. 

특정 숫자에서 특정 숫자로 만들기 위해 필요한 반전의 횟수를 구해서 모든 층에 대한 경우를 고려해서 문제의 조건에 부합하는 층인 경우 정답에 포함하는 방식으로 풀이한다.
즉, 모든 경우의 수를 고려하는 Bruteforce 형태의 문제이다.

> Bit expression

각각의 디지털 숫자는 아래와 같이 비트 표현식으로 변환해서 저장한다.

![q22251_1](/assets/images/algorithm/q22251_1.jpg)

각 숫자별로 비트로 표현하게 되면 각 숫자별로 변환하기 위해 필요한 반전의 횟수는 비트 차이를 통해 쉽게 구할 수 있다.

![q22251_2](/assets/images/algorithm/q22251_2.jpg)

```python
from collections import defaultdict
#숫자간에 차이나는 비트의 수 반환
def bit_difference(str1,str2):
    bit_count=0

    for char1,char2 in zip(str1,str2):
        if char1 != char2:
            bit_count+=1

    return bit_count
#숫자간에 비트 차이를 나타내는 행렬을 구하는 함수
def create_bit_transition():
    bit_count=0
    bit_transitions=[defaultdict(list) for _ in range(10)]
    bit_expression=["1110111","0010100","0111011","0111110","1011100","1101110","1101111","0110100","1111111","1111110"]
    for i in range(10):
        for j in range(10):
            bit_count=bit_difference(bit_expression[i],bit_expression[j])
            bit_transitions[i][bit_count].append(j)    

    return bit_transitions
```

## Solution

```python
from collections import defaultdict
#숫자간에 차이나는 비트의 수 반환
def bit_difference(str1,str2):
    bit_count=0

    for char1,char2 in zip(str1,str2):
        if char1 != char2:
            bit_count+=1

    return bit_count
#숫자간에 비트 차이를 나타내는 행렬을 구하는 함수
def create_bit_transition():
    bit_count=0
    bit_transitions=[defaultdict(list) for _ in range(10)]
    bit_expression=["1110111","0010100","0111011","0111110","1011100","1101110","1101111","0110100","1111111","1111110"]
    for i in range(10):
        for j in range(10):
            bit_count=bit_difference(bit_expression[i],bit_expression[j])
            bit_transitions[i][bit_count].append(j)    

    return bit_transitions

def solution(index,transition_count,after_transition):
    global probable_floor
    #모든 index에 대해 조사했을때
    if index==k:
        #반전 횟수가 최소 1개, 최대 p개 이면서, 변환된 층이 n 이하일때 해당 층으로의 변환이 가능하다
        if 1<=transition_count <=p and 1<=after_transition <=n:
            probable_floor.add(after_transition)
        return

    #각각의 숫자에 대해 변환할 수 있는 숫자로 변환해서 다음 index에 대한 조사를 진행한다.
    for i in range(7):
        for floor in bit_transitions[current_floor[k-index-1]][i]:
            solution(index+1,transition_count+i,after_transition+floor*(10**index))


if __name__ == "__main__":
    n,k,p,x=map(int,input().split())

    bit_transitions=create_bit_transition()
    probable_floor=set()
    current_floor=list(map(int,str(x).zfill(k)))
    solution(0,0,0)

    print(len(probable_floor))
```