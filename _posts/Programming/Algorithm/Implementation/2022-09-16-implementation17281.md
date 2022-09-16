---
title: "[BOJ] Q17281 야구"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - permutations
  - codetest
  - boj
  - samsung
  - try_again
---
# [BOJ] Q17281 야구
## [Question](https://www.acmicpc.net/problem/17281)
## Language: Python
## Difficulty: Gold 4

모든 경우에 대해 조사하는 bruteforce 유형의 문제이다.

4번 타자를 제외한 나머지 타순은 모두 랜덤이므로, permutation을 이용해서 타순을 지정한다.

```python
for permutation in permutations([1,2,3,4,5,6,7,8]):
        batter_orders=list(permutation)
        batter_orders.insert(3,0)
```

그런 각 이닝 별로 1루타,2루타,3루타,홈런,아웃을 처리한다.

```python
#1루타:
score+=base3
base1,base2,base3=1,base1,base2 

#2루타:
score+=(base2+base3)
base1,base2,base3=0,1,base1

#3루타:
score+=(base1+base2+base3)
base1,base2,base3=0,0,1

#홈런 --> 모두 출루
score+=(base1+base2+base3+1)
base1,base2,base3=0,0,0

#아웃:
outs+=1
```

> 주의사항

이때, 처음에는 base를 deque()로 관리해서 매번 appendleft/pop을 반복했는데, 이렇게 되면 삽입/삭제가 너무 빈번하게 발생하여 반복횟수가 증가하게 된다.

따라서, base1,base2,base3와 같이 관리하여 효율적으로 진루 처리를 할 수 있다.


## Solution

```python
from itertools import permutations
from collections import deque
def solution():
    max_score=0
    for permutation in permutations([1,2,3,4,5,6,7,8]):
        batter_orders=list(permutation)
        #4번 타자
        batter_orders.insert(3,0)

        #점수
        score=0       
        #다음 타순
        next_index=0

        #이닝
        for i in range(N):
            #루
            base1,base2,base3=0,0,0
            #아웃
            outs=0    
            #out이 3번이 될때 까지 타순 반복
            while outs < 3:
                option=players[i][batter_orders[next_index]]
                #1루타:
                if option==1:
                    score+=base3
                    base1,base2,base3=1,base1,base2
                    
                #2루타:
                elif option==2:
                    score+=(base2+base3)
                    base1,base2,base3=0,1,base1
                    

                #3루타:
                elif option==3:
                    score+=(base1+base2+base3)
                    base1,base2,base3=0,0,1

                #홈런 --> 모두 출루
                elif option==4:
                    score+=(base1+base2+base3+1)
                    base1,base2,base3=0,0,0
                #아웃:
                else:
                    outs+=1

                #다음 타선
                next_index=(next_index+1)%9

        max_score=max(max_score,score)

    return max_score



if __name__ == "__main__":
    N=int(input())
    players=[list(map(int,input().split())) for _ in range(N)]
    
    print(solution())
```