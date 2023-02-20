---
title: "[BOJ] Q19637 IF문 좀 대신 써줘"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - binary_search
  - boj
  - Bruteforce

---
# [BOJ] Q19637 IF문 좀 대신 써줘
## [Question](https://www.acmicpc.net/problem/19637)
## Language: Python
## Difficulty: Silver 3

해당 문제는 수치를 기준으로 해당하는 범위에 따른 호칭을 부여하는 문제이다. 

수치 기준의 최대 갯수가 10<sup>5</sup> 판단해야되는 대상의 갯수가 10<sup>5</sup>이므로 O(n<sup>2</sup>)의 알고리즘으로는 해결할 수 없다. 

그래서 2가지 방식으로 문제를 접근해볼 수 있다. 

## Solution 1. 대상에 대해서, 전투력에 따른 정렬 수행 후 호칭 부여

전투력에 따른 정렬을 진행한 다음, 수치에 해당하는 값인 경우 호칭을 부여하고, 수치에 부합하지 않는 경우 맞는 수치가 나올때 까지 기준 값을 증가시키는 방향으로 진행해서, 최대 n+m 번의 반복을 통해 문제를 풀이할 수 있다.

```python
from collections import defaultdict
def solution():
    degree_transitions=defaultdict(str)
    #각 상한선 값에 대응되는 호칭 저장
    for degree,uplimit in degrees:
        uplimit=int(uplimit)
        if degree_transitions[uplimit]=="":
            degree_transitions[uplimit]=degree
    #수치 기준 리스트에 대해서 정렬 수행
    degree_list=sorted(degree_transitions.keys())
    degree_index=0
    current_degree=degree_list[degree_index]

    #판단 대상에 대한 정렬
    characters.sort()
    result=[""] * n_characters

    #각 대상에 대해서 주어진 수치 기준에 부합하는 지에 따라 호칭 부여 진행
    for character,index in characters:
        #민일 전투력이 현재 기준 보다 높은 경우 해당 전투력에 해당하는 상한값을 찾을 때까지 기준 인덱스를 증가한다.
        while character > degree_list[degree_index]:
            degree_index+=1
            current_degree=degree_list[degree_index]

        result[index]=degree_transitions[current_degree]
    print("\n".join(result))

if __name__ == "__main__":
    n_degrees,n_characters=map(int,input().split())
    degrees=[input().split() for _ in range(n_degrees)]
    characters=[(int(input()),i) for i in range(n_characters)]
    
    solution()
```

## Solution 2. 각 대사에 대해 호칭 부여를 위해 이분 탐색 진행

위의 방식 처럼 대상 배열에 대한 정렬 수행을 통해 문제를 풀이할 수 있지만, 해당 문제에서 수치기준표은 이미 정렬된 상태로 주어진다는 점을 활용하여 이 표에 대한 이분 탐색을 진행해서 문제를 풀이할 수 있다.

python의 bisect_left 함수를 활용하면 정렬된 배열에서 값이 삽입될 위치를 얻을 수 있다.

> bisect_left

```python
from bisect import bisect_left
a=[1,2,3,4,4,5]
print(bisect_left(a,5))

>>> 5
```

```python
from bisect import bisect_left

def solution():
    for character in characters:
        print(degrees[bisect_left(powers,character)])

if __name__ == "__main__":
    n_degrees,n_characters=map(int,input().split())
    powers,degrees=[],[]
    for _ in range(n_degrees):
        degree,power=input().split()
        degrees.append(degree)
        powers.append(int(power))
    characters=[int(input()) for _ in range(n_characters)]
    
    solution()
```