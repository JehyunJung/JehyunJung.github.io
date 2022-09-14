---
title: "[Programmers] P17685 자동완성"
excerpt: "2018 카카오 공채 3차 문제 5"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P17685 자동완성
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/17685)
## Language: Python

해당 문제는 Trie algorithm을 응요해서 해결하는 문제이다.

1. 해당 노드의 자식에 대응되는 key 값이 없는 경우 [value, children] 값을 만들어준다.
2. 해당 문자열을 끝까지 도달할 때 까지 trie 노드를 순회하면서 trie에 데이터를 넣는다.

3. trie의 root에서 부터 내려오면서 해당 문자열에 대한 prefix 개수를 확인한다.
    - 3.1: 순회 과정에서 value가 1이라는 의미는 해당 경로 1개라는 의미로, 특정 문자열만을 뜻하게 되므로 순회를 종료한다.
    - 3.2: 모든 prefix을 봤는데도, value가 1이 없다는 것은 다른 문자열에 해당 문자열이 포함되어 있는 경우가 존재한다는 의미이므로, 해당 문자열의 길이 만큼이 prefix가 되는 것이다.


## Solution 1

```python
def solution(words):
    answer = 0
    words.sort()
    trie={}
    
    for word in words:
        cur_trie=trie
        for char in word:
            #1
            cur_trie.setdefault(char,[0,{}])
            cur_trie[char][0]+=1
            #2
            cur_trie=cur_trie[char][1]         
            
    
    for word in words:
        cur_trie=trie
        for i in range(len(word)):
            #3-1
            if cur_trie[word[i]][0]==1:
                break
            cur_trie=cur_trie[word[i]][1]
        #3-2
        answer+=(i+1)
    
    return answer 
```

아니면 아래와 같이 모든 단어에 대해 사전순으로 비교해서 인접한 문자열에 대한 비교를 수행하여 더 긴 prefix 길이를 구한다.

## Solution 2

```python
def solution(words):
    answer = 0
    words.sort()
    
    for idx, word in enumerate(words):
        res=1
        if idx > 0:  
            for i,char in enumerate(word):
                res=max(res,i+1)
                if len(words[idx-1])==i or words[idx-1][i] != char:
                    break
                
        if idx+1 < len(words):
            for i,char in enumerate(word):
                res=max(res,i+1)
                if len(words[idx+1])==i or words[idx+1][i] != char:
                    break
        answer+=res
        
    return answer
```

> Trie Algorithm

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
            if char in current_node.children:
                current_node=current_node.children[char]
            else:
                return False
        
        if current_node.data:
            return True
        else:
            return False
    
    def starts_with(self,prefix):
        current_node=self.head
        words=[]
        for p in prefix:
            if p in current_node.children:
                current_node=current_node.children[p]
            else:
                return None
        current_node=[current_node]
        nodes=[]
        
        while True:
            for node in current_node:
                if node.data:
                    words.append(node.data)
                nodes.extend(list(node.children.values()))
            
            if len(nodes) !=0:
                current_node=nodes
                nodes=[]
            else:
                break
                
        return words 
```


