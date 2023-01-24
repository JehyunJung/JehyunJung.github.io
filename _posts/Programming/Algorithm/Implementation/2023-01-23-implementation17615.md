---
title: "[BOJ] Q17615 볼 모으기"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - implementation
  - boj

---
# [BOJ] Q17615 볼 모으기
## [Question](https://www.acmicpc.net/problem/17615)
## Language: Python
## Difficulty: Silver 1

Silver 수준의 문제이지만, 핵심 요점을 파악하지 않으면 풀이하기 까다로운 문제의 유형이다.

R,B 두가지 색깔의 공이 배치되어있을 때 나올 수 있는 경우는 아래와 같다

```
R...R
R...B
B...R
B...B
```

따라서, 왼쪽 끝, 오른쪽 끝에 있는 공의 종류와 공의 갯수를 파악해서 한쪽으로 모으는 최소 비용을 구하면 된다.

> 공의 종류가 같은 경우

해당 종류의 공을 왼쪽 끝으로 모은 방법, 오른쪽 끝으로 모으는 방법, 다른 종류의 공을 모두 옮기는 방법, 3가지를 비교해서 최소비용을 구한다.

```python
if left_ball==right_ball:
    if left_ball == "B":
        return min(red_count,blue_count-left_ball_count,blue_count-right_ball_count)
    else:
        return min(blue_count,red_count-left_ball_count,red_count-right_ball_count)
```

> 공의 종류가 다른 경우

각각의 끝에 존재하는 공의 종류에 따라 각각의 공을 각 끝으로 모으는 경우를 비교한다

왼쪽 끝에 파란색 공이면 파란색 공은 모두 왼쪽으로 빨간색 공은 모두 오른쪽으로 모은다

```python
else:
    if left_ball=="B":
        return min(blue_count-left_ball_count,red_count-right_ball_count)
    else:
        return min(red_count-left_ball_count,blue_count-right_ball_count)
```

## Solution

```python
def solution():
    blue_count=balls.count("B")
    red_count=n-blue_count
    
    #한 종류의 공만 존재하는 경우
    if blue_count == n or red_count == n:
        return 0

    #왼쪽 끝에 있는 같은 색깔의 공의 갯수
    left_ball=balls[0]
    left_ball_count=0

    for index in range(n):
        ball=balls[index]
        if ball==left_ball:
            left_ball_count+=1
        else:
            break

    #오른쪽 끝에 있는 같은 색깔의 공의 갯수
    right_ball=balls[-1]
    right_ball_count=0

    for index in range(n-1,-1,-1):
        ball=balls[index]
        if ball==right_ball:
            right_ball_count+=1
        else:
            break

    if left_ball==right_ball:
        if left_ball == "B":
            return min(red_count,blue_count-left_ball_count,blue_count-right_ball_count)
        else:
            return min(blue_count,red_count-left_ball_count,red_count-right_ball_count)
    else:
        if left_ball=="B":
            return min(blue_count-left_ball_count,red_count-right_ball_count)
        else:
            return min(red_count-left_ball_count,blue_count-right_ball_count)
    

if __name__ == "__main__":
    n=int(input())
    balls=input()
    print(solution())

```
