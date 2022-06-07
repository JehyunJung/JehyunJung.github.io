---
title: "[BOJ] Q18406 럭키 스트레이트"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
---
# [BOJ] Q18406 럭키 스트레이트
## [Question](https://www.acmicpc.net/problem/18406)
## Language: Python
## Difficulty: Bronze 2

입력으로 들어온 숫자를 리스트로 처리해서 왼쪽 반의 합과 오른쪽 반의 합을 비교해서 같으면 LUCKY를 다르면 READY를 출력하면 된다.

## Solution

```python
n=list(map(int,input()))
input_len=len(n)//2
if sum(n[:input_len]) == sum(n[input_len:]):
    print("LUCKY")
else:
    print("READY")
```
