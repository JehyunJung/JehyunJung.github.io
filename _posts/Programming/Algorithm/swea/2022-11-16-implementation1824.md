---
title: "[SWEA] Q1824 혁진의 프로그램 검증"
excerpt: "Implementation"

categories:
  - codetest
tags:
  - dp
  - codetest
  - samsung
---
# [SWEA] Q1824 혁진이의 프로그램 검증
## [Question](https://swexpertacademy.com/main/code/problem/problemDetail.do?contestProbId=AV4yLUiKDUoDFAUx)
## Language: Python
## Difficulty: D4

해당 문제는 주어진 로직을 통해 시뮬레이션을 진행하는 유형의 문제이다.

특정 종료조건 @에 도달할 수 있는 지를 여부를 판단하면 된다. 이때 ?을 만나게 되면 동일한 확률로 4가지 방향 중 한곳으로 이동할 수 있는데, 이를 구현하기 위해 queue을 활용한다.

이런식으로 queue 내부에서 각각의 연산자를 처리하고 다음 좌표로 이동하는 로직을 거쳐서 최종적으로 종료되는 지 확인한다.

하지만, 이대로 시뮬레이션을 진행하면 영영 종료 되지 않는 경우도 발생하는데, 이를 방지하기 위해 같은 좌표,메모리,방향을 가지는 상태에 중복적으로 도달하는 경우 탈출 할 수 있도록 visited을 관리한다.

```python
visited=[[[[False] * 4 for _ in range(16)] for _ in range(n_cols)] for _ in range(n_rows)]
```

## Solution

```python
from collections import deque
def move_coordinate(row,col,dir):
    dy = [-1, 0, 1, 0]
    dx = [0, 1, 0, -1]

    row+=dy[dir]
    if row< 0:
        row=n_rows-1
    elif row>=n_rows:
        row=0

    col+=dx[dir]
    if col < 0:
        col = n_cols - 1
    elif col >= n_cols:
        col = 0

    return row,col

def solution():
    queue=deque([(0,0,0,1)])

    visited=[[[[False] * 4 for _ in range(16)] for _ in range(n_cols)] for _ in range(n_rows)]

    while queue:
        row,col,memory,dir=queue.popleft()
        operation=operations[row][col]

        if operation == "@":
            return "YES"

        elif operation == "?":
            for next_dir in range(4):
                next_row,next_col=move_coordinate(row,col,next_dir)
                if not visited[next_row][next_col][memory][next_dir]:
                    visited[next_row][next_col][memory][next_dir] = True
                    queue.append((next_row,next_col,memory,next_dir))

        #방향 변경경
        elif operation == "<":
            dir=3
        elif operation == "^":
            dir=0
        elif operation == ">":
            dir=1
        elif operation == "v":
            dir=2

        elif operation == "_":
            if memory == 0:
                dir=1
            else:
                dir=3

        elif operation == "|":
            if memory == 0:
                dir=2
            else:
                dir=0

        elif operation ==".":
            pass

        elif "0"<=operation<="9":
            memory=int(operation)

        elif operation =="+":
            memory= memory + 1 if memory != 15 else 0

        elif operation =="-":
            memory= memory - 1 if memory != 0 else 15

        next_row,next_col=move_coordinate(row,col,dir)
        if not visited[next_row][next_col][memory][dir]:
            visited[next_row][next_col][memory][dir] = True
            queue.append((next_row, next_col, memory, dir))
    return "NO"


if __name__ == "__main__":
    n_rows,n_cols=0,0
    operations=[]
    with open("input.txt","r") as file:
        test_cases=int(file.readline())
        for case in range(test_cases):
            n_rows,n_cols=map(int,file.readline().strip().split())
            operations=[list(file.readline()) for _ in range(n_rows)]
            print(f"#{case+1} {solution()}")

```