---
title: "[Programmers] 124 나라의 숫자"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - codetest
  - Programmers
  - implementation
---
# [Programmers] 124 나라의 숫자
## [Question](https://programmers.co.kr/learn/courses/30/lessons/12899)
## Language: Python

숫자를 1,2,4로 표현하는 방법에 대한 문제이다.

해당 문제는 3진법을 고려해서 풀면 간단하게 해결할 수 있다.

|num|3진법|124|
|--|--|--|
|1|1|1|
|2|2|2|
|3|10|4|
|4|11|11|
|5|12|12|
|6|20|14|
|7|21|21|
|8|22|22|
|9|100|24|
|10|101|41|
|11|102|42|
|12|110|44|
|13|111|111|

3진법은 124와 달리 각 0을 앞에서 쓸 수 없기 때문에 124에 비해 각자리에서 사용할 수 있는 숫자가 1개씩 모자란다. 그렇게 되므로 

3진법은 3에서 자리 수가 변하고, 124 에서는 4에서 자리수가 변하고, 

9에서 자리수가 변하고, 13에서 자리수가 변하게 된다. 

아래와 같이 각 자리수 마다 한 자리수 씩 부족하므로, n-1을 처리해준다.


3진법은

한 자리수 2개
두 자리수 2*3개

124는

한자리 수 3개
두자리 수 3*3개 

## Solution

```python
def solution(n):
    answer = ''
    num = ['1','2','4']
    answer = ""
    while n > 0:
        n -= 1
        answer = num[n % 3] + answer
        n //= 3

    return answer
```
