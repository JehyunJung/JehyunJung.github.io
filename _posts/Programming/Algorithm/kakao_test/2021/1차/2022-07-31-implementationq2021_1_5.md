---
title: "[Programmers] P72414 광고 삽입"
excerpt: "2021 카카오 공채 1차 문제 5"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P72414 광고 삽입
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/72414)
## Language: Python


![p72414.png](/assets/images/algorithm/p72414.png)

1. 우선 각 초별, 시청자 수를 배열에 저장해야한다. 
위와 같이, 로그 리스트를 분석해서, 각각의 시청자가 언제 보기 시작했는지, 언제 그만 봤는지를 분석해서 시청자가 들어오고 빠져나가는 순간을 파악해야한다. 시청자가 들어오면 1을 추가하고, 시청자가 나갔으면 1을 빼준다. 그렇게 시청자 변화 리스트를 파악하게 되면 해당 리스트를 토대로 각 초별 시청자수의 수를 구해야한다.

```python
for i in range(1,play_time+1):
    times[i]+=times[i-1]
```
이전에 시청자가 1이었고, 다음에 시청자가 빠져나가지 않는다면 시청자는 1이다. 만약 2였으면 2로 유지된다. 이런 식으로 이전의 값을 토대로 현재 초의 시청자 수를 구한다.

2. 이렇게 각 초별 시청자 수를 구하게 되면 다음은 시청자 수의 합이 가장 큰 구간을 찾아야한다. 구간은 광고를 재생하는 시간동안의 크기로, 고정되어있는 크기이다. 따라서 시작값을 0부터 시작해서 한 칸씩 늘려보면서 최대 시청자 수 합을 가지는 구간을 구할 수 있다.

이렇게 하므로써 반복 횟수를 O(n<<sup>2</sup>>)에서 O(n)으로 줄일 수 있게 된다.

해당 문제는 각 초별 시청자수를 기록한 리스트만 적절하게 구하면, 이를 구간합을 통해 문제를 해결할 수 있다.

# Solution 1

```python
#HH:MM:SS -> Second 형태로 변환해주는 함수
def format_str_to_second(time_format):
    splitted=time_format.split(":")
    return int(splitted[0])*3600 + int(splitted[1])*60 + int(splitted[2])

#Second -> HH:MM:SS 형태로 변환하는 함수
def format_second_to_str(second):
    hour=second//3600
    second%=3600
    
    minute=second//60
    second%=60
    
    return "%02d:%02d:%02d" % (hour,minute,second)
    
def solution(play_time, adv_time, logs):
    answer = ''
    
    length=len(logs)
    play_time=format_str_to_second(play_time) 
    adv_length=format_str_to_second(adv_time)
    times=[0]*(play_time+1)
    
    #각각의 시청 시간에 대해 시작 시간에는 시청자수를 한 명 올리고, 끝나는 시간에는 시청자수를 한 명 내린다.
    for log in logs:
        splitted=log.split("-")
        start_time=format_str_to_second(splitted[0])
        end_time=format_str_to_second(splitted[1])
        times[start_time]+=1
        times[end_time]-=1

    #각 초 별로 시청자수를 구한다. --> 이전에 초에서 보기 시작했으면 시청자수가 1명 증가하게 되고, 만약 이전 초에서 보는 것을 중단 했으면 시청자수가 1명 줄어들게 된다.
    #각 시청자수의 변화를 토대로 각 초별 시청자수를 구한다.
    for i in range(1,play_time+1):
        times[i]+=times[i-1]

    #광고를 영상이 시작하자 삽입하게 되면 아래와 같이 0~adv 까지의 시간 시청자수만큼 보게 있게 되는 것이다.            
    prev_count=sum(times[0:adv_length+1])
    max_count=prev_count
    max_index=0
    """
    구간합과 비슷한 유형으로, 구간의 시작칸을 오른쪽으로 한 칸 이동하고, 끝나는 칸도 오른쪽으로 이동한다.
    이때, 시작칸에 대해서는 빼줘야하고, 늘어나는 끝 칸에 대해서는 더해줘야한다.
    이렇게 구간합을 갱신하면서 가장 큰 구간값을 구한다.
    """
    for start_time in range(1,play_time-adv_length+1):
        count=prev_count-times[start_time-1]+times[start_time+adv_length-1]
        
        if max_count < count:
            max_count=count
            max_index=start_time
        
        prev_count=count
    
    answer=format_second_to_str(max_index)
    return answer
```