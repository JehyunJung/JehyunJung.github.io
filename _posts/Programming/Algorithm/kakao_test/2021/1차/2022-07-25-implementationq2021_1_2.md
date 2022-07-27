---
title: "[Programmers] P72411 메뉴 리뉴얼"
excerpt: "2021 카카오 공채 1차 문제 2"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P72411 신규 아이디 추천
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/P72411)
## Language: Python

처음 주어진 조합 개수에 따라 세트로 만들 음식의 조합들을 구해서, 각가의 사람들이 주문 단품 목록 중에 세트 음식이 포함되는 사람의 명수를 구하는 방향으로 진행하려 했다. 
음식이 포함되어 있느지 여부를 판단하기 위해 Bitmasking 방식을 이용하였다.


## Solution 1

```python
from itertools import combinations

def bit_converter(combination):
    type_conversion={chr(index): index-ord("A")+1 for index in range(ord("A"),ord("A")+26)}
    bit=1
    
    for char in combination:
        bit |= 1 << type_conversion[char]     
    return bit

def re_bit_converter(bit):
    type_conversion={index-ord("A")+1: chr(index) for index in range(ord("A"),ord("A")+26)}
    string=""
    for i in range(26,0,-1):
        if bit - int(pow(2,i)) >=0:
            string+=type_conversion[i]
            bit-=int(pow(2,i))
    return string[::-1]

def solution(orders, course):
    answer = []
    #각각의 단품 목록에 대해 비트로 표현
    order_bits=[(order,bit_converter(order)) for order in orders]
    for set_menu_count in course:
        #특정 음식 조합 개수에 대한 음식 조합 목록, 비트로 저장해놓는다.
        menu_combinations=set([bit_converter(combination) for order in orders for combination in list(combinations(order,set_menu_count))])
        candidates=[]
        
        for combination_bit in menu_combinations:
            count=0
            #각각의 사람들에 대해 해당 음식 조합을 포함하고 있는 지 여부를 비트를 이용해서 검사
            for order,order_bit in order_bits:
                if combination_bit & order_bit == combination_bit:
                    count+=1
            #해당 음식 조합에 대해 음식조합을 주문한 사람의 명수, 음식 조합을 함께 저장      
            candidates.append((count,combination_bit))
        #이를 사람 명수 순으로 정렬
        candidates.sort(key=lambda x: -x[0])
        if len(candidates)==0:
            continue
        #사람들이 가장 많이 주문한 음식 조합이 여러 개 있을 수 있으므로 이에 대한 처리를 수행한다.
        max_count=candidates[0][0]
        if max_count< 2:
            continue
            
        for count,candidate in candidates:
            if count!=max_count:
                break
            #비트로 저장되어 있는 것을 다시 문자열로 풀어낸다.
            answer.append(re_bit_converter(candidate))
        answer.sort()
        
        
    return answer
```
하지만, 이렇게 하다 보니 반복을 여러 번 해야하는 부분이 존재했다.
그래서, 아래와 같이 Counter을 이용하는 방법으로 다시 풀이하였다.
원래는 음식 조합을 Set으로 해서 중복되지 않게 했는데, 이는 잘못된 해석이었다. 해당 음식의 조합이 반복되는 횟수가 해당 음식 조합을 주문한 사람의 명수를 나타내는 것이다. 그래서 이를 Counter을 이용해서 해당 음식 조합을 주문한 사람의 명수를 쉽게 구할 수 있다.

## Solution 2

```python
from itertools import combinations
from collections import Counter

def solution(orders, course):
    answer = []
    for set_menu_count in course:
        order_combinations=[]
        for order in orders:
            #음식 조합에 대한 목록
            order_combinations+=list(combinations(sorted(order),set_menu_count))
        #해당 음식 조합에 대해 Counter을 이용해서 음식 조합이 반복되는 횟수를 구한다.            
        most_ordered=Counter(order_combinations).most_common()
        #찾은 음식 조합에 대해서, 음식 조합이 적어도 2명 이상의 사람으로부터 주문 되었는지 확인하고, 해당 음식 조합을 주문한 사람이 가장 많은 경우인지 판단해서 추출한다.
        answer+=[key for key,value in most_ordered if value >1 and value == most_ordered[0][1]]
    #음식 조합에 대해, 이를 문자열로 다시 만들어낸다.
    answer=sorted(["".join(combination) for combination in answer])

    return answer
```
