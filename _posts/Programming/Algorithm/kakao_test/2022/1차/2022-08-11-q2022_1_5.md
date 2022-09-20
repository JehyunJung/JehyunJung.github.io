---
title: "[Programmers] P92343 양과 늑대"
excerpt: "2022 카카오 공채 문제 5"

categories:
  - codetest
tags:
  - dfs
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P92343 양과 늑대
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/92343)
## Language: Python

모든 경우의 수를 탐색하는 완전탐색 문제 유형이다.

루트 노드 부터 순회를 시작하면서, 양과 늑대의 수를 비교하면서 순회를 하게 되고, 만약 늑대의 수가 양의 수 이상이 되게 되면 양이 모두 잡아 먹히게 된다. --> 이는 순회의 종료를 뜻한다.

순회가 종료하게 되는 경우는 아래의 2가지이다.

1. 모든 노드를 다 탐색하는 경우
2. 양이 모두 잡아 먹히는 경우 

특정 노드를 순회하게 되면 그 밑에 있는 자식 노드들을 방문할 수 있게 된다. 다음에 방문할 수 있는 노드의 조합을 저장하는 리스트를 둬서, 다음 순회의 후보군을 설정한다. 만약 해당 노드를 이전에 방문했으면 해당 노드에 대한 순회를 생략한다.

트리라고 해서 무조건 트리 형태의 자료구조라고 생각할 필요는 없다. 해당 문제는 graph을 이용한 풀이가 가능하다. 다만, 양방향 관계라고 생각해서 양방향을 설정하게 되면 자식-부모 간에 무한 참조가 발생하는 경우도 존재 하므로, 반드시 단방향으로 생각해야한다.

## Solution

```python
"""
length: 노드 개수
graph: 노드 연결 정보(간선)
info: 해당 노드에 들어있는 동물의 종류(양,늑대)
candidates: 다음에 방문 할 수 있는 노드의 종류
visited: 방문한 노드
sheep_count: 현재까지의 양의 마리수
wolf_count: 현재까지의 늑대의 마리수
"""
max_count=0
def dfs(length,graph,info,vertex,candidates,visited,sheep_count,wolf_count):
    global max_count
    max_count=max(max_count,sheep_count)
    
    #양이 다 잡아먹히는 경우
    if sheep_count <= wolf_count:
        return
    
    #모두 순환한 경우
    if len(visited)==length:
        return

    for candidate in candidates:
        #이미 해당 노드를 방문한 경우 순회 생략
        if candidate in visited:
            continue
        #해당 노드에 양이 들어 있는 경우
        if info[candidate] == 0:
            dfs(length,graph,info,candidate,candidates+graph[candidate],visited+[candidate],sheep_count+1,wolf_count)
        #해당 노드에 늑대가 들어있는 경우
        else:
            dfs(length,graph,info,candidate,candidates+graph[candidate],visited+[candidate],sheep_count,wolf_count+1)
              
def solution(info, edges):
    answer = 0
    num=len(info)
    
    graph=[[] for i in range(num)]
    
    for v1,v2 in edges:
        graph[v1].append(v2)
    
    dfs(num,graph,info,0,graph[0],[0],1,0)
    
    answer=max_count
    return answer
```
