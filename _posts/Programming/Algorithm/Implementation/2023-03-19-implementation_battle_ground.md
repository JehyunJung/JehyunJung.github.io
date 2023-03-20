---
title: "[CodeTree] Battle-ground"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - codetree
  - samsung
---
# [CodeTree] Battle-ground
## [Question](https://www.codetree.ai/training-field/frequent-problems/battle-ground/)
## Language: Python
## Difficulty: Gold 2

해당 문제는 주어진 문제의 조건에 따라 시뮬레이션을 구현하면 되는 문제이다.

시뮬레이션 과정은 아래와 같다.

1. 플레이어의 이동
2-1. 이동한 자리에 플레이어가 있는 경우 싸운다.
2-1-2. 진 플레이어의 이동
2-1-2. 이긴 플레이어의 처리
2-2. 이동한 자리에 플레이어는 없고, 총이 있는 경우

> 1. 플레이어의 이동

본인의 방향대로 다음 한 칸으로 이동하고, 만약 경계을 넘어서는 경우 정반대 방향으로 1칸 이동한다.

```python
row,col,dir,start_attack,gun_info=players[current_player]
#현재 공격력
attack_point=start_attack+gun_info
next_row=row+dy[dir]
next_col=col+dx[dir]

#범위를 넘어서는 경우 방향을 반대로 해서 한 칸 간다.
if next_row < 0 or next_row >=n or next_col < 0 or next_col >=n:
    next_dir=(dir+2)%4
    players[current_player][2]=next_dir
    next_row=row+dy[next_dir]
    next_col=col+dx[next_dir]

#현재 플레이어를 이동시킨다.
players[current_player][0]=next_row
players[current_player][1]=next_col
player_map[row][col]=-1
```

> 2-1: 이동한 칸에 다른 플레이어가 있으면 싸운다.

이때, 플레이어의 공격력 + 총의 합산을 비교해서 더 높은 쪽이 승자가 되며, 만약 동일한 경우 플레이어의 공격력을 비교한다.

```python
#해당 자리에 플레이어가 있는 경우
opposite_player=player_map[next_row][next_col]
if opposite_player!=-1:
    opposite_row,opposite_col,opposite_dir,opposite_start_attack,opposite_gun_info=players[opposite_player]

    #상대방의 공격력
    opposite_attack_point=opposite_start_attack+opposite_gun_info
    winner,loser=-1,-1
    #상대방의 공격력이 더 높은 경우
    if attack_point < opposite_attack_point:
        winner,loser=opposite_player,current_player
    
    #공격력이 서로 같은 경우, 플레이어의 초기 공격력을 비교한다.
    elif attack_point == opposite_attack_point:
        if start_attack < opposite_start_attack:
            winner,loser=opposite_player,current_player
        else:
            winner,loser=current_player,opposite_player
    #현재 플레이어의 공격력이 높은 경우
    else:
        winner,loser=current_player,opposite_player
    
    winning_point=abs(attack_point-opposite_attack_point)
```

> 2-1-1: 진 플레이어의 이동

진 플레이어는 다음 칸으로 이동하게 되는데, 이때 다음 칸이 경계를 넘어서거나 다른 플레이어가 있는 경우 빈칸을 찾을때 까지 오른쪽으로 계속 회전한다.
진 플레이어는 다음 칸으로 이동하기 전에 총을 소유하고 있으면 그 자리에 총을 버리고, 만약 이동한 다음 칸에 총이 있는 경우 해당 총을 소유한다.

```python
#진 플레이어
loser_row,loser_col,loser_dir,_,loser_gun_info=players[loser]

loser_next_row=loser_row+dy[loser_dir]
loser_next_col=loser_col+dx[loser_dir]

#범위를 넘어서거나 해당 자리에 플레이어가 있는 경우 오른쪽으로 90도씩 회전해서 빈칸을 찾도록한다.
while loser_next_row < 0 or loser_next_row >=n or loser_next_col < 0 or loser_next_col >=n or player_map[loser_next_row][loser_next_col] !=-1:
    loser_dir=(loser_dir+1)%4
    loser_next_row=loser_row+dy[loser_dir]
    loser_next_col=loser_col+dx[loser_dir]  

players[loser][2]=loser_dir

#새로운 자리로 이동시킨다.
players[loser][0]=loser_next_row
players[loser][1]=loser_next_col
player_map[loser_next_row][loser_next_col]=loser

#총을 버리고
heappush(gun_map[loser_row][loser_col],-loser_gun_info)
players[loser][4]=0
#새로운 자리에 총이 있는 경우 먹는다.
if gun_map[loser_next_row][loser_next_col] != []:
    players[loser][4]=-1*heappop(gun_map[loser_next_row][loser_next_col])
```

> 2-1-2: 이긴 플레이어의 이동

이긴 플레이어는 합산 공격력의 차이 만큼을 포인트로 얻고, 해당 격자에 있는 총들 중에서 가장 높은 공격력의 총을 소유한다.

```python
#승리한 플레이어
winner_row,winner_col,winner_dir,_,winner_gun_info=players[winner]
points[winner]+=winning_point
heappush(gun_map[winner_row][winner_col],-winner_gun_info)
#가장 높은 공격력의 총을 소유한다.
players[winner][4]=-1*heappop(gun_map[winner_row][winner_col])

#플레이어맵에 이긴 사용자를 입력한다.
player_map[winner_row][winner_col]=winner
```

> 2-2: 이동한 다음 칸에 플레이어가 없는 경우

현재 사용자가 이동한 다음칸에 플레이어가 없고, 총이 있는 경우 가장 높은 공격력의 총을 소유한다.

```python
elif gun_map[next_row][next_col] != []:
#가장 높은 공격력의 총을 소유한다.
heappush(gun_map[next_row][next_col],-gun_info)
players[current_player][4]=-1*heappop(gun_map[next_row][next_col])
```


## Solution 

```python
from heapq import heappush,heappop
def solution():
    gun_map=[[[] for _ in range(n)] for _ in range(n)]
    player_map=[[-1] * n for _ in range(n)]
    points=[0]*m
    dy=[-1,0,1,0]
    dx=[0,1,0,-1]

    #총이 있는 위치를 표기
    for row in range(n):
        for col in range(n):
            gun=guns[row][col]
            if gun !=0:
               heappush(gun_map[row][col],-gun)
    
    #플레이어의 위치 표기
    for num in range(m):
        players[num][0]-=1
        players[num][1]-=1
        row,col=players[num][0],players[num][1]
        player_map[row][col]=num
        #총의 정보 추가
        players[num].append(0)
    
    
    #시뮬레이션 진행
    for _ in range(k):
        for current_player in range(m):
            row,col,dir,start_attack,gun_info=players[current_player]

            #현재 공격력
            attack_point=start_attack+gun_info
            next_row=row+dy[dir]
            next_col=col+dx[dir]

            #범위를 넘어서는 경우 방향을 반대로 해서 한 칸 간다.
            if next_row < 0 or next_row >=n or next_col < 0 or next_col >=n:
                next_dir=(dir+2)%4
                players[current_player][2]=next_dir
                next_row=row+dy[next_dir]
                next_col=col+dx[next_dir]
            
            #현재 플레이어를 이동시킨다.
            players[current_player][0]=next_row
            players[current_player][1]=next_col
            player_map[row][col]=-1

            opposite_player=player_map[next_row][next_col]
            player_map[next_row][next_col]=current_player

            #해당 자리에 플레이어가 있는 경우
            if opposite_player!=-1:
                opposite_row,opposite_col,opposite_dir,opposite_start_attack,opposite_gun_info=players[opposite_player]

                #상대방의 공격력
                opposite_attack_point=opposite_start_attack+opposite_gun_info
                winner,loser=-1,-1
                #상대방의 공격력이 더 높은 경우
                if attack_point < opposite_attack_point:
                    winner,loser=opposite_player,current_player
                
                #공격력이 서로 같은 경우, 플레이어의 초기 공격력을 비교한다.
                elif attack_point == opposite_attack_point:
                    if start_attack < opposite_start_attack:
                        winner,loser=opposite_player,current_player
                    else:
                        winner,loser=current_player,opposite_player
                #현재 플레이어의 공격력이 높은 경우
                else:
                    winner,loser=current_player,opposite_player
                
                winning_point=abs(attack_point-opposite_attack_point)

                #진 플레이어
                loser_row,loser_col,loser_dir,_,loser_gun_info=players[loser]
                loser_next_row=loser_row+dy[loser_dir]
                loser_next_col=loser_col+dx[loser_dir]

                #범위를 넘어서거나 해당 자리에 플레이어가 있는 경우 오른쪽으로 90도씩 회전해서 빈칸을 찾도록한다.
                while loser_next_row < 0 or loser_next_row >=n or loser_next_col < 0 or loser_next_col >=n or player_map[loser_next_row][loser_next_col] !=-1:
                    loser_dir=(loser_dir+1)%4
                    loser_next_row=loser_row+dy[loser_dir]
                    loser_next_col=loser_col+dx[loser_dir]  
                players[loser][2]=loser_dir

                #새로운 자리로 이동시킨다.
                players[loser][0]=loser_next_row
                players[loser][1]=loser_next_col
                player_map[loser_next_row][loser_next_col]=loser

                #총을 버리고
                heappush(gun_map[loser_row][loser_col],-loser_gun_info)
                players[loser][4]=0
                #새로운 자리에 총이 있는 경우 먹는다.
                if gun_map[loser_next_row][loser_next_col] != []:
                    players[loser][4]=-1*heappop(gun_map[loser_next_row][loser_next_col])

                #승리한 플레이어
                winner_row,winner_col,winner_dir,_,winner_gun_info=players[winner]
                points[winner]+=winning_point
                heappush(gun_map[winner_row][winner_col],-winner_gun_info)
                #가장 높은 공격력의 총을 소유한다.
                players[winner][4]=-1*heappop(gun_map[winner_row][winner_col])

                #플레이어맵에 이긴 사용자를 입력한다.
                player_map[winner_row][winner_col]=winner


            #플레이어는 없고
            elif gun_map[next_row][next_col] != []:
                #가장 높은 공격력의 총을 소유한다.
                heappush(gun_map[next_row][next_col],-gun_info)
                players[current_player][4]=-1*heappop(gun_map[next_row][next_col])


    print(*points)  
        
if __name__ == "__main__":
    n,m,k=map(int,input().split())
    guns=[list(map(int,input().split())) for _ in range(n)]
    players=[list(map(int,input().split())) for _ in range(m)]

    solution()

```
