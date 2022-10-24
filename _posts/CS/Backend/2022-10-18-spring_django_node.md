---
title: "Backend Framework 간의 비교"
excerpt: "Spring vs Django vs Node"

categories:
  - backend
tags:
  - backend
  - spring
  - django
  - node
---

# Backend Framework Comparison

## Spring

### Description

Java 기반의 웹 프레임워크로써 IoC/DI을 적용해서 객체에 관한 의존성 처리를 수행하고 확장성 있는 개발이 가능하고 Container을 이용해서 Spring Bean을 관리한다. 또한 AOP 프로그래밍을 통해 하나의 공통 관심사를 한곳에서 관리할 수 있다. 기본적으로 Spring은 아래의 Spring MVC패턴 방식으로 구현되며 디스패처 서블릿을 통한 프론트 컨트롤러가 동작하게 된다.

![dispatcher_sevlet](/assets/images/jsf/front_controller_v5.png)

### Pros
- 이미 많은 기업에서 Spring을 활용해서 서버를 구성했기 때문에 그에 따른 자료가 매우 많다.
- Spring 기반으로한 다양한 라이브러리를 활용해서 많은 기능이 구현되어 있다
- 멀티 쓰레드 기반으로 

### Cons
- 많은 기능이 동작하는 만큼 어플레이션이 무겁다
- Spring Boot을 사용하지 않고 초기에 설정하게 되면 시간이 많이 걸리게 된다.

## Django

### Description

python 기반의 오픈 소스 웹 프레임워크로 ORM, MTV 패턴의 특징을 가진다. 기존의 웹 프레임워크와는 달리 Django는 특이하게 MTV패턴을 가지는데, 실질적으로 하는 역할 MVC와 같다.

![mtv](/assets/images/projects/mtv.png)

DB의 entity에 대응되는 개념으로 Model 기반으로 통신이 이루어진다.

Template은 View에 대응되며 유저에 보여지는 화면을 만들어내는 역할을 한다. html 파일과 context을 함께 랜더링해서 HTML 파일을 만들어낸다. 자체적으로 Django Tempalte을 활용해서 HTML 파일을 랜더링한다.

View는 주어진 클라이언트의 요청을 로직에 따라 처리해서 템플릿으로 랜더링해서 응답한다.

### Pros

- 다양한 라이브러리를 활용하여 빠른 개발속도, 생산성을 가진다.
- 인증, 관리, 등의 기능이 기본적으로 제공된다.
- DB 관리를 위해 관리자 페이지를 제공한다.

### Cons

- python이 가지는 언어적인 한계가 존재한다. 인터프리터 방식의 언어로 인해 실행속도가 느리다는 단점이 있다.
- ORM에 대한 개념없이는 django 프레임워크를 사용할 수 없다.
- full stack으로 개발이 가능하다는 점이 장점이자 단점으로 작용할 수 있다.

## Node

### Description

자바스크립트를 이용해서 Single Thread 기반의 Event Loop을 통해 사용자의 요청을 처리하고 File, Network에 대해서는 비동기 IO 방식으로 처리한다. Node.js는 여러 작업을 동시에 처리하기 위해 event loop을 활용한다. 

![node_js_structure](/assets/images/projects/node_js_structure.jpg)

사실 단일 스레드라고 하는 개념은 단일 호출 스택을 사용한다는 관점에서 맞는 소리 인것이다. 비동기 방식의 설계를 통해 I/O 처리를 요하는 경우 워커 쓰레드에 할당해서 비동기적으로 처리한 다음, 

> javascript 동작 원리

자바스키립트를 동작시키는 엔진으로, 내부에 memory heap과 call stack이 존재한다. java와 유사하게 heap에는 객체에 저장되고, call stack은 한줄 단위의 실행 코드가 담기게 된다.

call stack은 single thread 기반으로 동작하는데, 시간이 오래 걸리는 DB 요청/외부 api 요청과 같은 작업에 대해서는 비동기 방식으로 처리하게 된다. 이때는 thread pool에서 worker thread를 할당하는 방식으로 멀티스레드 기반에서 동작하게 된다. 

비동기 처리가 완료된 경우에 대해서는, 처리되는 콜백함수가 callback queue에서 대기 하고 있고, event loop에 의해 call stack에 할당되게 된다. 이때, call stack이 비어있을 때 callback이 할당된다. 

### Pros

- 싱글 스레드, 비동기 IO 처리에 기반한 빠른 속도를 지닌다.
- CPU의 부하를 최소화하고 많은 커넥션을 동시에 처리할 수 있는 구조에 적합하다. 개수는 많지만 크기가 작은 데이터를 실시간으로 처리해야하는 DB, Disk 작업과 같은 I/O에 특화되어 있다. 
- javascript 기반으로 동작되기 때문에 front-end 부분과 공통되는 부분이 존재한다.

### Cons

- 싱글 스레드 기반으로 동작하기 때문에 하나의 요청이 오래 걸리는 경우, 전체적인 시스템 성능에 영향을 미친다.
- Callback을 활용해서 요청을 처리하기 때문에, 가독성이 떨어지는 경향이 있다. 

## References

[comparison](https://ai-sonny.tistory.com/m/entry/spring%EA%B3%BC-Django%EC%99%80-Nodejs-%EC%B0%A8%EC%9D%B4)
[django](https://dw3232.tistory.com/m/14)
[node.js](https://meetup.toast.com/posts/89)
[동기vs비동기/blockingvsnon-blocking]