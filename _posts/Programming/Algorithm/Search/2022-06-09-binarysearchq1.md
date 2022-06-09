---
title: "q1 떡볶이 떡 만들기"
excerpt: "Binary Search"

categories:
  - codetest
tags:
  - binary_search
  - codetest
---
# q1 떡복이 떡 만들기
## Question
![q1](/assets/images/algorithm/binary_searchq1.jpg)
## Language: Python

![explanation](/assets/images/algorithm/binary_searchq1_add.jpg.png)

절단기 높이를 15,14,16으로 설정했을때에 가져갈 수 있는 떡의 양을 위의 그림과 같다.
절단기 높이를 높일수록 가져 갈 수 있는 떡의 길이는 줄어들고,
절단기 높이를 낮출수록 가져 갈 수 있는 떡의 길이는 늘어난다.

그러면 절단기 높이를 0부터 해서 순차적으로 찾아서 최대 높이를 찾아볼까?
그렇게 하면 문제의 조건이 최대 높이가 20억이 될 수 있으므로 시간 초과가 날 수 있다.

이럴때, 이분 탐색을 사용하면 좋다.

start=0,end=max(떡 길이)을 해서, 만약 mid으로 절단기 높이를 설정했을 때, 가져갈 수 있는 떡의 길이가 적은 경우? end=mid-1
그 반대인 경우 start=mid+1을 해서
최대 mid값을 찾아보면 된다.

## Solution

```python
def binary_search(data,target_data,start,end):
  result=0
  while start<=end:
    mid=(start+end)//2
    temp=[x-mid for x in data if x > mid]

    if sum(temp)<target_data:
      end=mid-1
      
    else:
      result=mid
      start=mid+1
      
  return result

if __name__ == "__main__":
  n,m=0,0
  data=[]
  with open("input.txt","r") as file:
    n,m=map(int,file.readline().split())
    data=list(map(int,file.readline().split()))

  result=binary_search(data,m,0,max(data))
  
  print(result)
```
