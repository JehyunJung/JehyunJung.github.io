---
title: "[SWEA] Q4408 자기방으로 돌아가기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - samsung
---
# [SWEA] Q4408 자기방으로 돌아가기
## [Question](https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=AWNcJ2sapZMDFAV8)
## Language: Python
## Difficulty: D4

![s4408](/assets/images/algorithm/s4408.jpg)

위의 그림을 확인해보면 특정 영역에서 겹치는 이동회선의 갯수가 필요한 단위 시간임을 확인 할 수 있다. 따라서, 모든 이동 경로에 대해 이동 구간을 표기한 후, 구간 내에 겹치는 경로의 갯수의 최대값을 구한다.

## Solution

```python
def solution():
    occupied=[0]*200

    for src,des in boundaries:
        for index in range(src,des+1):
            occupied[index]+=1

    return max(occupied)

if __name__ == "__main__":
    with open("input.txt", "r") as file:
        test_cases=int(file.readline())
        for case in range(test_cases):
            n=int(file.readline())
            boundaries=[]
            for i in range(n):
                src,des=map(lambda x: (int(x) -1)//2 ,file.readline().split())

                if des < src:
                    src,des=des,src

                boundaries.append((src,des))
            print(f"#{case+1} {solution()}")


```