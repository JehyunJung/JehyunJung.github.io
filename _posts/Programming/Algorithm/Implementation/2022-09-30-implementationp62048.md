---
title: "[Programmers] P62048 멀쩡한 사각형"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - programmers
  - try_again
---
# [Programmers] P62048 멀쩡한 사각형   
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/62048)
## Language: Python
## Difficulty: Gold 5?

해당 문제는 아래의 풀이처럼 행, 열의 최대공약수를 활용한 풀이를 이용해야한다.

![p62048](/assets/images/algorithm/p62048.jpg)

## Solution

```python
from math import gcd
def solution(w,h):
    answer=w*h-(w+h-gcd(w,h))
    return answer
```


일차함수를 이용해서 풀이하는 방법도 존재한다. 좌표 평면으로 생각하고, x좌표를 대입했을때, 가지는 최대 정수값을 이용해서, 정상적인 사각형의 개수를 구할 수 있다.

## Solution 2

```python
def solution(w,h):
    answer = 0
    
    #행=1 또는 열=1인 경우는 정상적인 사각형이 없다
    if w==1 or h==1:
        return 0
    
    #행=열이 같은 경우
    if w==h:
        return w*h-w
    
    for i in range(1,w):
        answer+=2*int((float(h)*i/w))
    return answer
```