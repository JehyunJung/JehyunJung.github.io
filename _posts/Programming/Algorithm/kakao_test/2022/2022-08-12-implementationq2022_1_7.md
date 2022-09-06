---
title: "[Programmers] P92345 사라지는 발판"
excerpt: "2022 카카오 공채 문제 7"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
  - prefix_sum
---
# [Programmers] P92345 사라지는 발판
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/92345)
## Language: Python










## Solution

```python
from math import inf
def dfs(graph,turn,locations,counts,option,winning_player):    
    location=locations[turn]
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]
    rows=len(graph)
    cols=len(graph[0])

    if graph[location[0]][location[1]] == 0:
        return 0
    ret=0
    
    for dir in range(4):
        new_row=location[0]+dy[dir]
        new_col=location[1]+dx[dir]
        
        if new_row < 0 or new_row >= rows or new_col < 0 or new_col >=cols:
            continue
        
        if graph[new_row][new_col]==0:
            continue  
            
        graph[location[0]][location[1]]=0
        locations[turn]=[new_row,new_col]
        counts[turn]+=1
        
        val=dfs(graph,1-turn,locations,counts,option,winning_player)+1
        
        graph[location[0]][location[1]]=1
        locations[turn]=location
        counts[turn]-=1
        
        if ret % 2 ==0 and val % 2 ==1:
            ret=val
        elif ret %2 ==0 and val % 2==0:
            ret=max(ret,val)
        elif ret %2 ==1 and val % 2==1:
            ret=min(ret,val)
    
    return ret
        
        
    
def solution(board, aloc, bloc):
    answer = -1
    locations=[aloc,bloc]
    
    answer=dfs(board,0,locations,[0,0],False,None)

    return answer
```
