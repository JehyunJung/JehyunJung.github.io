---
title: "Java Spring Advanced part 2"
excerpt: "ThreadLocal Log Tracer"

categories:
  - Web
tags:
  - Java_Spring
  - inflearn
---

# ThreadLocal Log Tracer

이전에 Log Tracer의 경우, method 간 호출 관계를 나타내기 위해 레벨을 이용했는데, 해당 레벨을 관리하기 위해서 TraceId 객체를 전달해줘야했다. 하지만 이렇게 하기 위해서는 모든 메소드에 대한 수정이 필요한데, 이 경우 너무 많은 수정사항이 발생하게 된다. 

우선 기존의 LogTracer을 인터페이스 형태로 관리할 수 있도록 만들자

> LogTrace Interface

```java
import hello.advanced.trace.TraceStatus;
public interface LogTrace {
    TraceStatus begin(String message);
    void end(TraceStatus status);
    void exception(TraceStatus status, Exception e);
}
```

## Field Log Tracer

> FieldLogTrace

```java
@Slf4j
public class FieldLogTracer implements LogTrace {
    private static final String START_PREFIX = "-->";
    private static final String COMPLETE_PREFIX = "<--";
    private static final String EX_PREFIX = "<X-";

    private TraceId traceIdHolder;

    @Override
    public TraceStatus begin(String message) {
        syncTraceId();
        TraceId traceId = traceIdHolder;
        Long startTimeMs = System.currentTimeMillis();
        log.info("[{}] {}{}", traceId.getId(), addSpace(START_PREFIX,
                traceId.getLevel()), message);
        return new TraceStatus(traceId, startTimeMs, message);
    }

    private void syncTraceId() {
        if (traceIdHolder == null) {
            traceIdHolder = new TraceId();
        } else {
            traceIdHolder = traceIdHolder.createNextId();
        }
    }

    @Override
    public void end(TraceStatus status) {
        complete(status, null);
    }

    @Override
    public void exception(TraceStatus status, Exception e) {
        complete(status, e);
    }


    private void complete(TraceStatus status, Exception e) {
        Long stopTimeMs = System.currentTimeMillis();
        long resultTimeMs = stopTimeMs - status.getStartTimeMs();
        TraceId traceId = status.getTraceId();
        if (e == null) {
            log.info("[{}] {}{} time={}ms", traceId.getId(),
                    addSpace(COMPLETE_PREFIX, traceId.getLevel()), status.getMessage(),
                    resultTimeMs);
        } else {
            log.info("[{}] {}{} time={}ms ex={}", traceId.getId(),
                    addSpace(EX_PREFIX, traceId.getLevel()), status.getMessage(), resultTimeMs,
                    e.toString());
        }
        releaseTraceId();
    }

    private void releaseTraceId() {
        if (traceIdHolder.isFirstLevel()) {
            traceIdHolder = null;
        } else {
            traceIdHolder = traceIdHolder.createPreviousId();
        }
    }

    private static String addSpace(String prefix, int level) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < level; i++) {
            sb.append((i == level - 1) ? "|" + prefix : "| ");
        }
        return sb.toString();
    }
}
```

다음과 같이 필드 형태로 TraceId를 관리하게 되면, TraceId를 넘겨주지 않더라도 필드 형태로 관리되기 때문에 레벨을 관리할 수 있게 된다. 

새로운 함수를 호출하게 되면 syncTraceId()를 호출해서 traceId를 생성한다.

```java
private void syncTraceId() {
    if (traceIdHolder == null) {
        traceIdHolder = new TraceId();
    } else {
        traceIdHolder = traceIdHolder.createNextId();
    }
}
```

만약, TraceId가 한번도 초기화 된 적이 없으면 new TraceId()를 통해 새로운 객체를 할당하고, 이전에 초기화된 적이 있는 경우 --> createNextId()를 이용해서 해당 TraceId의 다음 레벨을 할당하게 된다.

반대로, 메소드 호출이 완료되면 releaseTraceId()를 호출해서 level을 감소시킨다.

```java
 private void releaseTraceId() {
    if (traceIdHolder.isFirstLevel()) {
        traceIdHolder = null;
    } else {
        traceIdHolder = traceIdHolder.createPreviousId();
    }
}
```

이 처럼, 필드 형태로 TraceId를 관리하게 되면, 메소드 파라미터로 전달하지 않고도 레벨을 관리할 수 있게 된다.

### Field Log Tracer 적용

```java
@Configuration
    public class LogTraceConfig {
        @Bean
        public LogTrace logTrace() {
            return new FieldLogTrace();
        }
}
```

위와 같이 Spring Bean으로 등록해놓게 되면, 자동으로 DI를 통해 FieldLogTracer 객체를 전달받게 된다.

> Controller

```java
private final OrderServiceV3 orderService;
private final LogTrace tracer;

@GetMapping("/v3/request")

public String request(String itemId) {

    TraceStatus begin = null;
    try {
        begin = tracer.begin("orderController.request()");
        orderService.orderItem(itemId);
        tracer.end(begin);

    } catch (Exception exception) {
        tracer.exception(begin, exception);
        throw exception;
    }
    return "ok";
}
```


> Service

```java
private final OrderRepositoryV3 orderRepository;
private final LogTrace tracer;
public void orderItem(String itemId) {
    TraceStatus begin = null;
    try {
        begin = tracer.begin("OrderService.request()");
        orderRepository.save(itemId);
        tracer.end(begin);

    } catch (Exception exception) {
        tracer.exception(begin, exception);
        throw exception;
    }
}
```


> Respository

```java
private final LogTrace tracer;
public void save(String itemId) {
    TraceStatus begin = null;
    try {
        begin = tracer.begin("OrderRepository.request()");
        if (itemId.equals("ex")) {
            throw new IllegalStateException("예외 발생");
        }
        sleep(1000);
        tracer.end(begin);

    } catch (Exception exception) {
        tracer.exception(begin, exception);
        throw exception;
    }

}

private void sleep(int millis) {
    try {
        Thread.sleep(millis);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
}
```

위와 같이 LogTrace 객체를 private final로 지정해놓게 되면 @RequiredArgsConstructor를 통해 롬복이 저절로 생성자를 생성하게 되고, 스프링에서는 생성자 기반의 DI를 진행하게 된다.

위와 같이 Spring Bean으로 하면 얼핏 잘되는 것처럼 보인다. 하지만 여기에는 아주 큰 문제가 있는 데, 바로 동시성 문제가 발생한다는 점이다.

http 요청을 동시에 2개를 요청했다고 가정했을 때, 아래와 같은 결과가 나타난다.

>Results

```
[nio-8080-exec-3] [aaaaaaaa] OrderController.request()
[nio-8080-exec-3] [aaaaaaaa] |-->OrderService.orderItem()
[nio-8080-exec-3] [aaaaaaaa] | |-->OrderRepository.save()
[nio-8080-exec-4] [aaaaaaaa] | | |-->OrderController.request()
[nio-8080-exec-4] [aaaaaaaa] | | | |-->OrderService.orderItem()
[nio-8080-exec-4] [aaaaaaaa] | | | | |-->OrderRepository.save()
[nio-8080-exec-3] [aaaaaaaa] | |<--OrderRepository.save() time=1005ms
[nio-8080-exec-3] [aaaaaaaa] |<--OrderService.orderItem() time=1005ms
[nio-8080-exec-3] [aaaaaaaa] OrderController.request() time=1005ms
[nio-8080-exec-4] [aaaaaaaa] | | | | |<--OrderRepository.save()
time=1005ms
[nio-8080-exec-4] [aaaaaaaa] | | | |<--OrderService.orderItem()
time=1005ms
[nio-8080-exec-4] [aaaaaaaa] | | |<--OrderController.request() time=1005ms
```

보면, Transaction Id도 구분이 없고, 레벨 표현도 이상하다. 이는 Spring Bean이 singleton 객체로 관리되기 때문에 발생하는 문제이다. LogTracer가 딱 1개만 생성되어 유지되기 때문에, ID는 고정될 수 밖에 없고, 여러 쓰레드가 동시에 접근하게 되면서, 동시성 문제가 발생하게 된다.

### 동시성 문제

> Simple Class storing string data in field

```java
public class FieldService {
    private String nameStore;

    public String logic(String name) {
        log.info("저장 name={} -> nameStore={}", name, nameStore);
        nameStore = name;
        sleep(1000);
        log.info("조회 nameStore={}", nameStore);
        return nameStore;
    }

    private void sleep(int millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
```

> Multithread Test

```java
private FieldService fieldService = new FieldService();
@Test
void logic() {
    log.info("main start");
    Runnable userA = () -> {
        fieldService.logic("userA");
    };
    Runnable userB = () -> {
        fieldService.logic("userB");
    };

    Thread threadA = new Thread(userA);
    threadA.setName("thread-A");

    Thread threadB = new Thread(userB);
    threadB.setName("thread-B");

    threadA.start();
    sleep(2000); //동시성 문제 발생 안함
    threadB.start();
    sleep(2000); //main thread 종료 방지
    log.info("main exit");
}

private void sleep(int mills) {
    try {
        Thread.sleep(mills);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
}
```

> Results

```
[Test worker] main start
[Thread-A] 저장 name=userA -> nameStore=null
[Thread-A] 조회 nameStore=userA
[Thread-B] 저장 name=userB -> nameStore=userA
[Thread-B] 조회 nameStore=userB
[Test worker] main exit
```


위와 같이, thread 간에 충분한 sleep 타임을 주게 되면, thread가 순서대로 동작하게 되면서 원하는 테스트 결과가 나타난다.

아래의 그림과 같이 threadA가 동작하고, threadB가 순서대로 동작하게 된다.
![field_log_multithread1](/assets/images/jsf/advanced/field_log_multithread1.png)

![field_log_multithread2](/assets/images/jsf/advanced/field_log_multithread2.png)

하지만, sleep time을 줄이게 되면 어떠한 문제가 발생하게 될까?

> Results

```
[Test worker] main start
[Thread-A] 저장 name=userA -> nameStore=null
[Thread-B] 저장 name=userB -> nameStore=userA
[Thread-A] 조회 nameStore=userB
[Thread-B] 조회 nameStore=userB
[Test worker] main exit
```

이렇듯, 원치 않은 결과가 발생한다. 이는 아래의 그림과 같이, thread-A가 저장을 완료하고 데이터를 조회를 하기 전에, thread-B가 개입해서 데이터를 저장하는 작업을 수행해버리면서, thread-A가 저장한 정보가 덮어쓰이게 된 것이다.

![field_log_multithread3](/assets/images/jsf/advanced/field_log_multithread3.png)

![field_log_multithread4](/assets/images/jsf/advanced/field_log_multithread4.png)

이는, multithread 환경에서 공유하는 변수에 대한 동시에 접근하게 되면서 발생하는 동시성 문제이다. 특히, 싱글톤에 값을 저장하고 이를 멀티쓰레드 환경에서 사용하게 되면 동시성 문제가 빈번하게 발생한다. 따라서, Spring Bean에는 update가 발생하는 field를 둬서는 안된다.

이런 문제를 해결하기 위해 Spring에서는 ThreadLocal를 제공한다. 

## ThreadLocal

![threadlocal](/assets/images/jsf/advanced/threadlocal_multithread.png)

위의 그림과 같이, Thread는 각각의 로컬 저장소를 가지게 된다. 따라서, 같은 변수에 접근하는 것 처럼 보이지만, 실제로는 thread마다 개별적으로 저장소를 둬서 해당 저장소에서 데이터를 가지고 오므로써 멀티쓰레드간 동시성 문제를 해결한다.

> Test

```java
public class ThreadLocalService {
    private ThreadLocal<String> nameStore = new ThreadLocal<>();

    public String logic(String name) {
        log.info("저장 name={} -> nameStore={}", name, nameStore.get());
        nameStore.set(name);
        sleep(1000);
        log.info("조회 nameStore={}", nameStore.get());
        return nameStore.get();
    }

    private void sleep(int millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}

private ThreadLocalService threadLocalService = new ThreadLocalService();
    @Test
    void logic() {
        log.info("main start");
        Runnable userA = () -> {
            threadLocalService.logic("userA");
        };
        Runnable userB = () -> {
            threadLocalService.logic("userB");
        };

        Thread threadA = new Thread(userA);
        threadA.setName("thread-A");

        Thread threadB = new Thread(userB);
        threadB.setName("thread-B");

        threadA.start();
        //sleep(2000); //동시성 문제 발생 안함
        sleep(100); //동시성 문제 발생
        threadB.start();
        sleep(2000); //main thread 종료 방지
        log.info("main exit");
    }

    private void sleep(int mills) {
        try {
            Thread.sleep(mills);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
```

>Results

```
[Test worker] main start
[Thread-A] 저장 name=userA -> nameStore=null
[Thread-B] 저장 name=userB -> nameStore=null
[Thread-A] 조회 nameStore=userA
[Thread-B] 조회 nameStore=userB
[Test worker] main exit
```
보면 정상적으로 동작할 수 있는 것을 확인할 수 있다. 추가적으로 Field 타입과 달리 nameStore이 모두 초기에는 null값임을 보아 각 thread별로 서로 다른 객체를 참고하고 있음을 확인할 수 있다.

### ThreadLocal 적용

```java
ThreadLocal<T> threadLocal=new ThreadLocal<>();
```
threadlocal 저장소에 저장하고자 하면 set() 메소드를 이용하면 되고, 값을 반환받고자 하면 get() 메소드를 이용하면 된다.

> ThreadLocalLogTracer

```java
public class ThreadLocalLogTracer implements LogTrace {
    ...
    private ThreadLocal<TraceId> traceIdHolder = new ThreadLocal<>();

    @Override
    public TraceStatus begin(String message) {
        syncTraceId();
        TraceId traceId = traceIdHolder.get();
        Long startTimeMs = System.currentTimeMillis();
        log.info("[{}] {}{}", traceId.getId(), addSpace(START_PREFIX,
                traceId.getLevel()), message);
        return new TraceStatus(traceId,startTimeMs,message);
    }

    private void syncTraceId() {
        TraceId traceId = traceIdHolder.get();
        if (traceId == null) {
            traceIdHolder.set(new TraceId());
        }else{
            traceIdHolder.set(traceId.createNextId());
        }
    }
...


    private void releaseTraceId() {
        TraceId traceId = traceIdHolder.get();
        if (traceId.isFirstLevel()) {
            traceIdHolder.remove();
        }else{
            traceIdHolder.set(traceId.createPreviousId());
        }
    }
...
}
```

ThreadLocal을 초기화하는 부분과, 저장/반환하는 부분만 수정하면 된다.

그리고, WebConfig 부분에서 의존성 관계만 수정해주면, Controller, Service, Repostiory class에서는 수정할 부분이 없다.

>WebConfig

```java
@Configuration
public class LogTraceConfig {
    @Bean
    public LogTrace logTrace() {
//        return new FieldLogTracer();
        return new ThreadLocalLogTracer();
    }
}
```

이와 같이, Interface 형태로 지정하고, Config 파일 통해 구현체만 등록해주면 된다. 이처럼 구현 클래슬 바꾸는 것이 매우 간단하다.

> Results

```
[nio-8080-exec-3] [52808e46] OrderController.request()
[nio-8080-exec-3] [52808e46] |-->OrderService.orderItem()
[nio-8080-exec-3] [52808e46] | |-->OrderRepository.save()
[nio-8080-exec-4] [4568423c] OrderController.request()
[nio-8080-exec-4] [4568423c] |-->OrderService.orderItem()
[nio-8080-exec-4] [4568423c] | |-->OrderRepository.save()
[nio-8080-exec-3] [52808e46] | |<--OrderRepository.save() time=1001ms
[nio-8080-exec-3] [52808e46] |<--OrderService.orderItem() time=1001ms
[nio-8080-exec-3] [52808e46] OrderController.request() time=1003ms
[nio-8080-exec-4] [4568423c] | |<--OrderRepository.save() time=1000ms
[nio-8080-exec-4] [4568423c] |<--OrderService.orderItem() time=1001ms
[nio-8080-exec-4] [4568423c] OrderController.request() time=1001ms
```

애플리케이션 로그를 확인해보면, Transaction Id가 구분되어 있고, 메소드 레벨이 제대로 표현되어 있는 것을 확인할 수 있다.

## ThreadLocal 주의 사항

ThreadLocal를 사용할 때는 반드시, 요청/응답이 완료되면 해당 쓰레드에서 사용한 저장소를 반환해줘야한다. 안 그러면, 해당 저장소 안에 데이터가 살아있게 되고, 나중에 새로운 thread가 threadlocal를 할당받을 시 이전에 지우지 않는 데이터가 반환되는 문제가 발생할 수 있다.

![threadlocal_remove1](/assets/images/jsf/advanced/threadlocal_remove1.png)

thread-A가 요청을 처리하기 위해 thread-local 저장소를 할당받아서 해당 저장소에 데이터를 저장하게 된다.

![threadlocal_remove2](/assets/images/jsf/advanced/threadlocal_remove2.png)
thread-A가 요청을 모두 처리하고 나면 원래는 thread-local 저장소를 반환해야되지만, 반환하지 않고 쓰레드를 종료한다. 이러면, thread-A에 대한 thread-local 저장소에 thread-A가 처리한 데이터가 남아 있게 된다.

![threadlocal_remove2](/assets/images/jsf/advanced/threadlocal_remove3.png)

새로운 Http 요청이 들어와서, 다시 thread-A가 작업에 할당되면 thread-A는 이전에 저장된 정보에 접근하게 된다. 결론적으로 Http 요청처리에 문제가 발생하게 된다.

따라서, 반드시, ThreadLocal를 사용하게 되면 다 쓴 Thread-Local storage를 remove() 메소드를 통해서 반환해야한다.

## Request Scope

위와 같이 ThreadLocal를 이용해서 Thread 간에 동시성 문제를 해결해도 되지만, Http Request에 대해 Bean Cycle를 유지하는 Request Scope Bean를 이용하면 동일한 결과를 보이게 된다.


```java
@Slf4j
@Component
@Scope(value = "request",proxyMode = ScopedProxyMode.TARGET_CLASS)
public class FieldLogTracer implements LogTrace {
 ...
}
```

## References
link: [inflearn](https://www.inflearn.com/roadmaps/373)

link:[spring_advanced](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8)
