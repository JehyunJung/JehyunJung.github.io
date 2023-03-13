---
title: "Java Spring Advanced part 1"
excerpt: "Log Tracer"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Advanced
  - inflearn
---

# Log Tracer

로그 추적기 구현을 위한 간단한 Controller/Service/Repository를 만들어보자

> Controller

```java
@RestController
@RequiredArgsConstructor
public class OrderControllerV0 {
    private final OrderServiceV0 orderService;

    @GetMapping("/v0/request")
    public String request(String itemId) {
        orderService.orderItem(itemId);
        return "ok";
    }
}
```

> Service

```java
@Service
@RequiredArgsConstructor
public class OrderServiceV0 {
    private final OrderRepositoryV0 orderRepository;
    public void orderItem(String itemId) {
        orderRepository.save(itemId);
    }
}
```

> Repository 

```java
@Repository
@RequiredArgsConstructor
public class OrderRepositoryV0 {

    public void save(String itemId) {
        //저장 로직
        if (itemId.equals("ex")) {
            throw new IllegalStateException("예외 발생!");
        }
            sleep(1000);
        }

    private void sleep(int millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

예외 상황도 테스트 하기 위해 위와 같이 특정 id값을 입력하게 되면 예외를 발생시키도록 한다.

어플리케이션 개발에 있어 로그를 남기는 것은 아주 중요하다. 어떠한 부분에 병목이 발생하는지, 또는 어떠한 부분에 예외가 발생하는 지 빠르게 파악하는 것이 가능하고 , 등 로그를 통해 여러 정보를 얻을 수 있다. 

아래와 같은 요구 조건을 만족하는 로그 추적기를 만든다고 가정하자.

1. 모든 public method에 대해 호출/응답 로그 생성
2. 애플리케이션의 흐름에 관여해서는 안된다. 즉, 정상이면 -> 정상, 에러면 에러, 애플리케이션이 흘러 가는 흐름을 방해해서는 안된다.
3. 정상/예외 흐름을 구분할 수 있어야한다.
4. 메서드 호출의 깊이 표현, 메서드 호출 단계를 표현할 수 있어야한다.
5. Http 요청을 구분한다. 즉, 같은 http 요청에 대해서는  transaction id가 동일해야한다.

아래와 같은 로그를 생성하도록 하는 것이 최종 목표이다.
```
정상 요청
[796bccd9] OrderController.request()
[796bccd9] |-->OrderService.orderItem()
[796bccd9] | |-->OrderRepository.save()
[796bccd9] | |<--OrderRepository.save() time=1004ms
[796bccd9] |<--OrderService.orderItem() time=1014ms
[796bccd9] OrderController.request() time=1016ms
```
```
예외 발생
[b7119f27] OrderController.request()
[b7119f27] |-->OrderService.orderItem()
[b7119f27] | |-->OrderRepository.save()
[b7119f27] | |<X-OrderRepository.save() time=0ms
ex=java.lang.IllegalStateException: 예외 발생!
[b7119f27] |<X-OrderService.orderItem() time=10ms
ex=java.lang.IllegalStateException: 예외 발생!
[b7119f27] OrderController.request() time=11ms
```

## Log Classes

### TraceID

```java
public class TraceId {
    private String id;
    private int level;

    public TraceId() {
        this.id = createId();
        this.level = 0;
    }

    private TraceId(String id, int level) {
        this.id = id;
        this.level = level;
    }

    private String createId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    public TraceId createNextId() {
        return new TraceId(id, level + 1);
    }
    public TraceId createPreviousId() {
        return new TraceId(id, level - 1);
    }

    public Boolean isFirstLevel() {
        return level == 0;
    }

    public String getId() {
        return id;
    }

    public int getLevel() {
        return level;
    }
}
```

http 요청 단위로 transaction id를 관리하고, 메소드 호출 스택을 관리하기 위해서는 위와 같이 id,level을 저장하는 class가 필요하다. 해당 클래스를 통해서 메소드 간에 id, level을 관리하는 것이 가능하다. 

또한, createNextId(), createPreviousId() 메소드를 구현해서, 이전, 이후 관계에 속하는 메소드에 대한 level를 표현할 수 있도록 한다.

즉, 아래와 같이 TraceId를 활용할 수 있다.

```
[796bccd9] OrderController.request() //트랜잭션ID:796bccd9, level:0
[796bccd9] |-->OrderService.orderItem() //트랜잭션ID:796bccd9, level:1
[796bccd9] | |-->OrderRepository.save()//트랜잭션ID:796bccd9, level:2
```

### TraceStatus

```java
@Getter
public class TraceStatus {
    private TraceId traceId;
    private Long startTimeMs;
    private String message;

    public TraceStatus(TraceId traceId, Long startTimeMs, String message) {
        this.traceId = traceId;
        this.startTimeMs = startTimeMs;
        this.message = message;
    }
}
```
TraceStatus 클래스를 둬서, 메소드를 호출하는 시간 및 로그 메세지를 설정하도록 한다. 

이후, startTimeMs를 이용해서 메소드 실행 시간을 구할 수 있다.

### HelloTraceV1

```java
@Slf4j
@Component
public class HelloTraceV1 {
    private static final String START_PREFIX = "-->";
    private static final String COMPLETE_PREFIX = "<--";
    private static final String EX_PREFIX = "<X-";

    public TraceStatus begin(String message) {
        TraceId traceId = new TraceId();
        Long startTimeMs = System.currentTimeMillis();
        log.info("[{}] {}{}", traceId.getId(), addSpace(START_PREFIX,
                traceId.getLevel()), message);
        return new TraceStatus(traceId,startTimeMs,message);
    }
    public void end(TraceStatus status) {
        complete(status, null);
    }
    public void exception(TraceStatus status,Exception e) {
        complete(status,e);
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
    }
    private static String addSpace(String prefix, int level) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < level; i++) {
            sb.append( (i == level - 1) ? "|" + prefix : "| ");
        }
        return sb.toString();
    }
    
}
```

#### public methods

아래의 메소드를 이용해서, 로그 시작, 끝을 지정한다.

> Begin 

```java
public TraceStatus begin(String message) {
    TraceId traceId = new TraceId();
    Long startTimeMs = System.currentTimeMillis();
    log.info("[{}] {}{}", traceId.getId(), addSpace(START_PREFIX,
            traceId.getLevel()), message);
    return new TraceStatus(traceId,startTimeMs,message);
}
```
로그를 시작, 즉, 메소드를 호출하는 부분에 begin 메소드를 실행해서, 시작로그를 생성한다. 

>end

```java
public void end(TraceStatus status) {
    complete(status, null);
}
```

메소드가 정상적으로 실행되는 경우 end 메소드를 실행한다.

> exception

```java
public void exception(TraceStatus status,Exception e) {
    complete(status,e);
}
```

만약, 에러가 발생하게 되면 예외 상황을 전달한다.

#### private methods

> complete

```java
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
}
```

정상, 예외 상황의 구분 없이 실행시간을 측정해야하므로, status(시작 상태)를 바탕으로 메소드 실행 시간을 구하고, 로그 메세지를 출력한다.

> addSpace

```java
private static String addSpace(String prefix, int level) {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < level; i++) {
        sb.append( (i == level - 1) ? "|" + prefix : "| ");
    }
    return sb.toString();
}
```

trace 레벨에 따라서, 메소드 호출 스택을 표현해줄 수 있도록 한다. 이때, prefix의 경우 메소드 호출, 정상 응답, 예외 응답 모두 다르므로, parameter로 받아서 처리한다.

```
1. 메소드 호출
prefix: -->
level 0:
level 1: |-->
level 2: | |-->

2. 정상 응담
prefix: <--
level 0:
level 1: |<--
level 2: | |<--

3. 예외 발생
prefix: <X
level 0:
level 1: |<X
level 2: | |<X-
```

#### Test

```java
class HelloTraceV1Test {
    @Test
    void begin_end() {
        HelloTraceV1 trace = new HelloTraceV1();
        TraceStatus status = trace.begin("hello");
        trace.end(status);
    }
    @Test
    void begin_exception() {
        HelloTraceV1 trace = new HelloTraceV1();
        TraceStatus status = trace.begin("hello");
        trace.exception(status, new IllegalStateException());
    }
}
```

> Results
```
1. begin_end
[41bbb3b7] hello
[41bbb3b7] hello time=5ms

2. begin_exception
[898a3def] hello
[898a3def] hello time=13ms ex=java.lang.IllegalStateException
```

위와 같이, 메소드 호출, 응답, 실행시간이 출력되는 것을 확인할 수 있다.

## Log Tracer 적용

> Controller

```java
@GetMapping("/v1/request")
public String request(String itemId) {
    TraceStatus begin = null;
    try {
        begin = helloTrace.begin("orderController.request()");
        orderService.orderItem(itemId);
        helloTrace.end(begin);

    } catch (Exception exception) {
        helloTrace.exception(begin, exception);
        throw exception;
    }
    return "ok";
}
```

tracestatus begin, end를 이용해서 정상 호출/응답을 표현할 수 있고,
예외가 발생하게 되면, exception 메소드를 실행해서 예외 상황에서도 동작할 수 있도록 한다.

여기서 중요한 부분이, throw exception이다, 로그를 출력한다고 해서 예외를 처리해서는 안된다. 애플리케이션 흐름에 맞춰서 예외를 던지도록 해야한다.


Service, Repository에 대해서도 동일하게 적용하면 된다.

> Results

```
[11111111] OrderController.request()
[22222222] OrderService.orderItem()
[33333333] OrderRepository.save()
[33333333] OrderRepository.save() time=1000ms
[22222222] OrderService.orderItem() time=1001ms
[11111111] OrderController.request() time=1001ms
```

위와 같이, Controller, Service, Repository 동작 시 위와 같은 로그를 출력하게 된다. 메소드 호출,응답 호출 시간에 대해서는 정확하게 로그로 남는 것을 확인할 수 있다. 하지만, transaction id 동기화 및 메소드 호출 레벨을 표현하지는 않았다.

id 동기화 및 메소드 호출 스택 관계를 통한 레벨을 분리하기 위해서는 TraceId 클래스를 다음 메소드(호출되는 메소드)로 넘겨줘야한다.

## HelloTraceV2

기존의 HelloTraceV1 클래스에 아래의 메소드를 추가한다.

```java
public TraceStatus begin_sync(TraceId beforeTraceId,String message) {
    TraceId traceId = beforeTraceId.createNextId();
    Long startTimeMs = System.currentTimeMillis();
    log.info("[{}] {}{}", traceId.getId(), addSpace(START_PREFIX,
            traceId.getLevel()), message);
    return new TraceStatus(traceId,startTimeMs,message);
}
```
이전의 상태 즉 메소드를 호출하는 쪽의 TraceId를 넘겨줘서, Id 동기화 및 레벨 표현을 할 수 있도록 한다.

이때, TraceId의 createNextId 메소드를 이용해서, transaction id는 유지하면서, 다음 레벨을 표현할 수 있게 된다.

> Test

```java
@Test
void begin_end_level2() {
    HelloTraceV2 trace = new HelloTraceV2();
    TraceStatus status1 = trace.begin("hello1");
    TraceStatus status2 = trace.beginSync(status1.getTraceId(), "hello2");
    trace.end(status2);
    trace.end(status1);
}

@Test
void begin_exception_level2() {
    HelloTraceV2 trace = new HelloTraceV2();
    TraceStatus status1 = trace.begin("hello");
    TraceStatus status2 = trace.beginSync(status1.getTraceId(), "hello2");
    trace.exception(status2, new IllegalStateException());
    trace.exception(status1, new IllegalStateException());
}
```

> Results

```
1. begin_end_level2(정상 응답)
[0314baf6] hello1
[0314baf6] |-->hello2
[0314baf6] |<--hello2 time=2ms
[0314baf6] hello1 time=25ms

2. begin_exception_level2(예외 응답)
[37ccb357] hello
[37ccb357] |-->hello2
[37ccb357] |<X-hello2 time=2ms ex=java.lang.IllegalStateException
[37ccb357] hello time=25ms ex=java.lang.IllegalStateException
```

transcation id가 유지되고, 레벨에 따른 메소드 호출 관계가 표현되는 것을 확인할 수 있다.

## HelloTraceV2 적용

Controller, Service, Repository에 대해서 위의 추가 사항에 대해 적용하기 위해서는 메소드 수정이 필요하다. Transaction Id 동기화, 레벨을 구분하기 위해 TraceId 값을 넘겨줘야하는데, 가장 간단한 방법이 메소드 인자를 통해 전달하는 것이다.

> Controller

```java
private final OrderServiceV2 orderService;
private final HelloTraceV2 trace;

@GetMapping("/v2/request")
public String request(String itemId) {

    TraceStatus begin = null;
    try {
        begin = helloTrace.begin("orderController.request()");
        orderService.orderItem(begin.getTraceId(),itemId);
        helloTrace.end(begin);

    } catch (Exception exception) {
        helloTrace.exception(begin, exception);
        throw exception;
    }
    return "ok";
}
```

Service 메소드를 호출할 때, Controller의 TraceStatus을 전달한다.

> Service

```java
private final OrderRepositoryV2 orderRepository;
private final HelloTraceV2 helloTrace;

public void orderItem(TraceId previoudId,String itemId) {
    TraceStatus begin = null;
    try {
        begin = helloTrace.begin_sync(previoudId,"OrderService.request()");
        orderRepository.save(begin.getTraceId(),itemId);
        helloTrace.end(begin);

    } catch (Exception exception) {
        helloTrace.exception(begin, exception);
        throw exception;
    }
}
```

Service 메소드에서는 Controller에서 전달한 TraceId를 이용해서, 다음 TraceId를 만든 다음 이를 활용한다.
begin_sync 메소드를 활용하는 것을 확인할 수 있다.

Respository는 Service와 유사하다.

> Results

```
1. 정상 흐름
[c80f5dbb] OrderController.request()
[c80f5dbb] |-->OrderService.orderItem()
[c80f5dbb] | |-->OrderRepository.save()
[c80f5dbb] | |<--OrderRepository.save() time=1005ms
[c80f5dbb] |<--OrderService.orderItem() time=1014ms
[c80f5dbb] OrderController.request() time=1017ms

2. 예외 흐름
[ca867d59] OrderController.request()
[ca867d59] |-->OrderService.orderItem()
[ca867d59] | |-->OrderRepository.save()
[ca867d59] | |<X-OrderRepository.save() time=0ms
ex=java.lang.IllegalStateException: 예외 발생!
[ca867d59] |<X-OrderService.orderItem() time=7ms
ex=java.lang.IllegalStateException: 예외 발생!
[ca867d59] OrderController.request() time=7ms
ex=java.lang.IllegalStateException: 예외 발생!
```


## References
link: [inflearn](https://www.inflearn.com/roadmaps/373)

link:[spring_advanced](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8)
