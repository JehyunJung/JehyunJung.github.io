---
title: "[Programmers] P60060 가사 검색"
excerpt: "2020 카카오 공채 1차 문제 4"

categories:
  - codetest
tags:
  - binary_search
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P60060 가사 검색
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/60060)
## Language: Python

## Solution
[문제 풀이]({% post_url 2022-06-09-binarysearch_p60060 %})

## Solution 2
해당 문제를 trie 구조를 이용해서 문자열을 저장한 다음, 접두사를 이용해서 검색하는 것도 가능하다. 하지만, 시간 측면에서 이분탐색을 이용하는 것이 훨씬 효율성 측면에서 좋다.
```python
class Node:
    def __init__(self,key,data=None):
        self.key=key
        self.data=data
        self.children=dict()
class Trie:
    def __init__(self):
        self.head=Node(None)
    
    def insert(self,string):
        current_node=self.head
        
        for char in string:
            current_node.children.setdefault(char,Node(char))
            current_node=current_node.children[char]
        current_node.data=string
        
    def search(self,string):
        current_node=self.head
        
        for char in string:
            if current_node.children[char]:
                current_node=current_node.children[char]
            else:
                return False
        
        if current_node.data:
            return True
        else:
            return False
        
    def starts_with(self,prefix,length):
        current_node=self.head
        
        for p in prefix:
            if p in current_node.children:
                current_node=current_node.children[p]
            else:
                return 0
        
        current_node=[current_node]
        nodes=[]
        words=[]
        depth=len(prefix)
        while True:
            for node in current_node:
                if node.data and depth==length:
                    words.append(node.data)
                nodes.extend(list(node.children.values()))
                
            if depth==length:
                break
                
            if len(nodes) !=0:
                depth+=1
                current_node=nodes
                nodes=[]  
            else:
                break
        return len(words)
        
        
        
def solution(words, queries):
    answer = []
    trie=Trie()
    reversed_trie=Trie()
    
    for word in words:
        trie.insert(word)
        reversed_trie.insert(word[::-1])
    
    for query in queries:
        length=len(query)
        if query[0] != "?":
            answer.append(trie.starts_with(query.replace("?",""),length))
        else:
            query=query[::-1]
            answer.append(reversed_trie.starts_with(query.replace("?",""),length))
    return answer
```
