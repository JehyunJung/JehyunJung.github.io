---
title: "[BOJ] Q9935 폭발 문자열"
excerpt: "stack"

categories:
  - codetest
tags:
  - data_structure
  - deque
  - boj

---
# [BOJ] Q9935 폭발 문자열
## [Question](https://www.acmicpc.net/problem/9935)
## Language: Python
## Difficulty: Gold 4

처음에는 정규표현식을 기반으로 문자열이 포함되어 있는지 확인하면서 더 이상 폭발 문자열을 포함하지 않을 떄까지 반복하도록 하였다. 

> Failed Solution

```python
import re

def solution():
    global word

    while re.search(target_word,word) != None:
        word=word.replace(target_word,"")
    
    if word:
        print(word)
    else:
        print("FRULA")

if __name__ == "__main__":
    word=input().strip()
    target_word=input().strip()
    solution()
    
```

하지만 위와 같이 수행하게 되면 매번 처음부터 탐색을 수행하기 때문에 많은 시간이 발생하게 된다. 

위의 문제를 해결하기 위해 스택을 통해 문자를 하나씩 탐색하면서 폭발 문자열이 이루어지는 경우 폭발 문자열 길이 만큼 top을 옮기는 방식으로 문제를 처리하여 탐색과 문자열 제거 과정을 단순화 시키는 것이 가능하다.

## Solution

```python
from collections import deque
def solution():
    word_stack=["a"]*len(word)
    target_word_length=len(target_word)
    top_index=0

    for char in word:
        word_stack[top_index]=char
        top_index+=1

        if top_index >= target_word_length:
            if word_stack[top_index-target_word_length:top_index] == target_word:
                top_index-=target_word_length
    
    remaining_word="".join(word_stack[:top_index])

    if remaining_word:
        print(remaining_word)
    else:
        print("FRULA")



if __name__ == "__main__":
    word=input().strip()
    target_word=list(input().strip())
    solution()
    
```