---
title: "[BOJ] Q14658 하늘에서 별똥별이 빗발친다"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj
  - Bruteforce

---
# [BOJ] Q14658 하늘에서 별똥별이 빗발친다
## [Question](https://www.acmicpc.net/problem/14658)
## Language: Python
## Difficulty: Gold 4

주어진 좌표평면 상에서 가장 많은 별똥별의 갯수를 포함 시킬 수 있는 트램펄린의 좌표를 구하는 것이 해당 문제의 목표이다. 

이러한 유형의 문제의 경우 대개, Bruteforce방식의 풀이로 모든 좌표점을 시도하여 가장 많은 수의 별똥별을 포함하는 좌표를 구하면 된다. 하지만 해당 문제의 경우 검사해야될 좌표점의 갯수가 25*10<sup>10</sup> 이므로 시간 초과가 발생하게 된다. 

다행히도, 별똥별의 갯수가 매우 적기 때문에 이를 활용하여 문제를 풀이할 수 있다.

> Failed Solution

처음에는 아래와 같이 별똥별의 좌표를 트램펄린의 꼭짓점 좌표로 설정하여 값을 구하는 것으로 생각을 하였다.

```python
max_count
for start_row,start_col in stars:
    count=0
    for row,col in stars:
        if start_row<=row<=start_row+t_length and start_col<=col<=start_col+t_length:
            count+=1
    max_count=max(max_count,count)
```

위의 풀이로는 아래와 같은 경우에서 최대 3개의 별똥별만을 포함할 수 있다.

![counterexample_14568](/assets/images/algorithm/counterexample_14568.png)

위의 반례를 살펴봤을 때 확인해볼 수 있는 점은, 각각의 별똥별이 트램펄린의 모서리에 위치하는 경우에서 가장 많은 갯수의 별똥별을 포함하는 것을 확인할 수 있다. 이를 통해 별똥별의 좌표를 고려하는 것이 아닌, 각각의 별똥별의 x 좌표, y 좌표를 따로 추출하여 product 형태로 ```<x,y>```좌표를 뽑아서 이를 트램펄린 좌표로 설정하여 검사를 진행하면 원하는 최적의 결과를 구할 수 있다.

## Solution

```python           
from itertools import product
def solution():
    max_count=0
    for start_row,start_col in product(set(rows),set(cols)):
        count=0
        for row,col in zip(rows,cols):
            if start_row<=row<=start_row+t_length and start_col<=col<=start_col+t_length:
                count+=1
        max_count=max(max_count,count)
    
    return n_stars-max_count
        
        
if __name__ == "__main__":
    n_rows,n_cols,t_length,n_stars=map(int,input().split())
    rows=[]
    cols=[]

    for _ in range(n_stars):
        row,col=map(int,input().split())
        rows.append(row)
        cols.append(col)
               
    print(solution())
```

