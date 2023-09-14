---
title: "Java Environment Variable"
excerpt: "local 환경 java 인식 오류"

categories:
  - Trouble_Shooting
tags:
  - java
  - troubleshooting
---

# Java Environment Variable

## 에러 내용

![environment_variable_status](/assets/images/tips/environment_variable_status.png)

위와 같이 jdk가 설치되어 있고, 환경변수로 등록되어 있음에도 불구하고 아래와 같이 java가 실행되지 않는 경우가 발생한다.

![java_execution](/assets/images/tips/java_version_check_fail.png)

## 에러 원인

해당 문제가 발생하는 원인은 java 경로에 대한 환경변수가 중복적으로 저장되면서 발생하는 문제이다. 

![duplicated_environment_variable](/assets/images/tips/duplicated_environment_variable.png)

## 에러 해결방법

사용한 java 경로에 대한 환경변수만 남겨두고 나머지 환경변수를 제거하면 정상적으로 java가 실행되게 된다.

위의 경우에는 %JAVA_HOME%\bin, %JAVA_HOME%\lib만 남기면 된다.

![java_execution](/assets/images/tips/java_version_check_success.png)
