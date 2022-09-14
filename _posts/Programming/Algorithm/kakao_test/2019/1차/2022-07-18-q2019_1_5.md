---
title: "[Programmers] P42892 길찾기 게임"
excerpt: "2019 카카오 공채 1차 문제 5"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P42892 길찾기 게임
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/42892)
## Language: Python

1. 주어진 node info 에 대해서, level이 높은순으로 정렬한다.
2. BST 자료구조를 구현하고, Insert 함수를 구현한다.
3. 전위 순회 함수 구현
4. 후위 순회 함수 구현

## Solution

```python
import sys
traverse_result=[]
#1
class Node:
    def __init__(self,key,value):
        self.key=key
        self.value=value
        self.left_children=None
        self.right_children=None
class Tree:
    def __init__(self):
        self.head=None
        
    def insert(self,key,value):
        current_node=self.head
        node=Node(key,value)
        
        while current_node:
            if current_node.value > value:
                if not current_node.left_children:
                    break
                current_node=current_node.left_children 
            else:
                if not current_node.right_children:
                    break
                current_node=current_node.right_children
        
        if not current_node:
            current_node=node
            self.head=current_node
        else:           
            if current_node.value > value:
                current_node.left_children=node
            else:
                current_node.right_children=node
#3
def pre_order(node):
    global traverse_result
    if node:
        traverse_result.append(node.key)
        pre_order(node.left_children)
        pre_order(node.right_children)

#4
def post_order(node):
    global traverse_result
    if node:
        post_order(node.left_children)
        post_order(node.right_children)
        traverse_result.append(node.key)
    
def solution(nodeinfo):
    sys.setrecursionlimit(10**6)
    global traverse_result
    answer = []
    nodes=[]
    #주어진 노드 정보에 대해서, index, x,y 좌표를 뽑아서 새로운 배열로 만든다.
    for i,coordinates in enumerate(nodeinfo):
        nodes.append((coordinates[0],coordinates[1],i+1))
    #1
    nodes.sort(key=lambda x:(-x[1],x[0]))
    tree=Tree()
    for value, level, key in nodes:
        tree.insert(key,value)
    
    #전위 순회 및 후위순회 진행
    pre_order(tree.head)
    answer.append(traverse_result)
    traverse_result=[]
    
    post_order(tree.head)
    answer.append(traverse_result)

    
    return answer
```
