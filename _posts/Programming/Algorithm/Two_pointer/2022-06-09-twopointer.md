---
title: "Two Pointer"
excerpt: "투 포인터"

categories:
  - algorithm
tags:
  - two_pointer
  - algorithm
---

# Two_pointer
빈번하게 나오지는 않는 알고리즘이지만 문제 풀이할때 요긴하게 쓰이는 경우가 많다. Two Pointer는 말 그대로, 두개의 index 변수를 이용하면서 풀이하는 방식의 유형이다. 해당 개념은 말로 설명하기 보다는 예제를 통해 어떤 상황에 투포인터를 사용하면 좋은지를 파악하는 것이 좋다.
mergeSort의 merge부분에서도 two pointer을 이용하는 부분을 확인 할 수 있다.

>Merge Sort

```python
```python
def merge_Sort(data):
  if len(data)<=1:
    return data
  mid=len(data)//2

  left=merge_Sort(data[:mid])
  right=merge_Sort(data[mid:])
  return merge(left,right)
  
def merge(left,right):
  i,j=0,0
  temp=[]
  # i,j 2개의 변수를 활용해서 merge를 수행하고 있다.
  while i<len(left) and j<len(right):
    if left[i] <= right[j]:
      temp.append(left[i])
      i+=1
    else:
      temp.append(right[j])
      j+=1

  while i<len(left):
    temp.append(left[i])  
    i+=1

  while j<len(right):
    temp.append(right[j])
    j+=1
```
