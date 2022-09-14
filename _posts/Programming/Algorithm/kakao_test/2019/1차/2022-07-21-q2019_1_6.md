---
title: "[Programmers] P42893 매칭 점수"
excerpt: "2019 카카오 공채 1차 문제 6"

categories:
  - codetest
tags:
  - implementation
  - codetest
  - Programmers
  - kakao
---
# [Programmers] P42893 매칭 점수
## [Question](https://school.programmers.co.kr/learn/courses/30/lessons/42893)
## Language: Python

1. url을 파싱하기 위한 정규 표현식 사용
2. 외부 링크를 파싱하기 위한 정규표현식 --> 외부 링크의 개수가 -> 외부 링크 점수
3. page 내부에 특정 word가 사용된 횟수(단, 명확하게 단어 단위로 구분되어야한다.)
    - 이때, 단어 단위로 분리한 다음, 검색어와 정확하게 일치하는 단어 개수를 구한다. --> 기본 점수
4. 특정 페이지에 대한 매칭 점수는 기본 점수 + 해당 페이지를 외부 링크로 가지는 페이지의 기본점수/외부링크점수 의 총합

## Solution

```python
import re
def solution(word, pages):
    answer = 0
    word=word.lower()
    #1
    url_pattern=re.compile("<meta property=\"og:url\" content=\"(\S*)\"")
    #2
    a_pattern=re.compile("<a href=\"(\S*)\"")
    #3
    word_parser=re.compile("([a-z]+)")
    
    page_infos=[]
    length=len(pages)
    
    for page in pages:
        info={}
        page=page.lower()
        info["url"]=url_pattern.findall(page)[0]
        info["links"]=a_pattern.findall(page) 
        #3 기본 점수
        info["basic_point"]=word_parser.findall(page).count(word) 
        #외부 링크 점수
        info["outer_link_point"]=len(info["links"])
        page_infos.append(info)
          
    matching_point=0
    for i in range(length):
        page=page_infos[i]
        #현재 페이지의 기본점수
        point=page["basic_point"]
        for j in range(length):
            if i==j:
                continue
            temp_page=page_infos[j]
            #현재 페이지를 외부 링크로 포함하고 있는 다른 페이지
            if page["url"] in temp_page["links"]:
                #그러한 페이지에 대해서, 해당 페이지의 기본점수 / 외부 링크 점수
                point+=(temp_page["basic_point"]/temp_page["outer_link_point"])
        if matching_point < point:
            matching_point=point
            answer=i
    
    return answer
```
