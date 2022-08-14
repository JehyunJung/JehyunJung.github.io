---
title: "[BOJ] Q21608 상어초등학교"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - boj
  - samsung
---
# [BOJ] Q21608 상어초등학교
## [Question](https://www.acmicpc.net/problem/21608)
## Language: Python
## Difficulty: Gold 5

해당 문제는 주어진 조건을 정확하게 파악해서 이를 구현하는 것이 관건이다.

특정 학생을 배치하기 위해 아래의 조건들을 고려해야한다.

1. 인접해 있는 칸에 좋아하는 학생이 가장 많이 있는 칸에 대해서 자리를 선택한다.
2. 만약 좋아하는 학생이 있는 인접한 칸이 가장 많은 칸이 여러 개인 경우, 인접한 빈칸이 가장 많은 칸을 선택한다.
3. 인접한 빈칸이 가장 많은 칸이 여러 개인 경우, 그러한 칸 중에서 행/열이 최소가 되는 칸으로 선택한다.

위의 조건들을 구현하는 과정 자체는 어렵지 않으나, 모든 조건을 정확하게 구현하는 것이 중요하다.

해당 문제는 행/열 값이 최대 20까지로 입력값이 작은 편에 속한다. 따라서, 모든 경우에 대해서 조사를 하더라도 주어진 시간 복잡도 내에 해결하는 것이 가능하다.

## Solution

```python
def calculate_satisfaction():
    sum_satisfaction=0

    for row in range(num):
        for col in range(num):
            student_number=graph[row][col]
            satisfaction=0
            for dir in range(4):
                new_row=row+dy[dir]
                new_col=col+dx[dir]

                if new_row < 0 or new_row>=num or new_col < 0 or new_col>=num:
                    continue
                
                if graph[new_row][new_col] in favorites[student_number]:
                    satisfaction+=1
            
            if satisfaction ==0 :
                sum_satisfaction+=0
            else:
                sum_satisfaction+=(10**(satisfaction-1))
    return sum_satisfaction
                
        
def solution():
    for student in student_order:
        best_row,best_col=0,0
        favorite_space_candidates=[[] for _ in range(5)] #후보칸
        #인접한 칸의 좋아하는 학생 수
        for row in range(num):
            for col in range(num):

                #빈자리가 아닌 경우 넘어간다.
                if graph[row][col] !=0:
                    continue
                favorite_count=0
        
                for dir in range(4):
                    new_row=row+dy[dir]
                    new_col=col+dx[dir]

                    if new_row < 0 or new_row>=num or new_col < 0 or new_col>=num:
                        continue
                    
                    if graph[new_row][new_col] in favorites[student]:
                        favorite_count+=1

                favorite_space_candidates[favorite_count].append((row,col))

        blank_space_candidates=[[] for _ in range(5)]

        #인접한 칸의 빈 칸 확인
        for i in range(4,-1,-1):
            if len(favorite_space_candidates[i])==0:
                continue

            elif len(favorite_space_candidates[i])==1:
                (best_row,best_col)=favorite_space_candidates[i][0]
                break
            
            for row,col in favorite_space_candidates[i]:
                blank_count=0
                for dir in range(4):
                    new_row=row+dy[dir]
                    new_col=col+dx[dir]

                    if new_row < 0 or new_row>=num or new_col < 0 or new_col>=num:
                        continue
                    
                    if graph[new_row][new_col]==0:
                        blank_count+=1

                blank_space_candidates[blank_count].append((row,col))
            break
        #여기까지도 자리가 설정이 안되는 경우 행/열이 가장 작은 자리 반환
        for i in range(4,-1,-1):
            if len(blank_space_candidates[i])==0:
                continue

            elif len(blank_space_candidates[i])==1:
                (best_row,best_col)=blank_space_candidates[i][0]
                break


            blank_space_candidates[i].sort(key=lambda x: (x[0],x[1]))
            (best_row,best_col)=blank_space_candidates[i][0]
            break


        graph[best_row][best_col]=student
    
    return calculate_satisfaction()

    
    
if __name__ == "__main__":
    num=0
    favorites=[]
    graph=[]
    student_order=[]

    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    num=int(input())
    graph=[[0] * num for _ in range(num)]
    favorites=[[] for _ in range(num**2 +1)]
    for _ in range(num**2):
        student_num,s1,s2,s3,s4=map(int,input().split())
        student_order.append(student_num)
        favorites[student_num]=[s1,s2,s3,s4]

    print(solution())
```
