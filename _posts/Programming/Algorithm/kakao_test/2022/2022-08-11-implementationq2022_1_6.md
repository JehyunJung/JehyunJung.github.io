---
title: "[Programmers] P92344 파괴되지 않는 건물"
excerpt: "2022 카카오 공채 문제 6"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
  - prefix_sum
---
# [Programmers] P92344 파괴되지 않는 건물
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/92344)
## Language: Python

주어진 공격/회복 로그를 바탕으로 최종적으로 남은 건물의 개수를 파악하는 문제이다. 

해당 문제를 아래와 같이 단순 다중 for문으로 생각하게 되면 시간 초과 문제가 발생하게 된다.

> Algorithm

```python
for t,start_row,start_col,end_row,end_col,degree in skill:
        if t==2:
            for row in range(start_row,end_row+1):
                for col in range(start_col,end_col+1):
                    board[row][col]+=degree
        else:
            for row in range(start_row,end_row+1):
                for col in range(start_col,end_col+1):
                    board[row][col]-=degree   
```

위의 방식대로 진행하게 되면 시간 복잡도가 ```O(K*M*N)```에 이른다

여기서 핵심 내용은 [카카오_공채_2021_5번문제]({% post_url 2022-07-31-implementationq2021_1_5 %}) 문제에서 다룬 누적합을 통해서 배열의 변화를 파악해야한다.

즉, row=3,col=3인 배열이 있을때 (0,0) ~ (1,1) 까지 2씩 증가시키려면
아래와 같이 경계부분에 변화값을 표시한다. 아래와 같이 경계부분에만 설정하게 되면 나중에 행/열 누적합을 통해 해당 영역에 대한 변화량을 파악할 수 있다.

||||||
|--|--|--|--|--|
||2|0|-2|0|
||0|0|0|0|
||-2|0|2|0|
||0|0|0|0|

행/열 누적합 이후

||||||
|--|--|--|--|--|
||2|2|0|0|
||2|2|0|0|
||0|0|0|0|
||0|0|0|0|

아래와 여러 변화량에 대해서 적용해보자
1. (0,0)~(1,1) 2씩 증가
2. (0,0)~(2,2) 3씩 감소
3. (1,1)~(3,1) 5씩 증가

||||||
|--|--|--|--|--|
||0+2-3|0|0-2|0+3|
||0|0+5|0|0|
||0-2|0|0+2|0|
||0+3|-5|0|0-3|

||||||
|--|--|--|--|--|
||-1|0|-2|3|
||0|5|-5|0|
||-2|0|2|0|
||3|-5|5|-3|

행/열 누적합

||||||
|--|--|--|--|--|
||-1|-1|-3|0|
||-1|4|-3|0|
||-3|2|-3|0|
||0|0|0|0|

이와 같이 모든 변화량을 한번의 누적합을 통해서 구하는 것이 가능하다
즉, 시간 복잡도가 O(k+M*N)으로 확 줄어들게 된다.


## Solution

```python
def solution(board, skill):
    answer = 0
    rows=len(board)
    cols=len(board[0])
    
    changes=[[0] * (cols+1) for _ in range(rows+1)]
    #각각의 변화에 대해서, 경계 부근에만 변화 표시
    for t,start_row,start_col,end_row,end_col,degree in skill:
        if t==2:
            changes[start_row][start_col]+=degree
            changes[start_row][end_col+1]-=degree
            changes[end_row+1][start_col]-=degree
            changes[end_row+1][end_col+1]+=degree
            
        else:
            changes[start_row][start_col]-=degree
            changes[start_row][end_col+1]+=degree
            changes[end_row+1][start_col]+=degree
            changes[end_row+1][end_col+1]-=degree
            
    #열 단위 누적합
    for row in range(rows+1):
        for col in range(1,cols+1):
            changes[row][col]+=changes[row][col-1]
    
    #행 단위 누적합
    for col in range(cols+1):
        for row in range(1,rows+1):
            changes[row][col]+=changes[row-1][col]
    
    #변화량 적용
    for row in range(rows):
        for col in range(cols):
            board[row][col]+=changes[row][col]
            if board[row][col] > 0:
                answer+=1
        
    return answer
```
