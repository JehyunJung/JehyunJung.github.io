---
title: "정확한 순위 찾기 문제"
excerpt: "Shortest Path 관련 문제"

categories:
  - codetest
tags:
  - Shortest_Path
  - codetest
---
# 정확한 순위 찾기 문제
N 명의 학생이 시험을 치고 성적이 나왔다. 하지만 어떠한 이유에서인지 성적표 일부가 분실되어 몇명의 학생들에 대한 순위 비교만 주어졌다. 
예를 들어 아래의 학생 순위 비교를 나타낸 것이 아래의 그림과 같이 나타낼 수 있다.

1번의 학생 < 5번의 학생

3번의 학생 < 4번의 학생

4번의 학생 < 2번의 학생

4번의 학생 < 6번의 학생

5번의 학생 < 2번의 학생

5번의 학생 < 4번의 학생

![question](/assets/images/algorithm/question1.png)
이 문제에서는 일부의 학생에 대한 순위 비교 자료를 통해 정확한 순위를 알 수 있는 학생의 수를 구하는 것이 문제이다.

## Language: Python
만약 학생 1의 순위를 비교하기 위해서는 다른 모든 학생들과 비교되는 지 확인해야한다. 그래프를 보면 비교할 수 있다라는 것인 해당 노드와 노드간에 경로가 존재함을 의미한다. 따라서 특정 노드 a 와 나머지 노드 간에 모두 경로가 존재하면 이는 특정 학생이 다른 학생들과 비교를 할 수 있으며, 해당 학생의 순위는 알 수 있게 되는 것이다.

## Solution

```python
from math import inf

def floyd_warshall(v,graph):
  for k in range(1,v+1):
    for a in range(1,v+1):
      for b in range(1,v+1):
        graph[a][b]=min(graph[a][b],graph[a][k]+graph[k][b])

if __name__ == "__main__":
  vertex,edges=0,0
  graph=[]
  vertex,edges=map(int,input().split())
  graph=[[inf]*(vertex+1) for _ in range(vertex+1)]
   for _ in range(edges):
    v1,v2=map(int,input().split())
    graph[v1][v2]=1

  for i in range(1,vertex+1):
    graph[i][i]=0

  floyd_warshall(vertex,graph)

  result=0
  for i in range(1,vertex+1):
    count=0
    for j in range(1,vertex+1):
      if i!=j and graph[i][j]!=inf or graph[j][i]!=inf:
        count+=1
    if count==vertex:
      result+=1

  print(result)
```
