---
title: "Python Regular Expression"
excerpt: "파이썬 re 모듈을 활용한 정규표현식 사용"

categories:
  - Tip
tags:
  - python
  - regular_expression
---

# Python Regular Expression

정규식 기반으로 탐색을 진행할 수 있어, crawling, pattern matching 유형의 문제를 효과적으로 풀이할 수 있다.

## 메타 문자

정규식에서 특정 의미를 나타내는 기호를 의미하는 것으로 특정 패턴을 나타내고자 할 때 메타 문자를 활용한다.

> 자주 사용되는 기호

|symbol|definition|synonym|
|--|--|--|
|[^]|not의 의미로, 해당 문자들은 사용되지 않는다.||
|^[]|특정 문자 클래스로 시작하는 문자열을 파싱함||
|[]$|특정 문자 클래스로 끝나는 문자열을 파싱함||
|\d|0~9 까지의 모든 숫자를 의미|[0-9]|
|\d|0~9 까지의 모든 숫자를 의미|[0-9]|
|\d|0~9 까지의 모든 숫자를 의미|[0-9]|
|\D|숫자를 제외한 나머지 문자|[^0-9]|
|\s|whitespace에 대응되는 문자를 의미|[ \t\n\r\f\v]|
|\S|whitespace가 아닌 모든 문자|[^ \t\n\r\f\v]|
|\w|숫자와 알파벳의 조합을 나타낸다.|[0-9a-zA-Z]|
|\W|숫자, 알파벳을 제외한 모든 문자|[^0-9a-zA-Z]|

알파벳, 숫자, 공백의 경우 많이 쓰이는 문자 클래스로 특정 기호로 나타낼 수 있다.

> 문자 클래스

사용될 수 있는 문자의 조합을 나타내기 위해 []을 이용하여 제한한다.

```
[0-9 ]: 숫자와 공백이 올 수 있다
[a-g]: a~g 까지의 문자가 올 수 있다.
```

> Dot
'\n'을 제외한 모든 문자

```
a.b ==> a0b,acb,a3b ... 등이 해당된다.
```

**.을 표현하기 위해서는 [.]을 활용해야한다.**

> 반복

특정 문자 클래스에 대한 반복이 있는 경우, *,+를 활용하여 반복을 표현할 수 있다.

*은 0개 이상의 문자가 반복됨을 의미한다.
+은 1개 이상의 문자가 반복됨을 의미한다.
{m,n}은 m개 이상, n개 이하의 문자가 반복됨을 의미한다.

*은 {0,}, +은 {1,}로 나타낼 수 있다.

```
ab*c ==> ac, abc, abbc  ...
ab+c ==> abc, abbc, abbbc ...
ab{2,5}c ==> abbc, abbbc, abbbbc ...
```

> 선택

?은 특정 문자가 올 수 있음을 의미한다.

```
ab?c ==> abc, ac
```

### 정규표현식 예시

1. 전화번호

```
(\d{3})-(\d{4})-(\d{4})
```
()을 사용하였는데, 이는 그룹을 묶는 기준을 정의하는 것이다. 위와 같이 표현하면 총 3개의 그룹으로 표현된다.

2. 이메일

```
([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-]+)\.([a-zA-Z0-9_\-]+)
```

이메일의 경우 계정@도메인@최상위도메인 형태로 나타낼 수 있다.

## re 모듈 함수

python re 모듈에서 제공해주는 함수를 활용하여 문자열 내부에 정규식을 통한 검색을 쉽게 할 수 있다.

> match

특정 문자열의 처음부터 정규식과 매칭되는 지 확인한다.

```python
import re
pattern=re.compile('[0-9]+')

print(pattern.match("python3"))
==> None

print(pattern.match("3697 python3"))
==> <re.Match object; span=(0, 4), match='3697'>
```

> search

match 와 유사하지만, 특정 문자열의 중간에서부터 매칭되어도 문자열을 패턴을 추출할 수 있다.

```python
import re
pattern=re.compile('[0-9]+')

print(pattern.match("python3"))
==> <re.Match object; span=(6, 7), match='3'>

print(pattern.match("3697 python3"))
==> <re.Match object; span=(0, 4), match='3697'>
```

> findall

매칭되는 모든 pattern에 대한 추출을 수행한다.

```python
import re
pattern=re.compile('[0-9]+')

print(pattern.findall("3697 python3"))
==> ['3697', '3']
```

> finditer

findall 과 유사하지만, match 객체 리스트로 반환한다.

```python
print(pattern.findall("3697 python3"))
==> <callable_iterator object at 0x000002AA859DE080>

matchings=pattern.finditer("3697 python3")

for matching in matchings:
    print(matching)

<re.Match object; span=(0, 4), match='3697'>
<re.Match object; span=(11, 12), match='3'>
```

> match 객체에서 제공하는 함수

|function|description|
|--|--|
|group|매치된 문자열 반환|
|start|문자열의 시작 위치 반환|
|end|문자열의 끝 위치 반환|
|span|문자열의 시작, 끝 위치를 튜플 형태로 반환|
|groups|문자열 내부에 그룹이 있는 경우 그룹들을 리스트 형태로 반환|

```python
>>> matching=pattern.match("3697 python3")
>>> matching.group()
'3697'
>>> matching.start()
0
>>> matching.end()
4
>>> matching.span()
(0, 4)

#groups()

>>> pattern=re.compile("(\d{3})-(\d{4})-(\d{4})")
>>> pattern.match("010-1234-5678")
<re.Match object; span=(0, 13), match='010-1234-5678'>
>>> matching=pattern.match("010-1234-5678")
>>> matching.group()
'010-1234-5678'
>>> matching.groups()
('010', '1234', '5678')
```



