---
title: "[BOJ] Q17471 게리멘더링"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - bfs
  - combination
  - codetest
  - boj
  - samsung
  - try_again
---
# [BOJ] Q17471 게리멘더링
## [Question](https://www.acmicpc.net/problem/17471)
## Language: Python
## Difficulty: Gold 3

해당 문제의 핵심은 그룹을 2개로 나눌 때, 조합의 개념을 활용하는 것이다. 
combinations 모듈을 활용해서, group을 서로 분리하고, bfs을 이용해서 해당 그룹 내 vertex가 서로 연결되어 있는 지 여부를 판별한다.

## Solution

```python
from math import inf
from collections import deque
from itertools import combinations

#해당 그룹이 서로 연결되어 있는 확인하기 위해 bfs을 활용한다.
def bfs(group):
    vertex=group[0]
    visited=set()
    #인구수 저장
    population=0
    queue=deque([vertex])
    visited.add(vertex)

    while queue:
        vertex=queue.popleft()
        population+=populations[vertex]
        for adj_vertex in graph[vertex]:
            #다음 노드가 방문되지 않았고, 현재 그룹에 속해 있는 경우에 대해서만 bfs 계속 수행
            if adj_vertex not in visited and adj_vertex in group:
                visited.add(adj_vertex)
                queue.append(adj_vertex)
    
    #해당 그룹내 인구수 합과 해당 그룹간의 방문 정보(이를 통해 서로 연결되어 있음을 확인가능)
    return population, len(visited)


def solution():
    areas=[i for i in range(n)]
    min_difference=inf
    for i in range(1,n//2+1):
        for combination in combinations(areas,i):
            popul1,length1=bfs(combination)
            popul2,length2=bfs(list(set(areas).difference(set(combination))))

            if length1 + length2 == n:
                min_difference=min(min_difference,abs(popul1-popul2))
    
    if min_difference==inf:
        return -1
    else:
        return min_difference

if __name__ == "__main__":
    n=int(input())
    populations=list(map(int,input().split()))
    graph=[[] for _ in range(n)]
    for vertex in range(n):
        connected_vertices=list(map(int,input().split()))

        for adj_vertex in connected_vertices[1:]:
            graph[vertex].append(adj_vertex-1)
        graph[vertex].sort()
    print(solution())
    


```