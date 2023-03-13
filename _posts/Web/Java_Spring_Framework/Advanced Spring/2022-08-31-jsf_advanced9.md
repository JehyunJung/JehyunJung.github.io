---
title: "Java Spring Advanced part 9"
excerpt: "Spring AOP"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Advanced
  - inflearn
---

# Spring AOP

어플리케이션은 크게 핵심 기능과 부가 기능으로 구성되어 있다. 핵심 기능은 상품 주문 과 같은 비즈니스 로직을 의미하고, 부가 기능은 로그 추적, 트랜잭션과 같은 핵심 기능을 보조하는 보조 기능을 의미한다.

![main_sub_function](/assets/images/jsf/advanced/main_sub_function.png)

핵심 기능을 사용하는 과정에서 로그와 같은 부가 기능을 남겨야 한다면 위와 같이 하나의 객체에 핵심 기능과 부가 기능이 섞이게 된다.

![cross_cutting_concern](/assets/images/jsf/advanced/cross_cutting_concern.png)

그리고 이러한 부가 기능의 경우 여러 핵심 로직에 대해서 공통적으로 사용되게 되는데, 이처럼 하나의 부가 기능이 여러 곳에서 동일하게 사용되게 되는 개념을 횡단 관심사라고 한다.

우리는 이러한 부가기능을 사용하기 위해 원래는 핵심 로직이 들어가는 모든 부분에 중복적으로 부가기능을 담당하는 코드를 추가해야 했다. 이렇게 하면 100개의 핵심 로직에 대해 100개의 부가기능 로직이 추가되는 문제가 발생하게 되고, 이렇게 되면 부가 기능의 로직에 수정이 발생하게 되면 수정할 부분이 너무 많게 된다. 

이런 문제를 해결하기 위해서는 부가 기능에 대해 모듈화를 잘해야하는데, 이를 가능하게끔 하는 것이 AOP이다.

## AOP

### Aspect

aspect는 크게 2가지로 구성되는데, 부가 기능과 부가 기능을 어디에 적용하면 될지를 모듈 한것이다.

우리 기존에 살펴본 advisor(pointcut+ advice)도 aspect의 일종이라고 볼 수 있다.

이러한 Aspect를 이용한 Programming이 바로 AOP(Apect-Oriented-Programming)이다.

### AspectJ

이러한 AOP를 구현한 것이 대표적으로 AspectJ가 있다. SpringAOP도 실은 내부적으로 AspectJ를 이용해서 AOP 방식을 제공한다.

### AOP 적용방식

AOP는 아래와 같이 3가지 방식으로 적용하는 것이 가능하다.

아래와 같이 핵심 로직에 부가 기능을 추가하는 작업, 즉 객체를 조작하는 것을 weaving이라고 한다. 즉, pointcut을 통해 advice를 적용하는 것을 weaving이라고 한다.

> Compile

컴파일 시점에서 AOP를 적용하게 되면, .java 파일에 대해서 .class(바이트 코드)로 만드는 과정에서 일반 객체 클래스에 추가로 부가 기능을 포함시키는 것을 의미한다. 

![compile_aop](/assets/images/jsf/advanced/compile_aop.png)

단, 컴파일 시점에서 aop를 활용하기 위해서는 aspectJ가 제공하는 특별한 컴파일러를 활용해야한다.

> Loader

.class 파일을 JVM에 로딩하는 과정에 부가 기능을 포함하는 방식이 바로 Loader 방식이다. 

![loader_aop](/assets/images/jsf/advanced/loader_aop.png)

해당 방식을 활용하기 위해서는 java -javaagent와 같은 특별한 방식으로 로더 조작기를 이용해야한다.

> Proxy

Proxy 방식의 경우 이미 클래스 로더까지 끝난 상황에서, Spring Container을 통한 프록시 클래스를 만드는 방식을 통해 부가기능을 핵심 로직에 포함하는 방식이다. 즉, 지금까지 배운 Spring AOP 방식을 의미한다.

![proxy_aop](/assets/images/jsf/advanced/proxy_aop.png)

compiler, loader와 달리 특별한 옵션을 활용하지 않아도 aop 기능을 활용할 수 있게 되지만, 기능의 제약이 존재한다.

### AOP 적용 위치

AOP는 다양한 위치에 적용할 수 있다. AOP를 적용할 수 있는 위치를 우리는 Join Point라고 한다.

생성자, 필드 값, static method, method 실행, 등 여러 부분에 AOP를 적용할 수 있다. 하지만, Proxy 방식의 AOP의 경우 메소드 호출에만 적용할 수 있다. 

실제 코드를 조작하는 compiler 나 loader 방식을 활용하게 되면 조금 더 폭넓은 JoinPoint를 지정하는 것이 가능하다.

## AOP 구현

### Application

> OrderRepository

```java
@Slf4j
@Repository
public class OrderRepository {
    public String save(String itemId) {
        log.info("[orderRepository] 실행");
        //저장 로직
        if (itemId.equals("ex")) {
            throw new IllegalStateException("예외 발생!");
        }
        return "ok";
    }
}
```

> OrderService

```java
@Slf4j
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }
    public void orderItem(String itemId) {
        log.info("[orderService] 실행");
        orderRepository.save(itemId);
    }
}
```

### @Aspect를 이용한 AOP

이는 이전에 다룬 @Aspect annotation를 활용해서 Proxy를 구성하는 방식이다.

```java
@Slf4j
@Aspect
public class AspectV1 {
    @Around("execution(* hello.aop.order..*(..))")
    public Object doLog(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        log.info("[Log] {}", proceedingJoinPoint.getSignature());
        return proceedingJoinPoint.proceed();
    }
}
```

> Results

```
[log] void hello.aop.order.OrderService.orderItem(String)
[orderService] 실행
[log] String hello.aop.order.OrderRepository.save(String)
[orderRepository] 실행
```

@Around를 통해 pointcut을 명시하고, 메소드 내에 advice를 구현한다.

ProceedingJoinPoint의 getSignature()를 수행하게 되면 해당 메소드의 반환형, 패키지명, 메소드명을 포함하는 형태의 메세지를 구성할 수 있다.

위의 경우 void hello.order.Orderservice.orderItem(String) 와 같은 형태로 반환된다.

Spring에서는 Aspect가 제공해주는 interface, annotation를 이용해서 AOP 기능을 구현한다. 

spring-boot-starter-aop dependency를 추가하게 되면 aspectjweaver.jar 라이브러리가 추가되는데, 이 라이브러리를 통해 @Aspect, org.apsectj과 관련된 메소드를 활용할 수 있다.

### Pointcut 분리

@Around으로 pointcut을 바로 지정했지만, @Pointcut을 통해 pointcut을 분리해서 정의할 수 있다.

```java
@Slf4j
@Aspect
public class AspectV2 {
    @Pointcut("execution(* hello.aop.order..*(..))")
    private void allOrder() {

    }

    @Around("allOrder()")
    public Object doLog(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        log.info("[Log] {}", proceedingJoinPoint.getSignature());
        return proceedingJoinPoint.proceed();
    }
}
```

> Results

```
[log] void hello.aop.order.OrderService.orderItem(String)
[orderService] 실행
[log] String hello.aop.order.OrderRepository.save(String)
[orderRepository] 실행
```

pointcut을 정의할 때는, @Pointcut annotation과 함께, aspectJ 표현식을 통해 pointcut을 명시하고, 메소드는 본문을 비워놓은 상태로 놔둔다. 그리고 해당 pointcut을 사용하기 위해서는 포인트컷 시그니처(즉 @Pointcut이 지정된 메소드)를 지정하면 된다.

### Advice 추가

로그 출력 기능 이외에도 새로운 advice를 추가하고자 하면 아래와 같이 @Around을 추가 설정하면 된다.

```java
@Slf4j
@Aspect
public class AspectV3 {
    @Pointcut("execution(* hello.aop.order..*(..))")
    private void allOrder() {

    }
    @Pointcut("execution(* *..*Service.*(..))")
    private void allService() {

    }
    
    @Around("allOrder()")
    public Object doLog(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        log.info("[Log] {}", proceedingJoinPoint.getSignature());
        return proceedingJoinPoint.proceed();
    }
    //포인트컷 allOrder 와 allService 모두를 만족하는 경우
    @Around("allOrder() && allService()")
    public Object doTransaction(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        try {
            log.info("[트랜잭션 시작]", proceedingJoinPoint.getSignature());
            Object result = proceedingJoinPoint.proceed();
            log.info("[트랜잭션 커밋]", proceedingJoinPoint.getSignature());
            return result;
        } catch (Exception e) {
            log.info("[트랜잭션 롤백]", proceedingJoinPoint.getSignature());
            throw e;
        }
        finally {
            log.info("[리소스 릴리즈]", proceedingJoinPoint.getSignature());
        }
    }
}
```

> Results

```
[log] void hello.aop.order.OrderService.orderItem(String)
[트랜잭션 시작] void hello.aop.order.OrderService.orderItem(String)
[orderService] 실행
[log] String hello.aop.order.OrderRepository.save(String)
[orderRepository] 실행
[트랜잭션 커밋] void hello.aop.order.OrderService.orderItem(String)
[리소스 릴리즈] void hello.aop.order.OrderService.orderItem(String)
```

위를 보면, Service 가 포함된 메소드(OrderService)에 대해서만 트랜잭션 관련 로그가 출력되는 것을 확인할 수 있다.

### Pointcut 참조

외부에 Pointcut을 모아놓고, 필요한 Pointcut를 불러써 사용하는 것도 가능하다.

> Pointcuts

```java
public class Pointcuts {
    @Pointcut("execution(* hello.aop.order..*(..))")
    public void allOrder() {

    }
    @Pointcut("execution(* *..*Service.*(..))")
    public void allService() {

    }

    @Pointcut("allOrder() && allService()")
    public void allOrderAndService() {

    }
}
```
외부에 정의된 Pointcut을 사용하는 경우는 패키지명 까지 포함한 pointcut signature로 지정한다.

```java
@Aspect
public class AspectV4 {
    @Around("hello.aop.order.aop.Pointcuts.allOrder()")
    public Object doLog(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        log.info("[Log] {}", proceedingJoinPoint.getSignature());
        return proceedingJoinPoint.proceed();
    }

    @Around("hello.aop.order.aop.Pointcuts.allOrderAndService()")
    public Object doTransaction(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        try {
            log.info("[트랜잭션 시작]", proceedingJoinPoint.getSignature());
            Object result = proceedingJoinPoint.proceed();
            log.info("[트랜잭션 커밋]", proceedingJoinPoint.getSignature());
            return result;
        } catch (Exception e) {
            log.info("[트랜잭션 롤백]", proceedingJoinPoint.getSignature());
            throw e;
        }
        finally {
            log.info("[리소스 릴리즈]", proceedingJoinPoint.getSignature());
        }
    }
}
```

### Aspect 순서 지정

@Aspect 단위로 @Order를 통해 @Aspect에 대한 순서를 지정할 수 있다. 하지만, @Aspect는 클래스 단위로만 지정하는 것이 가능하니 때문에 아래와 같이 클래스 형태로 advice들을 구현하면 된다.

```java
@Slf4j
@Aspect
public class AspectV5 {
    @Aspect
    @Order(2)
    public static class logAspect {
        @Around("hello.aop.order.aop.Pointcuts.allOrder()")
        public Object doLog(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
            log.info("[Log] {}", proceedingJoinPoint.getSignature());
            return proceedingJoinPoint.proceed();
        }
    }

    @Aspect
    @Order(1)
    public static class txAspect {
        @Around("hello.aop.order.aop.Pointcuts.allOrderAndService()")
        public Object doTransaction(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
            try {
                log.info("[트랜잭션 시작]", proceedingJoinPoint.getSignature());
                Object result = proceedingJoinPoint.proceed();
                log.info("[트랜잭션 커밋]", proceedingJoinPoint.getSignature());
                return result;
            } catch (Exception e) {
                log.info("[트랜잭션 롤백]", proceedingJoinPoint.getSignature());
                throw e;
            } finally {
                log.info("[리소스 릴리즈]", proceedingJoinPoint.getSignature());
            }
        }
    }
}
```

아래의 결과를 보면 이전과 달리 트랜잭션 관련 로그가 먼저 출력되는 것을 확인할 수 있다.

> Results

```
[트랜잭션 시작] void hello.aop.order.OrderService.orderItem(String)
[log] void hello.aop.order.OrderService.orderItem(String)
[orderService] 실행
[log] String hello.aop.order.OrderRepository.save(String)
[orderRepository] 실행
[트랜잭션 커밋] void hello.aop.order.OrderService.orderItem(String)
[리소스 릴리즈] void hello.aop.order.OrderService.orderItem(String)
```

### Advice Types

Advice에는 @Around를 제외하고도 @Before, @AfterRunning, @AfterThrowing, @After 등이 있다.

|Advice|Descriptions|
|--|--|
|@Around|메소드 호출 전후에 사용, 가장 강력한 advice로 모든 부분에 대한 활용이 가능하다.|
|@Before|메소드 호출 전에 실행 가능|
|@AfterReturning|메소드 호출이 완료되고 나서 실행 가능|
|@AfterThrowing|메소드가 예외를 반환하는 경우 실행|
|@After|JoinPoint(메소드) 실행의 성공에 상관없이 무조건 실행(finally)|

```java
@Slf4j
@Aspect
public class AspectV6 {
    @Around("hello.aop.order.aop.Pointcuts.allOrderAndService()")
    public Object doTransaction(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        try {
            log.info("[트랜잭션 시작]", proceedingJoinPoint.getSignature());
            Object result = proceedingJoinPoint.proceed();
            log.info("[트랜잭션 커밋]", proceedingJoinPoint.getSignature());
            return result;
        } catch (Exception e) {
            log.info("[트랜잭션 롤백]", proceedingJoinPoint.getSignature());
            throw e;
        } finally {
            log.info("[리소스 릴리즈]", proceedingJoinPoint.getSignature());
        }
    }

    @Before("hello.aop.order.aop.Pointcuts.allOrderAndService()")
    public void doBefore(JoinPoint joinPoint) {
        log.info("[before] {}", joinPoint.getSignature());
    }

    @AfterReturning(value = "hello.aop.order.aop.Pointcuts.allOrderAndService()", returning = "result")
    public void doReturn(JoinPoint joinPoint, Object result) {
        log.info("[return] {} return={}", joinPoint.getSignature(), result);
    }

    @AfterThrowing(value = "hello.aop.order.aop.Pointcuts.allOrderAndService()", throwing = "ex")
    public void doThrowing(JoinPoint joinPoint, Exception ex) {
        log.info("[ex] {} message={}", joinPoint.getSignature(), ex.getMessage());
    }

    @After("hello.aop.order.aop.Pointcuts.allOrderAndService()")
    public void doAfter(JoinPoint joinPoint) {
        log.info("[after] {}", joinPoint.getSignature());
    }
}
```

위의 Aspect 토대로 로그를 확인해보면 아래와 같다. 로그가 출력되어 있는 위치를 토대로 각각의 Advice가 언제 실행되는 지 확인할 수 있다.


```
[around][트랜잭션 시작] void hello.aop.order.OrderService.orderItem(String)
[before] void hello.aop.order.OrderService.orderItem(String)
[orderService] 실행
[orderRepository] 실행
[return] void hello.aop.order.OrderService.orderItem(String) return=null
[after] void hello.aop.order.OrderService.orderItem(String)
[around][트랜잭션 커밋] void hello.aop.order.OrderService.orderItem(String)
[around][리소스 릴리즈] void hello.aop.order.OrderService.orderItem(String)
```


#### Specific Types

> @Before

```java
@Before("hello.aop.order.aop.Pointcuts.allOrderAndService()")
public void doBefore(JoinPoint joinPoint) {
    log.info("[before] {}", joinPoint.getSignature());
}
```
@Around와 달리 실행의 흐름이 변경되지 않는다. -> JoinPoint의 실행이 동반되지 않으므로

@Before를 통해 join point 호출 전에 출력하고자 하는 로그를 지정할 수 있다.

> @AfterReturning

```java
@AfterReturning(value = "hello.aop.order.aop.Pointcuts.allOrderAndService()", returning = "result")
public void doReturn(JoinPoint joinPoint, Object result) {
    log.info("[return] {} return={}", joinPoint.getSignature(), result);
}
```

JoinPoint의 실행이 정상적으로 이루어지면 호출된다. 이때 보면, 해당 메소드에 대해서 반환 타입이 Object로 지정했는데, 이는 모든 반환형 타입에 대한 메소드 실행이 가능하는 것을 의미한다. 만약 Object 대신 String으로 설정하게 되면, String 타입을 반환하는 메소드에 대해서만 advice가 적용되게 된다.

> @AfterThrowing

AfterReturning과 유사하지만, 예외에 대한 처리를 한다는 점에서 다르다.

```java
@AfterThrowing(value = "hello.aop.order.aop.Pointcuts.allOrderAndService()", throwing = "ex")
public void doThrowing(JoinPoint joinPoint, Exception ex) {
    log.info("[ex] {} message={}", joinPoint.getSignature(), ex.getMessage());
}
```

@AfterThrowing도 마찬가지고 예외 타입에 따라 프록시가 적용되는 메소드가 달라지게 된다.

> @After

finally와 같은 느낌으로 메소드가 종료될 때 실행되게 된다.

```java
@After("hello.aop.order.aop.Pointcuts.allOrderAndService()")
    public void doAfter(JoinPoint joinPoint) {
        log.info("[after] {}", joinPoint.getSignature());
    }
```

주로, 리소스 해제할 때 사용한다.


위의 advice에 대해서는 아래와 같은 순서로 실행된다.

![advice_order](/assets/images/jsf/advanced/advice_order.png)

> @Around vs other advices

@Around를 통해 다른 advice가 제공하는 대부분의 기능을 활용하는 것이 가능한데, 왜 다른 advice가 따로 존재할까?

@Around의 경우 Join Point에 대한 proceed를 호출하지 않으면 AOP가 동작을 이어가지 못한다. 즉, 중간에 멈추게 된다. 그렇기 때문에 개발 과정에 있어, proceed를 하지 않는 실수를 하게 되면 어플리케이션이 동작하지 않게 된다.

@Before, @After와 같은 advice의 경우 범위가 @Around에 비해 작고, 단순하기 때문에 실수할 가능성이 낮다. 이 처럼, 제약을 둔 설계를 통해 실수를 미연에 방지 하기 위해 @Around에 의외에 다른 advice를 사용하는 것이다.






## References
link: [inflearn](https://www.inflearn.com/roadmaps/373)

link:[spring_advanced](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8)
