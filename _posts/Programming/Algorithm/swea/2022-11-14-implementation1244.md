---
title: "[SWEA] Q1244 최대상금"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - bruteforce
  - codetest
  - samsung
---
# [SWEA] Q1244 최대상금
## [Question](https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=AV15Khn6AN0CFAYD)
## Language: Python
## Difficulty: D3

해당 문제는 모든 경우에 대해서 고려하는 완전 탐색유형이다. 각 자리 별로 교환을 수행하여, 가질 수 있는 최대값을 구한다.

최적화된 값은 내림차순 되는 경우이지만, 항상 교환횟수를 모두 사용해야하므로, 내림차순을 완료한 시점에서 교환횟수가 남아 있는 경우, 교환을 수행해야하므로 최적화된 값이 정답이 아닐 수도 있다.

따라서, 내림차순 정렬이 수행된 경우에서, 교환횟수가 남아 있게되면 맨 뒤에 2자리를 서로 교환하는 방식으로 교환횟수를 소모해야한다. 즉, 교환횟수가 짝수개가 남으면 내림차순되 값이 정답이 되고, 홀수 인경우는 맨 뒤에 2자리를 서로 교환한 값이 정답이 된다.

```python
if not max_number and count != 0:
    # 짝수개가 남은 경우 더 이상 자릿수 이동이 필요 없다
    if count % 2 == 0:
        solution(index, 0)
    # 홀수개가 남은 경우, 맨뒤에 두자리를 서로 교환한다.
    else:
        number_list[length - 2], number_list[length - 1] = number_list[length - 1], number_list[length - 2]
        solution(index, 0)
```

## Solution

```python
def solution(index, count):
    global max_number, number_list

    if count == 0:
        max_number = max(max_number, int("".join(number_list)))
        return

    for i in range(index, length):
        for j in range(i + 1, length):
            # 앞에 있는 값이 더 큰 경우에는 교환하지 않는다.
            if number_list[i] > number_list[j]:
                continue
            number_list[i], number_list[j] = number_list[j], number_list[i]
            solution(i, count - 1)
            number_list[i], number_list[j] = number_list[j], number_list[i]

    # 자릿수 끝까지 다 돈 경우
    if not max_number and count != 0:
        # 짝수개가 남은 경우 더 이상 자릿수 이동이 필요 없다
        if count % 2 == 0:
            solution(index, 0)
        # 홀수개가 남은 경우, 맨뒤에 두자리를 서로 교환한다.
        else:
            number_list[length - 2], number_list[length - 1] = number_list[length - 1], number_list[length - 2]
            solution(index, 0)

if __name__ == "__main__":
    number,exchange_counts,max_number,length=0,0,0,0
    number_list=[]
    
    testcases=int(input())
    for case in range(testcases):
        numbers,exchange_counts=map(int,input().split())
        max_number=numbers
        number_list = list(str(numbers))
        length=len(number_list)
        max_number = 0
        solution(0,exchange_counts)
        print("#{} {}".format(case + 1, max_number))
```
