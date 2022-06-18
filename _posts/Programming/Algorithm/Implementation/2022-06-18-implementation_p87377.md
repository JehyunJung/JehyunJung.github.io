---
title: "[Programmers] 교점에 별 만들기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
---
# [Programmers] 교점에 별 만들기
## [Question](https://programmers.co.kr/learn/courses/30/lessons/87377)
## Language: Python

주어진 등식에 대한 교점 중에서 정수 좌표만을 취해서 해당 좌표들로 만들 수 있는 최소 크기의 별을 출력해야한다.

아래의 수식을 이용해 교점을 어렵지 않게 구할 수 있다.

구해진 좌표들은 음수, 양수가 뒤섞여있는 좌표들인데, 이를 모두 양수값으로 만들어주기 위해 각 x,y 좌표의 최소 좌표를 이용해서 대칭 이동시켜준다. 그런 다음, 각 좌표들의 최대 좌표값을 활용해서 격자 무늬 그래프를 만들어주고, 교점에 해당하는 부분에는 별을 표시해주도록 한다.



## Solution

```python
def solution(line):
    answer = []
    x_coordinates=[]
    y_coordinates=[]
    length=len(line)
    
    for i in range(length):
        for j in range(length):
            if i==j:
                continue
            (a,b,e)=line[i]
            (c,d,f)=line[j]

            if a*d - b*c ==0:
                continue
            x=(b*f-e*d)/(a*d-b*c)
            y=(e*c-a*f)/(a*d-b*c)
            
            if x==int(x) and y==int(y):
                x_coordinates.append(int(x))
                y_coordinates.append(int(y))
    

    min_x=min(x_coordinates)
    min_y=min(y_coordinates)
    
    #모든 좌표값을 양수로 만들어주기 위해 대칭이동 시켜줌
    x_coordinates=list(map(lambda x : x +(-min_x + 1),x_coordinates))
    y_coordinates=list(map(lambda x : x +(-min_y + 1),y_coordinates))

    
    max_x=max(x_coordinates)
    max_y=max(y_coordinates)
    
    #격자 무늬 그래프 생성
    graph=[["."]*(max_x) for _ in range(max_y)]
    
    #교점에 해당하는 부분에 별 표시
    for col,row in zip(x_coordinates,y_coordinates):
        graph[max_y-row][col-1]="*"

    #리스트 형태의 데이터를 문자열로 변환 
    for sub_graph in graph:
        answer.append("".join(sub_graph))
    
    return answer
```
