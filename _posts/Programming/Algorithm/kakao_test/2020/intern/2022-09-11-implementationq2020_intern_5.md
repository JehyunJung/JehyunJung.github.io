---
title: "[Programmers] P67260 동굴 탐험"
excerpt: "2020 카카오 인턴 5"

categories:
  - codetest
tags:
  - implementation
  - dfs
  - codetest
  - Programmers
  - kakao
  - try_again
---
# [Programmers] P67260 동굴 탐험
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/67260)
## Language: Python

주어진 문제는 주어진 노드 그래프에 대해 일부 노드 간에 주어진 방문 순서에 따라 경로가 있는 지 여부를 판단하는 문제이다.

특정 노드에 대해서 이전에 방문이 수반되어야하는 노드가 있으면 해당 노드를 먼저 방문해야한다.

dfs를 수행하면서, 해당 노드를 탐색하기 이전에 사전에 방문해야되는 노드가 있으면, 해당 노드에 대해 후실행 노드로 등록을 해놓고 다른 노드 부터 먼저처리한다.

가령 1번 노드를 방문하기 이전에 3번 노드를 먼저 방문해야되면
after_visit[3] =1 로 설정해서, 3번 노드를 처리한 다음에는 1번 노드에 대해서 dfs를 이어나갈 수 있도록 한다.

> 주의점

dfs 진행에 있어 방문순서가 정해져 있는 노드에 대한 처리를 생각해야되는 부분에 있어 어려움이 있었다.



## Solution 

```python
def solution(n, path, order):
    answer = True
    #전 실행 노드(order)
    pre_visit=[-1] *n
    #후 실행 노드
    after_visit=[-1]*n
    graph=[[] for _ in range(n)]
    visited=[False]*n
    
    #양방향 그래프 생성
    for v1,v2 in path:
        graph[v1].append(v2)
        graph[v2].append(v1)
       
    #먼저 방문해야될 노드가 있는 경우를 지정
    for before,after in order:
        pre_visit[after]=before
    
    stack=[0]
    visit_count=0
    while stack:
        vertex=stack.pop()
        
        #먼저 방문해야되는 노드가 있는 경우 -> 이를 후실행노드로 지정하고 넘어간다. 이후, 사전 노드를 실행하면, 다시 해당 노드로 돌아올 수 있도록 한다.
        if not visited[pre_visit[vertex]] and pre_visit[vertex] !=-1:
            after_visit[pre_visit[vertex]]=vertex
            continue 
            
        visited[vertex]=True
        visit_count+=1
        
        for adj_vertex in graph[vertex]:
            if not visited[adj_vertex]:
                stack.append(adj_vertex)
            
        #후 지정 노드가 있는 경우 이를 먼저 실행한다.
        if after_visit[vertex] !=-1:
            stack.append(after_visit[vertex])
                
    if visit_count==n:
        return True
    else:
        return False
```
