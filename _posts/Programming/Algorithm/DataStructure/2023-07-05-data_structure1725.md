---
title: "[BOJ] Q1725 히스토그램"
excerpt: "Data Structure"

categories:
  - codetest
tags:
  - data_structure
  - segment_tree
  - stack
  - boj

---
# [BOJ] Q1725 히스토그램
## [Question](https://www.acmicpc.net/problem/1725)
## Language: python
## Difficulty: Platinum 5

해당 문제의 풀이는 [백준블로그](https://www.acmicpc.net/blog/view/12)을 참조하면 좋을 것 같다

## Solution 1. Segment Tree을 활용한 풀이

특정 구간 내에 최솟값을 기준으로 왼쪽 오른쪽으로 분기하는 형태로 구간에서 가질 수 있는 가장 큰 크기의 직사각형을 구하는 방식이다. 

이때, 각 구간에서 최솟값 인덱스를 효율적으로 찾기 위해 Segment Tree을 활용한다. 

따라서, Segment Tree + Divide-Conquery을 활용해서 풀이하는 방식이다.

```python
import sys
from math import inf

#segment tree의 초기화
def init(index,start,end):
    #리프 노드에 다달한 경우
    if start == end:
        tree[index]=start
        return tree[index]
    
    mid=(start+end)//2
    left_min_index=init(index*2,start,mid)
    right_min_index=init(index*2+1,mid+1,end)

    tree[index]= left_min_index if histogram[left_min_index-1] <= histogram[right_min_index-1] else right_min_index

    return tree[index]

#segment tree에 대한 query
def query(index,start,end,left,right):
    if right < start or end < left:
        return -1

    if left <= start and end <=right:
        return tree[index]
    
    mid=(start+end)//2
    
    left_min_index=query(index*2,start,mid,left,right)
    right_min_index=query(index*2+1,mid+1,end,left,right)
    left_min,right_min=inf,inf
    
    if left_min_index != -1:
        left_min=histogram[left_min_index-1]
    if right_min_index != -1:
        right_min=histogram[right_min_index-1]


    return left_min_index if left_min <=right_min else right_min_index

def solution(left,right):
    global max_area
    if left>right:
        return
    
    min_index=query(1,1,n,left,right)
    max_area=max(max_area,histogram[min_index-1] * (right-left+1))

    solution(left,min_index-1)
    solution(min_index+1,right)


if __name__ == "__main__":
    sys.setrecursionlimit(10**5)
    n=int(input())
    histogram=[int(input()) for _ in range(n)]

    tree=[0] * (4*n)
    init(1,1,n)

    max_area=0
    solution(1,n)
    print(max_area)
```

## Solution 2. Stack을 활용한 풀이

막대를 하나씩 삽입하면서 해당 막대를 기준으로 left, right을 찾아서 해당 막대를 삽입하므로써 가질 수 있는 최대 크기의 직사각형을 구하는 방식이다. 

stack의 top에 저장된 막대보다 작은 막대가 나오기 전까지 계속 삽입하다가, 작은 막대를 만나게 될 때, 해당 막대보다 작은 막대가 나오기 전까지 stack에서 빼네는 작업을 수행한다. 이렇게 하므로써 해당 구간 내의 가장 큰 직사각형을 구할 수 있다.

```python
def solution():
    stack=[]

    #막대기를 삽입하면서 특정 구간의 최대 크기의 직사각형을 구한다.
    for i in range(n):
        #top보다 작은 막대기를 만났을 경우
        while s and data[s[-1]] > data[i]:
            #만들 수 있는 가장 큰 크기의 직사각형의 높이
            height = data[s[-1]]
            s.pop()
            width = i
            if s:
                width = (i - s[-1] - 1)
            #stack에서 막대를 빼면서 만들 수 있는 가장 큰 크기의 직사각형을 구한다.
            result = max(result, width * height)
        #top보다 큰 막대의 경우 삽입한다.
        s.append(i)
    
    #스택에 막대가 남아있는 경우
    while s:
        height = data[s[-1]]
        s.pop()
        width = n
        if s:
            width = (n - s[-1] - 1)
        result = max(result, width * height)

if __name__ == "__main__":
    n=int(input())
    histogram=[int(input()) for _ in range(n)]
    
    solution()
```