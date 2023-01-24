---
title: "[BOJ] Q20437 문자열 게임 2"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - Bruteforce

---
# [BOJ] Q20437 문자열 게임 2
## [Question](https://www.acmicpc.net/problem/20437)
## Language: Python
## Difficulty: Gold 5

주어진 문제에서 구해야되는 특정 문자열의 정보는 아래와 같다.

1. 어떤 문자를 정확히 K개를 포함하는 가장 짧은 연속 문자열의 길이를 구한다.
2. 어떤 문자를 정확히 K개를 포함하고, 문자열의 첫 번째와 마지막 글자가 해당 문자로 같은 가장 긴 연속 문자열의 길이를 구한다.

1번 조건의 문자열을 자세히 살펴보면 가장 짧은 연속된 문자열의 길이를 구하는 것이는데, 이때 특정 문자를 정확히 k개 포함하면서 가장 짧게 만들고자 하려면 처음과 끝이 해당 문자로 같은 문자열로 특정지을 수 있다. 즉, 해당 문제는 1,2 번 조건에 해당되는 문자열은 처음과 끝이 같은 문자열에 대해서 가장 짧은 길이와 가장 긴 길이를 찾는 문제이다. 이 부분을 캐치하는 것이 이 문제의 핵심 **key point**이다.

가장 짧은 길이와 가장 긴 문자열의 길이를 구하는 것은 해당 k개를 포함하는 문자에 대해 index 간의 거리를 구하는 것으로 계산할 수 있다.

> 입력된 문자열에 대해 각 문자별 인덱스 정보를 구한 다음

```python
string_counter=defaultdict(list)
        target_chars=[]
        
#문자열에 대해 각 문자 별로 index 정보를 파악한다.
for i in range(length):
    char=string[i]
    string_counter[char].append(i)

#해당 되는 문자의 종류 취합
for key in string_counter:
    if len(string_counter[key])>=k:
        target_chars.append(key)
```

> 각 index을 활용하여 문자가 정확히 k개 들어가도록 하는 문자열의 길이를 구해서, 최소 길이, 최대 길이를 갱신해나간다.

```python
for char in target_chars:
    char_indexes=string_counter[char]
    index_length=len(char_indexes)
    for i in range(index_length-k+1):
        min_length=min(min_length,char_indexes[i+k-1]-char_indexes[i]+1)
        max_length=max(max_length,char_indexes[i+k-1]-char_indexes[i]+1)
```

## Solution

```python
from collections import defaultdict
from math import inf
def solution():
    for index in range(T):
        string=strings[index]
        k=ks[index]
        length=len(string)

        string_counter=defaultdict(list)
        target_chars=[]
        
        #문자열에 대해 각 문자 별로 index 정보를 파악한다.
        for i in range(length):
            char=string[i]

            string_counter[char].append(i)
        #해당 되는 문자의 종류 취합
        for key in string_counter:
            if len(string_counter[key])>=k:
                target_chars.append(key)


        #만족하는 문자열이 없는 경우 -1 반환
        if len(target_chars) ==0:
            print(-1)
            continue

        min_length=inf
        max_length=0

        for char in target_chars:
            char_indexes=string_counter[char]
            index_length=len(char_indexes)
            for i in range(index_length-k+1):
                min_length=min(min_length,char_indexes[i+k-1]-char_indexes[i]+1)
                max_length=max(max_length,char_indexes[i+k-1]-char_indexes[i]+1)
        print(min_length,max_length)
        
if __name__ == "__main__":
    T=int(input())
    strings=[]
    ks=[]

    for _ in range(T):
        strings.append(input().strip())
        ks.append(int(input().strip()))
    solution()
```
