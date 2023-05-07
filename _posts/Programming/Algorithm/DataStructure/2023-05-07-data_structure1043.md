---
title: "[BOJ] Q1043 거짓말"
excerpt: "set"

categories:
  - codetest
tags:
  - data_structure
  - deque
  - boj

---
# [BOJ] Q1043 거짓말
## [Question](https://www.acmicpc.net/problem/1043)
## Language: Python
## Difficulty: Gold 4

해당 문제는 set을 활용하여 간단하게 풀이하는 것이 가능하다. 진실을 아는 사람의 집합이 있을때, 각 파티에 대해서, party 갯수 만큼 반복 수행하는 과정에서 진실을 아는 사람과 겹치는 party가 있는 경우, 해당 party 내에 있는 사람들은 모두 진실을 아는 사람에 포함시키는 방식으로 진행하여 최종적으로 party에 진실을 아는 사람이 없는 경우를 더해주면 된다.

## Solution 1

```python
import sys
def solution():
    global trues
    for _ in range(m):
        for party in parties:
            if party & trues:
                trues=trues.union(party)

    count=0
    for party in parties:
        if party & trues:
            continue
        count+=1

    print(count) 

if __name__ == '__main__':
    n,m=map(int,input().split())
    trues=set(map(int,input().split()[1:]))
    parties=[set(map(int,input().split()[1:])) for _ in range(m)]

    solution()
```

## Solution 2

party 갯수만큼 반복하는 방법도 있지만, 서로 같은 파티에 연결된 경우 간선을 묶어주고 bfs을 통해 진실 아는 사람을 모두 구해서 각 파티에 대한 검증을 수행하는 방향을 고려할 수도 있다. 또한, 해당 파티에 진실을 아는 사람이 속해있는 판단하는 과정에서 bit-masking을 활용할 수도 있다.

```python
import sys
from collections import deque

def bfs(start_vertex):
    global true_bit
    queue=deque([(start_vertex)])

    while queue:
        vertex=queue.popleft()

        for adj_vertex in graph[vertex]:
            adj_vertex_bit=1 << adj_vertex
            if true_bit & adj_vertex_bit == adj_vertex_bit:
                continue
            true_bit |= adj_vertex_bit
            queue.append(adj_vertex)
                


def solution():
    global true_bit
    for true_person in trues:
        true_person_bit=1 << true_person
        if true_bit & true_person_bit == true_person_bit:
            continue
        true_bit |= true_person_bit
        bfs(true_person)

    count=0
    for party_bit in parties:
        if party_bit & true_bit == party_bit:
            continue
        count+=1

    print(count)

if __name__ == '__main__':
    n,m=map(int,input().split())
    trues=list(map(int,input().split()[1:]))
    true_bit=0
    parties=[]
    graph=[set() for _ in range(n+1)]

    for _ in range(m):
        party=list(map(int,input().split()))
        length=party[0]
        src=party[1]
        party_bit = 1 << src
        for i in range(2,length+1):
            dest=party[i]
            party_bit |= 1 << dest
            graph[src].add(dest)
            graph[dest].add(src)
        parties.append(party_bit)

    solution()
```