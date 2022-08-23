---
title: "Java Spring Advanced part 5"
excerpt: "Dynamic Proxy"

categories:
  - Web
tags:
  - Java_Spring
  - inflearn
---
# Dynamic Proxy

기존의 방식대로 프록시를 생성하게 되면, 각각의 클래스에 대해 프록시 클래스를 하나씩 생성해야한다. 그렇게 되면, 100개의 클래스가 있고 이에 대해 프록시를 구성해야한다고 하면, 100개의 프록시 클래스를 생성해야한다. 비슷한 로직을 가지고 있는 프록시에 대해서 중복으로 여러 개의 프록시 클래스를 구성하는 것은 비효율적인 일이다. 

따라서, 자바에는 JDK 프록시, CGLIB와 같은 동적 프록시 기능을 통해 동적으로 프록시를 구성할 수 있도록 제공한다.

## Reflection

리플렉션을 활용하게 되면, 클래스,메소드의 메타정보를 동적으로 획득할 수 있고, 동적으로 코드를 호출할 수 있다.

예제를 통해 reflection을 활용해서 동적으로 메소드를 호출하는 과정을 알아보자

> Hello.class

```java
@Slf4j
static class Hello {
    public String callA() {
        log.info("callA");
        return "A";
    }
    public String callB() {
        log.info("callB");
        return "B";
    }
}
```

> Method Call

```java
@Test
void reflection0(){
    Hello hello = new Hello();

    //공통 로직 1 시작
    log.info("start1");
    String result1 = hello.callA();
    log.info("result: {}", result1);
    //공통 로직 1 종료


    //공통 로직 2 시작
    log.info("start2");
    String result2 = hello.callB();
    log.info("result: {}", result2);
    //공통 로직 2 종료
}
```

원래는 Hello class의 callA,callB 메소드를 실행하려고하면 위와 같이 해당 메소드를 직접 호출해야했다.

하지만, 공통 로직을 보게 되면 메소드 호출만 다를뿐, 다른 나머지 기능은 동일한 것을 알 수 있다. 따라서, 메소드 호출 부분만 동적으로 할 수 있게 된다면, 공통 로직 부분을 하나의 부분으로 통일시킬 수 있게 된다.

이는 Reflection을 통해 가능하게 만들 수 있다.

> Reflection Test

```java
@Test
void reflection1() throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    Class<?> aClass = Class.forName("hello.proxy.jdkdynamic.ReflectionTest$Hello");
    Hello target = new Hello();

    //callA 메소드 정보
    Method callA = aClass.getMethod("callA");
    Object result1 = callA.invoke(target);
    log.info("result: {}", result1);

    //callA 메소드 정보
    Method callB = aClass.getMethod("callB");
    Object result2 = callB.invoke(target);
    log.info("result: {}", result2);
}
```

위를 보면, Class.forName을 이용해서 클래스의 메타정보를 획득하게 되고, class.getMethod를 통해 해당 클래스의 메소드 메타 정보를 얻어오게 된다.

그렇게 되면, invoke을 통해 해당 메소드를 동적으로 실행할 수 있게 된다.

이와 같이 메타정보를 이용해서 메소드를 호출하는 방식을 활용하게 되면 아래와 같이 하나의 로직을 이용해서 해당 작업들을 수행할 수 있게 된다.

```java
@Test
void reflection2() throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    Class<?> aClass = Class.forName("hello.proxy.jdkdynamic.ReflectionTest$Hello");
    Hello target = new Hello();

    //callA 메소드 정보
    Method callA = aClass.getMethod("callA");
    dynamicCall(callA, target);

    //callA 메소드 정보
    Method callB = aClass.getMethod("callB");
    dynamicCall(callB, target);
}

private void dynamicCall(Method method, Object target) throws InvocationTargetException, IllegalAccessException {

    //공통 로직 1 시작
    log.info("start1");
    String result1 = (String) method.invoke(target);
    log.info("result: {}", result1);
    //공통 로직 1 종료
}
```

위와 같이, Method 메타 정보만 적절하게 넘겨주게 되면 해당 정보를 토대로, 메소드들 실행할 수 있게 된다. 따라서, 위와 같은 공통 로직(dynamicCall) 1개로 다른 메소드를 처리하고 있다.

다만, Reflection을 사용하게 되면, 컴파일 단에서 메소드 호출을 검증 할 수 없다. 따라서, 메소드 이름을 잘못 입력하게 되더라도 컴파일은 정상적으로 수행되지만, 런타임 과정에서 에러가 발생한다.

따라서, Reflection은 프레임워크 개발이나, 매우 일반적인 공통 로직 처리가 필요할 때, 제한적으로 활용하도록 해야한다.

## JDK 프록시

동적으로 프록시를 구성하는 방법에는 JDK 프록시를 이용하는 방법이 있다. 
JDK 프록시는 내부에서 reflection을 활용하고 있기 때문에, reflection이 어떤식으로 동작하는 지 이해하고 있어야 JDK 프록시를 이해하기 수월하다.

또한, jdk 프록시는 interface 기반으로 프록시를 생성하기 때문에, interface가 없는 경우 jdk 프록시를 이용할 수 없다.

예제를 통해 JDK 프록시를 이해해보자

> AInterface, AImpl

```java
public interface AInterface {
    String call();
}

@Slf4j
public class AImpl implements AInterface {
    @Override
    public String call() {
        log.info("A 호출");
        return "a";
    }
}
```

> BInterface, BImpl

```java
public interface BInterface {
    String call();
}

@Slf4j
public class BImpl implements BInterface {
    @Override
    public String call() {
        log.info("B 호출");
        return "B";
    }
}
```

위와 같이, interface, impl 구현 클래스가 있다고 가정했을 때, 여기에 JDK 프록시에 적용하기 위한 로직 클래스를 생성해야하는데, 이는 아래의 InvocationHandler interface를 구현해야한다.

> InvocationHandler

```java

public interface InvocationHandler {
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable;
}
```

proxy는 proxy 객체를 의미하며, method 에는 실행하고자 하는 메소드의 메타 정보, args는 메소드 호출시 전달되는 인자 정보이다.

그러면 실행 시간을 측정하는 공통 로직을 구현해보자

> TimeInvocationHandler

```java
@Slf4j
public class TimeInvocationHandler implements InvocationHandler {
    private final Object target;

    public TimeInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        log.info("TimeProxy 실행");
        Long startTime = System.currentTimeMillis();

        Object result = method.invoke(target, args);

        Long endTime = System.currentTimeMillis();

        Long resultTime = endTime - startTime;
        log.info("TimeProxy 종료 resultTime={}", resultTime);
        return result;
    }
}
```

여기에서 target는 실제 호출하게 되는 객체를 의미하는데, 이는 프록시가 참조하는 실제 객체를 뜻한다. 따라서, 로직을 실행할 때, 실제 객체를 전달해야한다.

> JDK Proxy Test

```java
@Test
void dynamicA(){
    AInterface target = new AImpl();
    TimeInvocationHandler handler = new TimeInvocationHandler(target);
    AInterface proxy  = (AInterface) Proxy.newProxyInstance(AInterface.class.getClassLoader(), new Class[]{AInterface.class}, handler);

    proxy.call();
    log.info("target-class:{}", target.getClass());
    log.info("proxy-class:{}", proxy.getClass());

}
```

위에서 보면, 프록시를 생성하기 위해 Proxy.newProxyInstance 메소드를 활용한다.
적절 클래스 로더, 인터페이스, 공통 로직을 인자로 전달해주게 되면 이를 토대로 프록시 객체를 생성하게 되고, call을 호출하게 되면 내부에서 handler(로직)을 실행시켜서 실제 객체에 대한 invoke 요청을 수행하게 된다.

>Results

```
TimeInvocationHandler - TimeProxy 실행
AImpl - A 호출
TimeInvocationHandler - TimeProxy 종료 resultTime=0
JdkDynamicProxyTest - targetClass=class hello.proxy.jdkdynamic.code.AImpl
JdkDynamicProxyTest - proxyClass=class com.sun.proxy.$Proxy1
```

실행 과정을 살펴보게 되면 아래와 같이 동작하게 되는 것을 알 수 있다.

![jdk_proxy_mechanism](/assets/images/jsf/advanced/jdk_proxy_mechanism.png)


JDK 프록시를 통해 프록시를 구성하게 되면, 위에서 보면 알듯이 공통 로직 클래스를 하나만 정의해서 이를 프록시에서 공통으로 활용하고 있는 것을 확인할 수 있다. 이를 통해, 공통 로직에 변경이 생기더라도, 하나의 클래스만 수정하면되는 SRP 원칙도 지킬 수 있게 된다.

프록시를 구성하게 되면 아래와 같은 구조를 이루게 된다.

![jdk_proxy_structure](/assets/images/jsf/advanced/jdk_proxy_structure.png)

### Apply JDK proxy

#### Basic

> LogTraceBasicHandler

```java
@Slf4j
public class LogTraceBasicHandler implements InvocationHandler {

    private final Object target;
    private final LogTrace logTrace;

    public LogTraceBasicHandler(Object target, LogTrace logTrace) {
        this.target = target;
        this.logTrace = logTrace;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        TraceStatus traceStatus= null;
        try {
            //getDeclaringClass().getSimpleName()를 통해 클래스 이름을 받아올 수 있다.
            String message = method.getDeclaringClass().getSimpleName() + "." + method.getName() + "()";
            traceStatus = logTrace.begin(message);
            Object result=method.invoke(target,args);
            logTrace.end(traceStatus);
            return result;
        } catch (Exception e) {
            logTrace.exception(traceStatus,e);
            throw e;
        }
    }
}
```

위와 같이 로그를 생성하는 로직을 구현한 클래스를 정의한다.

이제는 프록시를 구성하는 Config 파일을 확인해보자

> DynamicProxyBasicConfig

```java
@Configuration
public class DynamicProxyBasicConfig {

    @Bean
    public OrderControllerV1 orderControllerV1(LogTrace logTrace) {
        OrderControllerV1 orderControllerImpl = new OrderControllerV1Impl(orderServiceV1(logTrace));

        return (OrderControllerV1) Proxy.newProxyInstance(OrderControllerV1.class.getClassLoader(),
                new Class[]{OrderControllerV1.class},
                new LogTraceBasicHandler(orderControllerImpl, logTrace));
    }

    @Bean
    public OrderServiceV1 orderServiceV1(LogTrace logTrace) {
        OrderServiceV1 orderServiceImpl = new OrderServiceV1Impl(orderRepositoryV1(logTrace));

        return (OrderServiceV1) Proxy.newProxyInstance(OrderServiceV1.class.getClassLoader(),
                new Class[]{OrderServiceV1.class},
                new LogTraceBasicHandler(orderServiceImpl, logTrace));
    }

    @Bean
    public OrderRepositoryV1 orderRepositoryV1(LogTrace logTrace) {
        OrderRepositoryV1 orderRepositoryImpl = new OrderRepositoryV1Impl();

        return (OrderRepositoryV1) Proxy.newProxyInstance(OrderRepositoryV1.class.getClassLoader(),
                new Class[]{OrderRepositoryV1.class},
                new LogTraceBasicHandler(orderRepositoryImpl, logTrace));
    }
}
```

#### No-log Proxy

앞선 예제에서 살펴본것을 토대로, Proxy.newProxyInstance를 활용해서 프록시 객체를 생성하게 된다.

![jdk_proxy_application](/assets/images/jsf/advanced/jdk_proxy_application.png)

추가로, no-log 메소드를 호출하게 되는 경우, 로그를 출력해서는 안된다. 이럴 때는 filter 기능을 추가한 Handler를 활용한다.

```java
if (!PatternMatchUtils.simpleMatch(pattern, methodName)) {
    return method.invoke(target, args);
}
```
위와 같이 패턴에 맞지 않은 메소드 요청이 넘어오는 경우, 로그를 출력하지 않고, 메소드만 실행시킬 수 있도록 한다.

PatternMatchUtils.simpleMatch()는 아래와 같이 동작하게 된다.
```
xxx : 정확히 xxx와 일치
xxx*: xxx으로 시작하면 참
*xxx: xxx으로 끝나면 참
*xxx*: xxx을 포함하면 참
```

> LogTraceFilterHandler

```java
@Slf4j
public class LogTraceFilterHandler implements InvocationHandler {

    private final Object target;
    private final LogTrace logTrace;
    private final String[] pattern;

    public LogTraceFilterHandler(Object target, LogTrace logTrace, String[] pattern) {
        this.target = target;
        this.logTrace = logTrace;
        this.pattern = pattern;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        String methodName = method.getName();

        if (!PatternMatchUtils.simpleMatch(pattern, methodName)) {
            return method.invoke(target, args);
        }

        TraceStatus traceStatus= null;
        try {
            String message = method.getDeclaringClass().getSimpleName() + "." + method.getName() + "()";
            traceStatus = logTrace.begin(message);
            Object result=method.invoke(target,args);
            logTrace.end(traceStatus);
            return result;
        } catch (Exception e) {
            logTrace.exception(traceStatus,e);
            throw e;
        }
    }
}
```

> DynamicProxyBasicConfig

```java
@Configuration
public class DynamicProxyFilterConfig {
    public static final String[] patterns = {"request*", "order*", "save*"};
    @Bean
    public OrderControllerV1 orderControllerV1(LogTrace logTrace) {
        OrderControllerV1 orderControllerImpl = new OrderControllerV1Impl(orderServiceV1(logTrace));

        return (OrderControllerV1) Proxy.newProxyInstance(OrderControllerV1.class.getClassLoader(),
                new Class[]{OrderControllerV1.class},
                new LogTraceFilterHandler(orderControllerImpl, logTrace,patterns));
    }

    @Bean
    public OrderServiceV1 orderServiceV1(LogTrace logTrace) {
        OrderServiceV1 orderServiceImpl = new OrderServiceV1Impl(orderRepositoryV1(logTrace));

        return (OrderServiceV1) Proxy.newProxyInstance(OrderServiceV1.class.getClassLoader(),
                new Class[]{OrderServiceV1.class},
                new LogTraceFilterHandler(orderServiceImpl, logTrace,patterns));
    }

    @Bean
    public OrderRepositoryV1 orderRepositoryV1(LogTrace logTrace) {
        OrderRepositoryV1 orderRepositoryImpl = new OrderRepositoryV1Impl();

        return (OrderRepositoryV1) Proxy.newProxyInstance(OrderRepositoryV1.class.getClassLoader(),
                new Class[]{OrderRepositoryV1.class},
                new LogTraceFilterHandler(orderRepositoryImpl, logTrace,patterns));
    }
}
```
로그를 출력해야되는 요청 항목을 Handler에 넘겨주도록 한다.

### Limits

JDK 프록시를 이용하게 되면, 하나의 공통 로직 클래스를 통해 프록시를 구현할 수 있다. 하지만, JDK 프록시를 이용하기 위해서는 인터페이스가 반드시 필요하다, 그렇기 때문에 구현클래스만 있는 경우, JDK 프록시를 구성할 수 없다. 
이럴때는, 바이트코드를 조작하는 CGLIB 라이브러리를 활용해야한다.

실제 사용하게 될떄는, ProxyFactory를 이용해서 동적 프록시를 구성하기 때문에, CGLIB를 깊게 알 필요는 없다. 예제를 통해, 어떤식으로 동작하는 지 알아보자

> Concrete Service

```java
@Slf4j
public class ConcreteService {
    public void call(){
        log.info("ConcreteService");
    }
}
```
위와 같이 구체 클래스가 있다고 하자

CGLIB도 JDK 프록시와 마찬가지로, proxy를 동작시키기 위해서는, Handler가 요구되는데, CGLIB는 MethodInterceptor interface가 제공되며, 이를 구현한 클래스를 생성하면 된다.

> MethodInterceptor 

```java
public interface MethodInterceptor extends Callback {
    Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable;
}
```

> TimeMethodInterceptor

```java
@Slf4j
public class TimeMethodInterceptor implements MethodInterceptor {

    Object target;

    public TimeMethodInterceptor(Object target) {
        this.target = target;
    }

    @Override
    public Object intercept(Object o, Method method, Object[] args, MethodProxy methodProxy) throws Throwable {
        log.info("TimeProxy 실행");
        Long startTime = System.currentTimeMillis();

        Object result = methodProxy.invoke(target, args);

        Long endTime = System.currentTimeMillis();

        Long resultTime = endTime - startTime;
        log.info("TimeProxy 종료 resultTime={}", resultTime);
        return result;

    }
}
```
MethodInterceptor는 JDK 프록시의 InvocationHandler와 구조가 유사하다. 

> CGLIB Test

```java
@Test
void cglib(){
    ConcreteService target = new ConcreteService();

    Enhancer enhancer = new Enhancer();
    enhancer.setSuperclass(ConcreteService.class);
    enhancer.setCallback(new TimeMethodInterceptor(target));
    ConcreteService proxy = (ConcreteService) enhancer.create();

    log.info("target-class:{}", target.getClass());
    log.info("proxy-class:{}", proxy.getClass());

    proxy.call();
}
```

CGLIB 구성을 위해 enhancer활용한다. 

setSuperclass를 통해 어떤 클래스를 기반으로 프록시를 생성할 것인지 명시한다.
setCallBack를 통해 어떤 handler(로직)을 실행할 것인지 명시한다.
create를 프록시가 생성되며, call를 이용해서 메소드가 호출된다.

![cglib_proxy_structure](/assets/images/jsf/advanced/cglib_proxy_structure.png)

위의 구조를 보면 알듯이, cglib로 구성한 프록시는 실제 객체의 하위 클래스 형태로 생성되게 된다. 

### Limits

CGLIB는 상속을 기반으로 프록시를 생성하기 때문에, 상속이 가지는 제약을 가진다.

1. 부모 클래스의 생성자를 확인하게 되는데, 자식 클래스를 동적으로 생성하기 때문에, 기본 생성자가 요구된다.
2. Final 클래스에 대해서는 상속이 불가능하므로, 프록시를 생성할 수 없다.
3. Final 메소드에 대해서는 오버라이딩이 불가능하므로, 프록시가 동작하기 않게 된다.








## References
link: [inflearn](https://www.inflearn.com/roadmaps/373)

link:[spring_advanced](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8)
