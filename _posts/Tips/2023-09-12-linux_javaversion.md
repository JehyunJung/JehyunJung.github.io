---
title: "Changing Java Version in Linux"
excerpt: "리눅스기반의 머신에서 자바 버전 변경하기"

categories:
  - Tip
tags:
  - java
  - linux
---

# Changing Java Version in Linux

## Listing Java Versions

여러 java 버전이 설치되어 있는 경우 아래와 같이 2개이상의 자바 버전이 있는 것을 확인할 수 있다.

```sh
/usr/libexec/java_home -V
Matching Java Virtual Machines (2):
    17.0.8.1 (arm64) "Homebrew" - "OpenJDK 17.0.8.1" /opt/homebrew/Cellar/openjdk@17/17.0.8.1/libexec/openjdk.jdk/Contents/Home
    11.0.11 (x86_64) "AdoptOpenJDK" - "AdoptOpenJDK 11" /Library/Java/JavaVirtualMachines/adoptopenjdk-11.jdk/Contents/Home
/opt/homebrew/Cellar/openjdk@17/17.0.8.1/libexec/openjdk.jdk/Contents/Home
```

## Selecting Specific Java Version

java 11 버전을 사용하고자 하면 아래와 같이 지정한다.

```sh
export JAVA_HOME=$(/usr/libexec/java_home -v 11)
source ~/.zshrc
```

영구적으로 적용하고자 하면 ~/.bash_profile 이나 ~/.zshrc에 위의 export 명령문을 추가한.다