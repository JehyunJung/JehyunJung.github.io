---
title: "[BOJ] Q2357 최솟값과 최댓값"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - data_structure
  - segment_tree
  - boj

---
# [BOJ] Q2357 최솟값과 최댓값
## [Question](https://www.acmicpc.net/problem/2357)
## Language: Python
## Difficulty: Gold 1

해당 문제는 segment tree를 활용하여 풀이가 가능한 문제이다. 일전에는 특정 구간합에 대한 쿼리를 효율적으로 처리하기 위해 segment tree를 활용하였지만, 최소,최대값을 구할 때에도 segment tree을 활용하는 것이 가능하다.

> Segment Tree

```python
def init(tree,index,start,end):
    if start==end:
        tree[index]=[numbers[start],numbers[start]]
        return numbers[start],numbers[start]

    mid=(start+end)//2
    
    #왼쪽 자식, 오른쪽 자식에 대한 처리 진행
    left=init(tree,index*2,start,mid)
    right=init(tree,index*2+1,mid+1,end)

    #왼쪽 자식, 오른쪽 자식, 본인을 비교해서 최소, 최대값을 갱신한다.
    tree[index]=[min(tree[index][0],left[0],right[0]),max(tree[index][1],left[1],right[1])]

    return tree[index]


def query(tree,index,start,end,left,right):
    #범위에 벗어나는 경우
    if right < start or end < left:
        return [inf,-inf]
    #범위에 포함되는 경우
    if left <=start and end <=right:
        return tree[index]
    #끝에 도달한 경우
    if start==end:
        return tree[index]
    #범위에 걸치는 경우
    mid=(start+end)//2
    left_child=query(tree,index*2,start,mid,left,right)
    right_child=query(tree,index*2+1,mid+1,end,left,right)

    return [min(left_child[0],right_child[0]),max(left_child[1],right_child[1])]
```

## Solution

```python
from math import inf

def init(tree,index,start,end):
    if start==end:
        tree[index]=[numbers[start],numbers[start]]
        return numbers[start],numbers[start]

    mid=(start+end)//2
    
    left=init(tree,index*2,start,mid)
    right=init(tree,index*2+1,mid+1,end)


    tree[index]=[min(tree[index][0],left[0],right[0]),max(tree[index][1],left[1],right[1])]

    return tree[index]


def query(tree,index,start,end,left,right):
    if right < start or end < left:
        return [inf,-inf]
    
    if left <=start and end <=right:
        return tree[index]
    
    if start==end:
        return tree[index]
    mid=(start+end)//2
    left_child=query(tree,index*2,start,mid,left,right)
    right_child=query(tree,index*2+1,mid+1,end,left,right)

    return [min(left_child[0],right_child[0]),max(left_child[1],right_child[1])]

def solution():
    init(segment_tree,1,0,n-1)
    for left,right in queries:
        print(*query(segment_tree,1,0,n-1,left-1,right-1))

if __name__ == "__main__":
    n,m=map(int,input().split())
    numbers=[int(input()) for _ in range(n)]
    queries=[list(map(int,input().split())) for _ in range(m)]
    segment_tree=[[inf,-inf]]*(4*n)
    solution()
```