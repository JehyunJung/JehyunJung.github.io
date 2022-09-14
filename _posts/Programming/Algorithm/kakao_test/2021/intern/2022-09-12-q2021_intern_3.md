---
title: "[Programmers] P81303 표 편집"
excerpt: "2021 카카오 인턴 3"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P81303 표 편집
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/81303)
## Language: Python

해당 문제는 표에 대해서 삭제/복구 작업을 수행하면서 처음의 표와 비교해서 변화된 부분을 파악하는 것이 관건이다. 중간에 행을 삭제하게 되면, 행 번호가 변경될 수 있기 때문에 이를 일반적인 리스트로 처리하면 안된다.

--> 링크드 리스트 형태로 관리해서 처리하도록 한다.

```python
class Node():
    def __init__(self,i):
        self.remove=False
        self.left=i-1
        self.right=i+1

Tree=[Node(i) for i in range(n)]
```

> 삭제

삭제를 하게 되는 경우, 삭제되는 노드의 왼쪽 노드와, 오른쪽 노드를 서로 연결시켜준다.

![linked_list_delete](/assets/images/algorithm/linked_list_delete.jpg)

```python
left_Node=Tree[cursor].left
right_Node=Tree[cursor].right 

#마지막 노드인 경우 cursor는 왼쪽으로 이동하게 된다.
cursor=left_Node

#왼쪽 노드가 존재하는 경우
if left_Node:
    Tree[left_Node].right=right_Node
    
#오른쪽 노드가 존재하는 경우(마지막 노드가 아닌 경우에 대해서는 cursor을 오른쪽으로 이동)
if right_Node:
    Tree[right_Node].left=left_Node
    cursor=right_Node
```

> 복구

복구 시, 들어가게 되는 노드의 위치에서 왼쪽,오른쪽 노드의 관계를 재정리한다.

![linked_list_recover](/assets/images/algorithm/linked_list_recover.jpg)

```python
left_Node=Tree[recovered_node].left
right_Node=Tree[recovered_node].right

if left_Node:
    Tree[left_Node].right=recovered_node
if right_Node:
    Tree[right_Node].left=recovered_node
```

## Solution

```python
class Node():
    def __init__(self,i):
        self.remove=False
        self.left=i-1
        self.right=i+1
    
def solution(n, k, cmd):
    answer = ''
    #연결리스트
    Tree=[Node(i) for i in range(n)]
    #처음과 끝 노드에 대한 처리
    Tree[0].left=None
    Tree[n-1].right=None
    
    cursor=k  
    deletes=[]
    
    for command in cmd:
        #cursor 이동
        if command[0] == "U":
            option,value=command.split()
            value=int(value)
            
            for _ in range(value):
                cursor=Tree[cursor].left
                
        elif command[0] == "D":
            option,value=command.split()
            value=int(value)
            
            for _ in range(value):
                cursor=Tree[cursor].right
                 
        #삭제
        elif command[0] == "C":
            Tree[cursor].remove=True
            deletes.append(cursor)
            left_Node=Tree[cursor].left
            right_Node=Tree[cursor].right 
            
            #마지막 노드인 경우 cursor는 왼쪽으로 이동하게 된다.
            cursor=left_Node
            
            #왼쪽 노드가 존재하는 경우
            if left_Node:
                Tree[left_Node].right=right_Node
                
            #오른쪽 노드가 존재하는 경우(마지막 노드가 아닌 경우에 대해서는 cursor을 오른쪽으로 이동)
            if right_Node:
                Tree[right_Node].left=left_Node
                cursor=right_Node
                        
            
      
        elif command[0] == "Z":
            recovered_node=deletes.pop()
            
            Tree[recovered_node].remove=False
            
            left_Node=Tree[recovered_node].left
            right_Node=Tree[recovered_node].right
            
            if left_Node:
                Tree[left_Node].right=recovered_node
            if right_Node:
                Tree[right_Node].left=recovered_node
    
                  
    for i in range(n):
        if Tree[i].remove:
            answer+="X"
        else:
            answer+="O"
    return answer   
```
