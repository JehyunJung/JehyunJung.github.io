---
title: "Java Spring Advanced part 4"
excerpt: "Proxy and Decorator Pattern"

categories:
  - Web
tags:
  - Java_Spring
  - inflearn
---

# Proxy and Decorator Pattern

## Simple Controller, Service, Repository
프록시 패턴과 데코레이터 패턴을 적용을 위해 예제 프로젝트를 구성해보자.
1. 인터페이스 + 구현클래스 방식
2. 구현클래스 방식
3. 컴포넌트 스캔 방식의 빈 자동 등록(@Controller, @Service, @Repository)

### Interface + Concrete Class

> Controller

```java
@RequestMapping
@ResponseBody
public interface OrderControllerV1 {
    @GetMapping("/v1/request")
    String request(@RequestParam("itemId") String itemId);

    @GetMapping("/v1/no-log")
    String noLog();
}


public class OrderControllerV1Impl implements OrderControllerV1{
    private final OrderServiceV1 orderService;

    public OrderControllerV1Impl(OrderServiceV1 orderService) {
        this.orderService = orderService;
    }

    @Override
    public String request(String itemId) {
        orderService.orderItem(itemId);
        return "ok";
    }

    @Override
    public String noLog() {
        return "ok";
    }
}
```

@RequestMapping 혹은 @Controller annotation이 있어야 controller로 인식된다. 여기서는 @RequestMapping을 활용하는데, 이는 나중에 Controller을 수동으로 빈으로 등록하기 위함이다. @Controller에는 @Component가 있어서 자동으로 Spring Bean으로 등록된다.

보면, interface에 @ResponseBody, @RequestParam 같은 annotation을 표기한 것을 확인할 수 있다. 이는, 구현 클래스에 했을때, 인식이 안되는 문제가 종종 있어서 그렇다. 그래서 interface에 annotation을 표기하도록 한다. 그렇게 하면 구현클래스에는 annotation을 포함하지 않아도 된다.

> Service

```java
public interface OrderServiceV1 {
    void orderItem(String itemId);
}

public class OrderServiceV1Impl implements OrderServiceV1{
    private final OrderRepositoryV1 orderRepository;

    public OrderServiceV1Impl(OrderRepositoryV1 orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void orderItem(String itemId) {
        orderRepository.save(itemId);
    }
}

```

> Repository

```java
public interface OrderRepositoryV1 {
    void save(String itemId);
}

public class OrderRepositoryV1Impl implements OrderRepositoryV1{
    @Override
    public void save(String itemId) {
        if(itemId.equals("ex"))
            throw new IllegalStateException(("예외 발생"));
        else
            sleep(1000);

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

다음과 같이 Interface + 구현클래스를 생성하는 방향으로 Controller, Service, Repository를 구현한다.

> AppV1Config

```java
@Configuration
public class AppV1Config {
    @Bean
    public OrderControllerV1 orderControllerV1(){
        return new OrderControllerV1Impl(orderServiceV1());
    }

    @Bean
    public OrderServiceV1 orderServiceV1(){
        return new OrderServiceV1Impl(orderRepositoryV1());
    }

    @Bean
    public OrderRepositoryV1 orderRepositoryV1(){
        return new OrderRepositoryV1Impl();
    }
}
```

해당 Config를 Spring에서 구동하기 위해 아래와 같이 @Import annotation을 추가한다.

```java
@Import(AppV1Config.class)
@SpringBootApplication(scanBasePackages = "hello.proxy.app") //주의
public class ProxyApplication {
    ...
}
```

경우에 따라서, 다른 Config를 적용하기 위해서 위와 같이 수동을 빈을 등록하는 방법으로 구성하였다.

### Concrete Class

> Controller

```java
@Slf4j
@RequestMapping
@ResponseBody
public class OrderControllerV2 {
    private final OrderServiceV2 orderService;

    public OrderControllerV2(OrderServiceV2 orderService) {

        this.orderService = orderService;
    }

    @GetMapping("/v2/request")
    public String request(@RequestParam String itemId) {
        orderService.orderItem(itemId);
        return "ok";
    }
    @GetMapping("/v2/no-log")
    public String noLog() {
        return "ok";
    }
}

```

> Service

```java
public class OrderServiceV2{
    private final OrderRepositoryV2 orderRepository;

    public OrderServiceV2(OrderRepositoryV2 orderRepository) {

        this.orderRepository = orderRepository;
    }
    public void orderItem(String itemId) {
        orderRepository.save(itemId);
    }
}
```

> Repository

```java
public class OrderRepositoryV2{
    public void save(String itemId) {
        if(itemId.equals("ex"))
            throw new IllegalStateException(("예외 발생"));
        else
            sleep(1000);

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

> AppV2Config

```java
@Configuration
public class AppV2Config {
    @Bean
    public OrderControllerV2 orderControllerV2(){
        return new OrderControllerV2(orderServiceV2());
    }

    @Bean
    public OrderServiceV2 orderServiceV2(){
        return new OrderServiceV2(orderRepositoryV2());
    }

    @Bean
    public OrderRepositoryV2 orderRepositoryV2(){
        return new OrderRepositoryV2();
    }
}
```

### Component Scan

> Controller

```java
@Slf4j
@RestController
public class OrderControllerV3 {
    private final OrderServiceV3 orderService;

    public OrderControllerV3(OrderServiceV3 orderService) {

        this.orderService = orderService;
    }

    @GetMapping("/v3/request")
    public String request(@RequestParam String itemId) {
        orderService.orderItem(itemId);
        return "ok";
    }
    @GetMapping("/v3/no-log")
    public String noLog() {
        return "ok";
    }
}
```

> Service

```java
@Repository
public class OrderRepositoryV3{
    public void save(String itemId) {
        if(itemId.equals("ex"))
            throw new IllegalStateException(("예외 발생"));
        else
            sleep(1000);

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

> Respository

```java
@Service
public class OrderServiceV3{
    private final OrderRepositoryV3 orderRepository;

    public OrderServiceV3(OrderRepositoryV3 orderRepository) {

        this.orderRepository = orderRepository;
    }
    public void orderItem(String itemId) {
        orderRepository.save(itemId);
    }
}
```

## Proxy Design Patterns

기존의 LogTrace를 이용해서 아래와 같은 로그를 찍는 기능을 구현하였다.

```
정상 요청
[796bccd9] OrderController.request()
[796bccd9] |-->OrderService.orderItem()
[796bccd9] | |-->OrderRepository.save()
[796bccd9] | |<--OrderRepository.save() time=1004ms
[796bccd9] |<--OrderService.orderItem() time=1014ms
[796bccd9] OrderController.request() time=1016ms

예외 발생
[b7119f27] OrderController.request()
[b7119f27] |-->OrderService.orderItem()
[b7119f27] | |-->OrderRepository.save()
[b7119f27] | |<X-OrderRepository.save() time=0ms
ex=java.lang.IllegalStateException: 예외 발생!
[b7119f27] |<X-OrderService.orderItem() time=10ms
ex=java.lang.IllegalStateException: 예외 발생!
[b7119f27] OrderController.request() time=11ms
ex=java.lang.IllegalStateException: 예외 발생!
```

하지만 아래와 같이, 원본 코드에 수정이 필요했다.

```java
@GetMapping("/v5/request")

public String request(String itemId) {
    return template.execute("OrderController.request()",() -> {
        orderService.orderItem(itemId);
        return "ok";
    });
}
```
하지만, 프록시를 이용하게 되면 위와 같이 원본 코드의 수정없이도 로그 출력 기능을 활용할 수 있다.

![proxy_pattern](/assets/images/jsf/advanced/proxy_pattern.png)

위의 그림을 보면, 프록시는 client와 server사이에 존재하게 되며, 중간에서 client과 server 사이 간의 요청/응답 과정에 관여하게 된다.


또한 프록시는 아래와 같이 여러 프록시로 체이닝이 가능하다.

![proxy_chain](/assets/images/jsf/advanced/proxy_chain.png)

GOF 디자인 패턴에서는 proxy가 수행하는 기능에 따라 디자인 패턴을 구분한다.

proxy가 하는 기능에는 크게 2가지가 있다.

1. 접근 제어
    - 캐싱
    - 접근 권한에 따른 요청 통제
    - 지연 로딩(Jpa의 지연로딩, Request Scope Bean)
2. 부가 기능
    - 로그 출력
    - 실행 시간 ...

프록시를 사용하는 패턴은 크게 프록시 패턴, 데코레이터 패턴이 있는데, 프록시 패턴은 접근 제어를 목적으로한 패턴이며, 데코레이터 패턴은 부가 기능을 위한 패턴이다.

프록시 패턴과 데코레이터 패턴은 구조적으로 아주 유사한 패턴인데, 둘을 구분하는 것은 서로 어떤 의도를 통해 사용하는 지이다.

### Proxy Pattern
우선 접근 제어를 목적으로 프록시 패턴을 알아보자

![proxy_pattern1](/assets/images/jsf/advanced/proxy_pattern1.png)
위와 같이, Client는 요청하는 역할이고, Subject는 요청에 대한 응답을 처리하는 역할을 수행한다.

> Subject

```java
public interface Subject {
    String operation();
}

//RealSubject
@Slf4j
public class RealSubject implements Subject{
    @Override
    public String operation() {
        log.info("실제 객체 호출");
        sleep(1000);
        return "data";
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

작업 처리 시간이 1초인 작업이 있다고 가정하자.


> Client

```java
public class ProxyPatternClient {
    private Subject subject;

    public ProxyPatternClient(Subject subject) {
        this.subject = subject;
    }

    public void execute(){
        subject.operation();
    }
}
```

> Direct Request

```java
@Test
void noProxyTest(){
    RealSubject realSubject = new RealSubject();
    ProxyPatternClient client = new ProxyPatternClient(realSubject);
    client.execute();
    client.execute();
    client.execute();
}
```
위와 같이 직접 RealSubject을 통해 작업을 요청하는 경우에는 3초의 시간이 소요된다. 모든 작업에 대해 요청이 직접 처리되므로, 요청이 많아지게 되면, 시간이 많이 소요되게 된다.

하지만, 위와 같이 같은 작업에 대해서는 결과를 캐싱하므로써 작업 성능 향상을 꾀할 수 있다. 하지만, 원본 코드의 수정 없이 어떻게 이를 수행할까?
아래의 프록시 구조를 통해 가능하게 할 수 있다.
![proxy_pattern2](/assets/images/jsf/advanced/proxy_pattern2.png)

여기서 핵심은 Subject가 인터페이스라는 점이다. 따라서, Client는 Subject에 요청을 보내게 되므로, Subject를 구현하는 Proxy가 중간에 와서 매개체 역할을 수행한다 하더라도 Client의 코드에는 수정이 필요없다.

> Proxy

```java
@Slf4j
public class CacheProxy implements Subject{
    private Subject target;
    private String cacheValue;

    public CacheProxy(Subject target) {
        this.target = target;
    }

    @Override
    public String operation() {
        log.info("프록시 호출");
        if (cacheValue == null) {
            cacheValue = target.operation();
        }
        return cacheValue;
    }
}
```
Subject을 구현하는 Proxy class를 생성하게 되는데, 이때 Proxy class는 Subject를 멤버변수로 가지고 있다, 이는 실제 작업인 RealSubject을 호출하기 위함이다.

또한, cacheValue를 가지고 있어, 이미 cacheValue가 있는 경우 실제 작업을 처리하지 않아도 된다.

> Proxy Request

```java
@Test
void cacheProxyTest(){
    RealSubject realSubject = new RealSubject();
    CacheProxy cacheProxy = new CacheProxy(realSubject);
    ProxyPatternClient client = new ProxyPatternClient(cacheProxy);
    client.execute();
    client.execute();
    client.execute();
}
```

위와 같이 Client -> CacheProxy -> RealSubject 와 같이 연결을 구성한다.
위의 테스트를 수행해보면 한번의 작업 이후 캐시에 값을 저장하므로써, 추가적인 작업 호출을 하지 않게 된다.

### Decorator Pattern
이제는 부가기능을 제공하는 데코레이터 패턴에 대해 알아보자

![decorator_pattern1](/assets/images/jsf/advanced/decorator_pattern1.png)

위를 보면 알수 있듯이, 프록시 패턴과 구조는 매우 유사하다.

> Component

```java
public interface Component {
    String operation();
}

@Slf4j
public class RealComponent implements Component{
    @Override
    public String operation() {
        log.info("Real Component 실행");
        return "data";
    }
}
```

> Client

```java
@Slf4j
public class DecoraterPatternClient {
    private Component component;

    public DecoraterPatternClient(Component component) {
        this.component = component;
    }

    public void execute(){
        String result = component.operation();
        log.info("result:{}", result);
    }
}
```

> Direct Request

```java
@Test
void noDecorator(){
    Component realComponent = new RealComponent();
    DecoraterPatternClient decoraterPatternClient = new DecoraterPatternClient(realComponent);
    decoraterPatternClient.execute();
}
```

여기에 아래와 같이 응답을 꾸며주는 messageDecorator를 추가해보자.

![messageDecorator](/assets/images/jsf/advanced/messageDecorator.png)

> MessageDecorator

```java
@Slf4j
public class MessageDecorator implements Component{

    private Component component;

    public MessageDecorator(Component realComponent) {
        this.component = realComponent;
    }

    @Override
    public String operation() {
        log.info("MessageDecorator 실행");
        String operation= component.operation();
        String decoResult = "****" + operation + "****";

        log.info("before:{}, after: {}", operation, decoResult);
        return decoResult;
    }
}
```
MessageDecorator에서는 위와 같이 응답을 꾸며서 새로운 응답을 출력하는 것을 확인할 수 있다.

> MessageDecorator Test

```java
@Test
void decorator1() {
    Component realComponent = new RealComponent();
    Component messageDecorator = new MessageDecorator(realComponent);
    DecoraterPatternClient client = new DecoraterPatternClient(messageDecorator);

    client.execute();
}
```

이번에는 실행시간을 측정하는 Decorator을 추가해보자

![timeDecorator](/assets/images/jsf/advanced/timeDecorator.png)

> TimeDecorator

```java
@Slf4j
public class TimeDecorator implements Component{

    private Component component;

    public TimeDecorator(Component component) {
        this.component = component;
    }

    @Override
    public String operation() {
        log.info("TimeDecorator 실행");
        Long start = System.currentTimeMillis();

        String result= component.operation();

        Long end = System.currentTimeMillis();
        Long executionTime = end - start;
        log.info("Time Decorator 종료, resultTime:{}ms", executionTime);
        return result;
    }
}
```

> TimeDecorator Test

```java
@Test
void decorator2() {
    Component realComponent = new RealComponent();
    Component messageDecorator = new MessageDecorator(realComponent);
    Component timeDecorator = new TimeDecorator(messageDecorator);
    DecoraterPatternClient client = new DecoraterPatternClient(timeDecorator);

    client.execute();
}
```

## Apply Proxy to Project

이전에 각기 다른 방식으로 구성한 예제에 프록시를 추가해보자

### Interface + Concrete Class

인터페이스 방식으로 구성하는 예제는 아래와 같이 의존관계를 형성하고 있다.

![interface_based_structure](/assets/images/jsf/advanced/interface_based_structure.png)

위를 보면 interface를 활용하고 있다는 점에서 위의 프록시 패턴 예제와 아주 유사하다는 것을 알 수있다. 따라서 아래와 같이 프록시를 구성하는 것을 생각해볼 수 있다.

![interface_based_proxy_structure](/assets/images/jsf/advanced/interface_based_proxy_structure.png)

> ControllerProxy

```java
@RequiredArgsConstructor
public class OrderControllerInterfaceProxy implements OrderControllerV1 {
    private final OrderControllerV1 target;
    private final LogTrace logTrace;
    @Override
    public String request(String itemId) {
        TraceStatus traceStatus= null;
        try {
            traceStatus = logTrace.begin("orderController");
            String result=target.request(itemId);
            logTrace.end(traceStatus);
            return result;
        } catch (Exception e) {
            logTrace.exception(traceStatus,e);
            throw e;
        }
    }

    @Override
    public String noLog() {
        target.noLog();
        return null;
    }
}

```

> ServiceProxy

```java
@RequiredArgsConstructor
public class OrderServiceInterfaceProxy implements OrderServiceV1 {
    private final OrderServiceV1 target;
    private final LogTrace logTrace;
    @Override
    public void orderItem(String itemId) {
        TraceStatus traceStatus= null;
        try {
            traceStatus = logTrace.begin("orderService");
            target.orderItem(itemId);
            logTrace.end(traceStatus);
        } catch (Exception e) {
            logTrace.exception(traceStatus,e);
            throw e;
        }
    }
}

```

> ControllerProxy

```java
@RequiredArgsConstructor
public class OrderRepositoryInterfaceProxy implements OrderRepositoryV1 {
    private final OrderRepositoryV1 target;
    private final LogTrace logTrace;

    @Override
    public void save(String itemId) {
        TraceStatus traceStatus= null;
        try {
            traceStatus = logTrace.begin("orderRepository");
            target.save(itemId);
            logTrace.end(traceStatus);
        } catch (Exception e) {
            logTrace.exception(traceStatus,e);
            throw e;
        }
    }
}
```

> Config

```java
@Configuration
public class InterfaceProxyConfig {
    @Bean
    public OrderControllerV1 orderController(LogTrace logTrace){
        OrderControllerV1Impl controllerImpl = new OrderControllerV1Impl(orderService(logTrace));
        return new OrderControllerInterfaceProxy(controllerImpl, logTrace);
    }

    @Bean
    public OrderServiceV1 orderService(LogTrace logTrace){
        OrderServiceV1Impl serviceImpl = new OrderServiceV1Impl(orderRepository(logTrace));
        return new OrderServiceInterfaceProxy(serviceImpl, logTrace);
    }

    @Bean
    public OrderRepositoryV1 orderRepository(LogTrace logTrace){
        OrderRepositoryV1 repositoryImpl = new OrderRepositoryV1Impl();
        return new OrderRepositoryInterfaceProxy(repositoryImpl, logTrace);
    }
}
```

위를 보면 알수 있듯이, 기존에는 구현클래를 Spring Bean으로 등록해줬는데, 지금은 프록시를 빈으로 등록하는 것을 확인할 수 있다. 즉, Proxy를 통한 의존관계를 형성하기 때문에 그런 것이다. 구현 클래스는 프록시 내부에서 사용되고 있다.

### Concrete Class

인터페이스 방식은 프록시 패턴과 유사해서 구현하는 것이 간단했다, 그렇다면 구현클래스만 있는 경우 어떻게 해야될까?

![concreted_class_based_proxy_structure](/assets/images/jsf/advanced/concreted_class_based_proxy_structure.png)

위와 같은 구조를 보면 알 수 있듯이, 상속을 활용하면 된다. Proxy를 실제 로직의 하위 클래스로 구성하게 되면, Interface와 유사하게, 부모 클래스를 통한 접근이 가능하기 때문에 중간에 프록시로 구성하는 것이 가능하다.(중간에 대체 되어도 같은 클래스로 인식되기 때문)

> Controller

```java
public class OrderControllerConcreteProxy extends OrderControllerV2 {
    private final OrderControllerV2 target;
    private final LogTrace logTrace;

    public OrderControllerConcreteProxy(OrderControllerV2 target, LogTrace logTrace) {
        super(null);
        this.target = target;
        this.logTrace = logTrace;
    }

    @Override
    public String request(String itemId) {
        TraceStatus traceStatus= null;
        try {
            traceStatus = logTrace.begin("orderController");
            String result=target.request(itemId);
            logTrace.end(traceStatus);
            return result;
        } catch (Exception e) {
            logTrace.exception(traceStatus,e);
            throw e;
        }
    }

    @Override
    public String noLog() {
        target.noLog();
        return null;
    }
}
```

> Service

```java
@Slf4j
public class OrderServiceConcreteProxy extends OrderServiceV2 {

    private final OrderServiceV2 target;
    private final LogTrace logTrace;

    public OrderServiceConcreteProxy(OrderServiceV2 target, LogTrace logTrace) {
        super(null);
        this.target = target;
        this.logTrace = logTrace;
    }

    @Override
    public void orderItem(String itemId) {
        TraceStatus traceStatus= null;
        try {
            traceStatus = logTrace.begin("orderService");
            target.orderItem(itemId);
            logTrace.end(traceStatus);
        } catch (Exception e) {
            logTrace.exception(traceStatus,e);
            throw e;
        }
    }
}

```

> Repository

```java
@Slf4j
public class OrderRepositoryConcreteProxy extends OrderRepositoryV2 {

    private final OrderRepositoryV2 target;
    private final LogTrace logTrace;

    public OrderRepositoryConcreteProxy(OrderRepositoryV2 target, LogTrace logTrace) {
        this.target = target;
        this.logTrace = logTrace;
    }

    @Override
    public void save(String itemId) {
        TraceStatus traceStatus= null;
        try {
            traceStatus = logTrace.begin("orderRepository");
            target.save(itemId);
            logTrace.end(traceStatus);
        } catch (Exception e) {
            logTrace.exception(traceStatus,e);
            throw e;
        }
    }
}
```

각각의 proxy class는 target을 가지고 있는데, 이는 실제 로직으로, 실제 로직을 호출하기 위해서 존재한다. 단, Controller와 Service의 경우 상위 클래스가 생성자를 가지고 있어, super()와 같이 부모 클래스의 생성자를 생성해야한다. 프록시에서는 부모 클래스의 기능을 활용하지 않기 때문에, super(null)과 같이 이용한다.
인터페이스와 달리 이 부분은 상속을 하게 되므로써 발생되는 단점이다.

> Config

```java
@Configuration
public class ConcreteProxyConfig {
    @Bean
    public OrderControllerConcreteProxy orderController(LogTrace logTrace) {
        OrderControllerV2 orderControllerV2 = new OrderControllerV2(orderService(logTrace));
        return new OrderControllerConcreteProxy(orderControllerV2,logTrace);
    }

    @Bean
    public OrderServiceConcreteProxy orderService(LogTrace logTrace) {
        OrderServiceV2 orderServiceV2 = new OrderServiceV2(orderRepository(logTrace));
        return new OrderServiceConcreteProxy(orderServiceV2,logTrace);
    }

    @Bean
    public OrderRepositoryConcreteProxy orderRepository(LogTrace logTrace) {
        OrderRepositoryV2 orderRepositoryV2 = new OrderRepositoryV2();
        return new OrderRepositoryConcreteProxy(orderRepositoryV2,logTrace);
    }

}
```

### Interface vs Concrete Class

인터페이스로 구성하나 구현 클래스로 구성하나 두 가지 경우 모두 프록시를 구성하는 것이 가능하다. 이는 자바가 가지는 다형성을 기반으로 가능한 것이다.

하지만, 클래스 기반의 경우, 아래와 같은 단점을 가지고 있다.
1. 부모 클래스의 생성자를 호출해야하는 점
2. final 클래스의 경우 상속 불가능
3. final 메소드의 경우 오버라이딩 불가능

기본적으로 보면, 인터페이스를 기반으로 하는 것이 조금 더 간편한 것은 맞다. 하지만 상황에 따라서는 구현 클래스 기반으로 구성된 경우 구현 클래스 방식의 프록시를 활용해야한다. 따라서, 상황에 따라서 프록시를 다르게 구성할 수 있다는 것을 알고 있어야한다.

위와 같이 프록시 패턴을 통해 원본 코드의 수정 없이 로그 기능, 실행시간 측정,등의 기능을 수행할 수 있었는데, 한가지 단점이 있다. 바로 프록시 클래스가 너무 많이 생성된다는 점이다. 각각의 인터페이스, 클래스별로 프록시 클래스가 하나 생성되기 된다. 이러한 부분을 해결하기 위해 동적 프록시라는 개념이 존재한다.


## References
link: [inflearn](https://www.inflearn.com/roadmaps/373)

link:[spring_advanced](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8)
