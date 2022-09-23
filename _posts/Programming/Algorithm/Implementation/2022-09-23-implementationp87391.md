---
title: "[Programmers] P87391 공 이동 시뮬레이션"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - programmers
  - try_again
---
# [Programmers] P87391 공 이동 시뮬레이션
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/87391)
## Language: Python
## Difficulty: Gold 1~2?

해당 문제의 경우 좌표 평면의 범위가 아주 크기 때문에, 모든 좌표에 대해서 고려해서는 문제를 풀이할 수 없다. 해당 문제는 특정 좌표축에 도달할 수 있는 좌표의 범위값을 구해서 풀이할 수 있다. 처음에 범위를 목적지 좌표를 설정하고, 쿼리 집합을 역순으로 순회하며서 점차 좌표범위를 수정해 나가면 된다.

아래의 그림은 좌측 이동에 대한 좌표 범위 수정을 나타낸것인데, 이를 다른 방향에 대해서도 비슷하게 적용하면 된다.

![p87391](/assets/images/algorithm/p87391.jpg)


## Solution

```python
def solution(n, m, x, y, queries):
    answer = 0
    queries.reverse()
    #초기 범위는 목적 좌표
    start_row,start_col,end_row,end_col=x,y,x,y
    for direction,value in queries:
        #좌 이동
        if direction==0:
            #출발 행이 0인 경우 좌측으로 이동해도, 이동이 동반되지 않으므로 출발 행의 범위는 바꾸지 않는다.
            if start_col==0:
                end_col=min(m-1,end_col+value)
            else:
                #이미 제한 범위를 넘어서기 때문에, 특정 col에 도달할 수 없게 된다.
                if (start_col + value) >=m:
                    return 0
                else:
                  #출발,끝 행의 범위를 늘려준다.(좌측 이동이 동반되는 것이므로, 범위는 그 반대방향으로 옮겨줘야한다.)
                    start_col=min(m-1,start_col+value)
                    end_col=min(m-1,end_col+value)
        #우 이동
        elif direction==1:
            #끝행이 이미 
            if end_col==m-1:
                start_col=max(0,start_col-value)
            else:
                #이미 범위를 넘어서기 때문에, 특정 col에 도달할 수 없게 된다.
                if (end_col -value) <0:
                    return 0
                else:
                    start_col=max(0,start_col-value)
                    end_col=max(0,end_col-value)
        #상 이동
        elif direction==2:
            if start_row==0:
                end_row=min(n-1,end_row+value)
            else:
                #이미 범위를 넘어서기 때문에, 특정 row에 도달할 수 없게 된다.
                if (start_row + value) >=n:
                    return 0
                else:
                    start_row=min(n-1,start_row+value)
                    end_row=min(n-1,end_row+value)
        
        #하 이동
        elif direction==3:
            if end_row==n-1:
                start_row=max(0,start_row-value)
            else:
                #이미 범위를 넘어서기 때문에, 특정 row에 도달할 수 없게 된다.
                if (end_row - value) <0:
                    return 0
                else:
                    start_row=max(0,start_row-value)
                    end_row=max(0,end_row-value)
                    
    answer=(end_row-start_row+1)*(end_col-start_col+1)   
        
    return answer
```