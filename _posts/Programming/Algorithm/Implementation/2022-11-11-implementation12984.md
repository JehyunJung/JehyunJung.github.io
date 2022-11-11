---
title: "[Programmers] Q12984 지형 편집"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - programmers

---
# [Programmers] Q12984 지형 편집
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/12984)
## Language: Python

해당 문제는 원소의 값이 1과 10억 사이의 매우 큰 범위를 가지므로 모든 경우에 대해 순차적으로 접근하게 되면 최대 O(10억 * n^2) 이 되므로 절대 시간내에 풀 수 없다.

이 문제의 핵심은 원소 값에 집중하는 것이 아닌, 원소의 개수에 집중하는 것이 중요하다. 어차피, 통일된 층의 정보는 원소 중에 존재한다. 즉, 각각의 원소에 대해서 정렬을 수행하여 가장 낮은 층부터 가장 높은 층까지 쌓아보면서 드는 비용을 갱신해가면 최소 비용을 구할 수 있다.

![12984](/assets/images/algorithm/12984.jpg)

```[[4, 4, 3], [3, 2, 2], [ 2, 1, 0 ]]```
위와 같은 N*N 행렬에 대해서, 리스트 형태로 변환한 후, 정렬을 수행한다.

```[0,1,2,2,2,3,3,4,4]```

가장 낮은 층인 0을 만들기 위해 드는 비용은 아래와 같다. 층을 이루는 length * 층계를 하면 해당 층을 이루는 개수가 나오고, 나머지에 대해서는 기존의 블록에서 빼주는 작업을 수행해야한다.

```python
cost=(sum(floors)-floors[0]*length)*Q
```

그 다음 층에 대해서는, 추가되는 블록의 개수는 P을 적용하고 기존에 이미 블록이 있는 경우에 대해서는 Q 비용을 빼준다.(이미 가장 낮은 층을 구성할때 모두 빠진 경우를 구했으므로, 이미 있는 경우에는 블록을 뺄 필요가 없으므로 Q 비용을 복구한다.)

```python
for i in range(1,length):
    #이전 층과 같은 층인 경우 cost가 변하지 않으므로 넘어간다.
    if floors[i] != floors[i-1]:
        cost+=(((floors[i]-floors[i-1])*i*P)-((floors[i]-floors[i-1])*(length-i)*Q))
        #단계를 진행할 수록 비용이 감소하지만, 비용이 저장된 최소값 보다 커지는 경우 계속 증가하는 추세로 변한다. 따라서 저장된 최소 비용보다 커지는 경우가 변곡점이 되므로 그때의 비용이 최소 비용이된다.
        if answer < cost:
            break
        answer=cost
```


## Solution

```python
from math import inf
from itertools import chain
                
def solution(land, P, Q):
    answer = inf
    floors=list(chain.from_iterable(land))
    length=len(floors)
    floors.sort()

    
    cost=(sum(floors)-floors[0]*length)*Q
    answer=cost

    for i in range(1,length):
        print(cost)
        if floors[i] != floors[i-1]:
            cost+=(((floors[i]-floors[i-1])*i*P)-((floors[i]-floors[i-1])*(length-i)*Q))
            if answer < cost:
                break
            answer=cost
    return answer
```