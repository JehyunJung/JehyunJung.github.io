---
title: "Java Spring Advanced part 8"
excerpt: "Aspect AOP"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Advanced
  - inflearn
---

# AspectAOP

기존의 Spring Boot에서 프록시를 적용하기 위해서는, Advisor를 bean으로 등록하면 되었다. 그렇게 하면, Spring 에서 자동으로 올라가는 Bean Postprocessor가 advisor을 보고, pointcut과 매칭하여 프록시를 자동으로 생성하였다.

```java
@Bean
public Advisor advisor3(LogTrace logTrace) {
    AspectJExpressionPointcut pointcut = new AspectJExpressionPointcut();
    pointcut.setExpression("execution(* hello.proxy.app..*(..)) && !execution(* hello.proxy.app..noLog(..))");
    LogTraceAdvice advice = new LogTraceAdvice(logTrace);
    return new DefaultPointcutAdvisor(pointcut, advice);
}
```

하지만, Advisor을 아래와 같이 직접 만들어서 Bean으로 등록해도 되지만, @Aspect 기반의 annotation을 이용해서 편리하게 pointcut과 advice로 구성된 advisor을 생성할 수 있다.

> Aspect

```java
@Slf4j
@Aspect
public class LogTraceAspect {
    public LogTraceAspect(LogTrace logTrace) {
        this.logTrace = logTrace;
    }

    public final LogTrace logTrace;

    @Around("execution(* hello.proxy.app..*(..))")
    public Object execute(ProceedingJoinPoint joinPoint) throws Throwable {
        TraceStatus status = null;

        try {
            String message = joinPoint.getSignature().toShortString();

            status = logTrace.begin(message);
            Object result = joinPoint.proceed();
            logTrace.end(status);

            return result;
        } catch (Exception e) {
            logTrace.exception(status, e);
            throw e;
        }
    }
}
```

@Apsect annotation을 명시하므로써, annotation 기반의 프록시를 생성하도록 한다.

@Around에 해당하는 값이 pointcut으로 설정되고, @Around가 설정되어 있는 메소드가 Advice가 된다. 이처럼, @Around annotation을 이용하게 되면, Advisor을 직접 만들 필요 없이, 자동으로 Advisor을 만들어서 Bean으로 등록하게 된다.

기존의 Advice에서는 MethodInvocation 객체를 통해, target, 메소드 메타 정보등을 받아서 메소드를 호출했었는데, Aspect에서는 ProceedingJoinPoint 객체를 활용하게 된다. ProceedingJoinPoint는 MethodInvocation은 매우 유사하다. joinpoint에 대한 proceed 메소드를 통해 실제 동작을 수행할 수 있게 된다.

> AppConfig

```java
@Bean
public LogTraceAspect logTraceAspect(LogTrace logTrace) {
    return new LogTraceAspect(logTrace);
}
```

위와 같이 해당 Aspect 클래스를 Spring Bean으로 등록해주게 되면, Aspect 내부에 생성한 advisor가 등록되고, 자동으로 프록시가 구성된다.

## Aspect AOP 동작과정

기존에 AnnotationAwareAspectJAutoProxyCreator이 Spring Bean으로 등록된 Advisor을 통해 자동으로 프록시를 생성하는 것을 알고 있다. 하지만 여기에 추가적으로 @Aspect가 붙은 class에 대해서 advisor을 만들어주는 기능을 추가로 수행하게 된다.

![aspect_advisor_create](/assets/images/jsf/advanced/aspect_advisor_create.png)

위의 그림을 통해 보면, AnnotationAwareAspectJAutoProxyCreator이는 @Aspect 클래스를 모두 찾아서, Advisor을 생성해서, 따로 @Aspect advisor 빌더에 저장하게 된다. **Spring Container에 저장하지 않는 이유는, 해당 Advisor의 경우, advisor 용도라만 활용되기 위해 Spring Bean으로 등록된 것으로 유저에 의해 수정되어서는 안되기 때문에 따로 관리하게 된다.**

위와 같이 @Aspect -> Advisor로 만들어주는 작업이 완료되게 되면, 기존의 프록시 생성과정에 @Aspect 기반의 Advisor을 통한 proxy를 생성하는 과정이 추가로 들어가게 된다.

![aspect_advisor_proxy](/assets/images/jsf/advanced/aspect_advisor_proxy.png)





## References
link: [inflearn](https://www.inflearn.com/roadmaps/373)

link:[spring_advanced](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8)
