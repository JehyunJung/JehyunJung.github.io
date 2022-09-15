---
title: "Java Spring Advanced part 10"
excerpt: "Spring AOP - Pointcut"

categories:
  - Web
tags:
  - Java_Spring
  - inflearn
---

# Pointcut

AspectJ 표현식에서는 다양한 방식으로 poincut을 구성할 수 있다.

## Pointcut Designators

### 예제 구성

Pointcut Designator 동작 과정을 살펴 보기 위해, 예제를 구성하도록 하자

> ClassAop

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ClassAop {
}
```

> MethodAop

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MethodAOP {
    String value();
}
```

> MemberService Interface

```java
public interface MemberService {
    String hello(String param);
}
```

> MemberServiceImpl

```java
@ClassAop
@Component
public class MemberServiceImpl implements MemberService {
    @MethodAOP("test value")
    public String hello(String param) {
        return "ok";
    }
    public String internal(String param) {
        return "ok";
    }
}
```

### Execution

```
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern?namepattern(
param-pattern)
```

pointcut을 구성할떄는 주로 execution을 이용해서 하는데, execution은 위와 같은 구성방식을 취한다.

?: 생략가능

가령 위에서 지정한 MemberServiceImpl class 내에 hello 메소드에 대한 pointcut을 지정하기 위해 아래와 같이 생성한다.

```java
@Around("execution(* hello.aop.member.MemberServiceImpl.*(..))");
```

또는 아래와 같이 간단하게 필수적인 부분만 명시한 pointcut을 활용하는 것도 가능하다.

```java
@Around("execution(* *(..))")
```

*: 어떠한 종류가 오든 상관 없음을 의미
..: 타입의 제한이 없고, 갯수의 제한도 없다.

> Method 이름에 대한 포인트컷 매칭

```java
@Test
void nameMatch() {
    pointcut.setExpression("execution(* hello(..))");
    assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
@Test
void nameMatchStar1() {
    pointcut.setExpression("execution(* hel*(..))");
    assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
@Test
void nameMatchStar2() {
  	pointcut.setExpression("execution(* *el*(..))");
  	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
//매칭이 안되는 경우 advice가 실행되지 않는다.
@Test
void nameMatchFalse() {
    pointcut.setExpression("execution(* nono(..))");
    assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isFalse();
}
```

> Package 이름에 대한 포인트컷 매칭

```java
@Test
void packageExactMatch1(){
	pointcut.setExpression("execution(* hello.aop.member.MemberServiceImpl.hello(..))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
@Test
void packageExactMatch2(){
	pointcut.setExpression("execution(* hello.aop.member.*.*(..))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
//.,.을 통해 포인트컷을 매칭하는 경우, 패키지 구조를 정확하게 표현해야하지 않으면 포인트 컷이 매칭되지 않는다.
@Test
void packageExactFalse(){
	pointcut.setExpression("execution(* hello.aop.*.*(..))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isFalse();
}
//..을 이용하면 하위 패키지 모두가 매칭된다.
@Test
void packageMatchSubPackage1(){
	pointcut.setExpression("execution(* hello.aop.member..*.*(..))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
```

> Type을 통한 포인트컷 매칭

```java
@Test
void typeExactMatch(){
	pointcut.setExpression("execution(* hello.aop.member.MemberServiceImpl.*(..))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
//부모 클래스에 대한 매칭이 가능하다.
@Test
void typeMatchSuperType(){
	pointcut.setExpression("execution(* hello.aop.member.MemberService.*(..))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
//부모 클래스를 통해 매칭하는 경우, 부모 클래스 내부에 정의된 메소드에 대해서만 포인트컷이 매칭된다.
@Test
void typeMatchInternal() throws NoSuchMethodException {
	pointcut.setExpression("execution(* hello.aop.member.MemberService.*(..))");
	Method internal = MemberServiceImpl.class.getMethod("internal", String.class);

	assertThat(pointcut.matches(internal, MemberServiceImpl.class)).isFalse();
}
@Test
void typeMatchInternal2() throws NoSuchMethodException {
	pointcut.setExpression("execution(* hello.aop.member.MemberServiceImpl.*(..))");
	Method internal = MemberServiceImpl.class.getMethod("internal", String.class);

	assertThat(pointcut.matches(internal, MemberServiceImpl.class)).isTrue();
}
```

> 인자를 통한 포인트컷 매칭

```java
@Test
void argsMatch(){
	pointcut.setExpression("execution(* *(String))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
//매개변수가 없는 메소드
@Test
void argsMatchNoArgs(){
	pointcut.setExpression("execution(* *())");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isFalse();
}
//매개변수가 1개인 메소드
@Test
void argsMatchStart(){
	pointcut.setExpression("execution(* *(*))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
//매개변수가 여러 개인 메소드
@Test
void argsMatchAll(){
	pointcut.setExpression("execution(* *(..))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
//메소드의 인자가 String으로 시작하는 메소드
@Test
void argsMatchComplex(){
	pointcut.setExpression("execution(* *(String,..))");
	assertThat(pointcut.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}
```

### Within

포인트컷의 타입을 지정하기 위해 사용된다.

```java
@BeforeEach
public void init() throws NoSuchMethodException {
	helloMethod = MemberServiceImpl.class.getMethod("hello", String.class);
}
//정확하게 타입이 일치
@Test
void withinExact() {
	pointcut.setExpression("within(hello.aop.member.MemberServiceImpl)");
	assertThat(pointcut.matches(helloMethod,
			MemberServiceImpl.class)).isTrue();
}
//Service가 들어간 타입
@Test
void withinStar() {
	pointcut.setExpression("within(hello.aop.member.*Service*)");
	assertThat(pointcut.matches(helloMethod,
			MemberServiceImpl.class)).isTrue();
}
//특정 패키지 내부에 있는 타입
@Test
void withinSubPackage() {
	pointcut.setExpression("within(hello.aop..*)");
	assertThat(pointcut.matches(helloMethod,
			MemberServiceImpl.class)).isTrue();
}
//within은 부모 클래스르 통한 타입 지정이 불가능하다.
@Test
@DisplayName("super타입에 대해서 지정하면 에러 발생")
void withinSuperTypeFalse() {
	pointcut.setExpression("within(hello.aop.member.MemberService)");
	assertThat(pointcut.matches(helloMethod,
			MemberServiceImpl.class)).isFalse();
}
```

### Args

execution과 달리 args을 통한 포인트컷을 매칭하는 경우 인자의 부모 타입도 허용한다.

```java
@Test
void args() {
//hello(String)과 매칭
	assertThat(pointcut("args(String)")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
	assertThat(pointcut("args(Object)")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
	assertThat(pointcut("args()")
			.matches(helloMethod, MemberServiceImpl.class)).isFalse();
	assertThat(pointcut("args(..)")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
	assertThat(pointcut("args(*)")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
	assertThat(pointcut("args(String,..)")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
}

/*
* execution(* *(java.io.Serializable)): 메서드의 시그니처로 판단 (정적)
* args(java.io.Serializable): 런타임에 전달된 인수로 판단 (동적)
*/

@Test
void argsVsExecution() {
//Args
	assertThat(pointcut("args(String)")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
	assertThat(pointcut("args(java.io.Serializable)")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
	assertThat(pointcut("args(Object)")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
//Execution
	assertThat(pointcut("execution(* *(String))")
			.matches(helloMethod, MemberServiceImpl.class)).isTrue();
	//execution을 이용하면 인자의 부모 타입에 대한 포인트컷 지정은 불가능하다.
	assertThat(pointcut("execution(* *(java.io.Serializable))") //매칭 실패
			.matches(helloMethod, MemberServiceImpl.class)).isFalse();
	assertThat(pointcut("execution(* *(Object))") //매칭 실패
			.matches(helloMethod, MemberServiceImpl.class)).isFalse();
}
```

### @target, @within

타입(class)에 annotation이 적용된지 여부에 따라 포인트컷이 매칭된다.

![ann_target_vs_within](/assets/images/jsf/advanced/ann_target_vs_within.png)

@target의 경우, annotation이 설정된 child class 뿐만아니라, 부모 클래스에 있는 메소드에 대해서도 포인트컷이 적용되지만, 

@within은 오로지 annotation이 붙여진 타입에 대해서만 포인트컷이 적용된다.

```java
static class Parent {
	public void parentMethod(){} //부모에만 있는 메서드
}

@ClassAop
static class Child extends Parent {
	public void childMethod(){}
}
```

위와 같이 class가 구성되어 있고, child 클래스에 @ClassAop annotation이 붙어 있는 경우

```java
@Aspect
static class AtTargetAtWithinAspect {
//@target: 인스턴스 기준으로 모든 메서드의 조인 포인트를 선정, 부모 타입의 메서드도 적용
	@Around("execution(* hello.aop..*(..)) && @target(hello.aop.member.annotation.ClassAop)")
	public Object atTarget(ProceedingJoinPoint joinPoint) throws Throwable {
		log.info("[@target] {}", joinPoint.getSignature());
		return joinPoint.proceed();
	}
//@within: 선택된 클래스 내부에 있는 메서드만 조인 포인트로 선정, 부모 타입의 메서드는            적용되지 않음
	@Around("execution(* hello.aop..*(..)) && @within(hello.aop.member.annotation.ClassAop)")
	public Object atWithin(ProceedingJoinPoint joinPoint) throws Throwable {
			log.info("[@within] {}", joinPoint.getSignature());
			return joinPoint.proceed();
	}
}

@Test
void success() {
	log.info("child Proxy={}", child.getClass());
	child.childMethod(); //부모, 자식 모두 있는 메서드
	child.parentMethod(); //부모 클래스만 있는 메서드
}
```

> Results

```
[@target] void hello.aop.pointcut.AtTargetAtWithinTest$Child.childMethod()
[@within] void hello.aop.pointcut.AtTargetAtWithinTest$Child.childMethod()
[@target] void hello.aop.pointcut.AtTargetAtWithinTest$Parent.parentMethod()
```

> 주의 사항

args, @args, @target의 경우 단독으로 사용하게 될경우, 적용되는 메소드의 범위가 굉장히 넓기 때문에, Spring Container 환경에서 모든 메소드에 AOP를 적용하려고 시도를 할것이다. 따라서, 위의 pcd에 대해서는 다른 pcd와 같이 사용해서 프록시 적용대상을 축소한 다음에 적용해야한다.

### @annotaion, @args

> @annotation

method에 annotation이 붙은 경우, 포인트컷이 매칭된다.

```java
@Slf4j
@Aspect
static class AtAnnotationAspect {
	@Around("@annotation(hello.aop.member.annotation.MethodAOP)")
	public Object doAtAnnotation(ProceedingJoinPoint joinPoint) throws Throwable {
		log.info("[@annotation]{}", joinPoint.getSignature());
		return joinPoint.proceed();
	}
}
```
위와 같이 @annotation을 사용하면 MemberServiceImpl에 @MethodAop가 붙은 hello 메소드가 실행된다.

```
[@annotation] String hello.aop.member.MemberService.hello(String)
```
> @args

이는 인자에 annotation이 붙은 메소드에 대해서 포인트컷이 매칭된다.

### bean

bean 이름에 대해서 포인트컷을 매칭한다.


```java
@Slf4j
@Aspect
static class BeanAspect {
	@Around("bean(orderService) || bean(*Repository)")
	public Object doAtAnnotation(ProceedingJoinPoint joinPoint) throws Throwable {
		log.info("[bean]{}", joinPoint.getSignature());
		return joinPoint.proceed();
	}
}
```
위와 같이 포인트컷을 지정하면, orderService Bean 안에 있는 메소드에 대해서, advice가 적용되며, Repository로 끝나는 Bean 안에 있는 메소드에 대해 advice가 적용된다.

```
[bean] void hello.aop.order.OrderService.orderItem(String)
[orderService] 실행
[bean] String hello.aop.order.OrderRepository.save(String)
[orderRepository] 실행
```

## 매개변수 전달

포인트컷을 통해 target이 호출될때 전달되는 매개변수를 advice에 전달할 수 있다.

```java
//member 패키지에 대한 포인트 컷을 지정
@Pointcut("execution(* hello.aop.member..*.*(..))")
private void allMember() {

}

//ProceedingJoinPoint을 이용해서 매개변수를 활용할 수 있다.
@Around("allMember()")
public Object logArgs1(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
	Object args1 = proceedingJoinPoint.getArgs()[0];
	log.info("[logArgs1]{},args={}", proceedingJoinPoint.getSignature(), args1);
	return proceedingJoinPoint.proceed();
}
//args를 이용해서 인자를 전달
@Around("allMember() && args(arg,..)")
public Object logArgs1(ProceedingJoinPoint proceedingJoinPoint, Object arg) throws Throwable {
	log.info("[logArgs2]{},args={}", proceedingJoinPoint.getSignature(), arg);
	return proceedingJoinPoint.proceed();
}

@Before("allMember() && args(arg,..)")
public void logArgs3(String arg) {
	log.info("[logArgs3] args={}", arg);
}

//this를 사용하게 되면 --> spring container에 올라가 있는 프록시 객체가 매개변수로 전달된다.
@Before("allMember() && this(obj)")
public void thisArgs(JoinPoint joinPoint,MemberService obj) {
	log.info("[this]{} obj={}",joinPoint.getSignature(),obj.getClass());
}
//target의 경우, this와 달리, 실제 target 객체가 전달된다.
@Before("allMember() && target(obj)")
public void targetArgs(JoinPoint joinPoint,MemberService obj) {
	log.info("[target]{} obj={}",joinPoint.getSignature(),obj.getClass());
}
//@target을 활용한 annotation 전달 --> 해당 annotation이 적용된 클래스의 부모 클래스내의 메소드까지 가능
@Before("allMember() && @target(annotation)")
public void targetArgs(JoinPoint joinPoint, ClassAop annotation) {
	log.info("[@target]{} obj={}",joinPoint.getSignature(),annotation);
}
//@within @target과 달리, annoation이 적용된 클래스 내에 있는 메소드에 대해서만 가능
@Before("allMember() && @within(annotation)")
public void withinArgs(JoinPoint joinPoint, ClassAop annotation) {
	log.info("[@within]{} obj={}",joinPoint.getSignature(),annotation);
}
//@annotation을 이용해서 annotation이 적용된 method에 대한 포인트컷
@Before("allMember() && @annotation(annotation)")
public void annotationArgs(JoinPoint joinPoint, MethodAOP annotation) {
	log.info("[@annotation]{} annotationValue={}",joinPoint.getSignature(),annotation.value());
}
```
> Results

```
2022-09-16 01:17:13.335  INFO 40712 --- [           main] hello.aop.pointcut.ParameterTest         : memberService proxy:class hello.aop.member.MemberServiceImpl$$EnhancerBySpringCGLIB$$d81038b2
2022-09-16 01:17:13.338  INFO 40712 --- [           main] h.a.p.ParameterTest$ParameterAspect      : [logArgs1]String hello.aop.member.MemberServiceImpl.hello(String),args=helloA
2022-09-16 01:17:13.339  INFO 40712 --- [           main] h.a.p.ParameterTest$ParameterAspect      : [logArgs2]String hello.aop.member.MemberServiceImpl.hello(String),args=helloA
2022-09-16 01:17:13.339  INFO 40712 --- [           main] h.a.p.ParameterTest$ParameterAspect      : [@annotation]String hello.aop.member.MemberServiceImpl.hello(String) annotationValue=test value
2022-09-16 01:17:13.339  INFO 40712 --- [           main] h.a.p.ParameterTest$ParameterAspect      : [logArgs3] args=helloA
2022-09-16 01:17:13.340  INFO 40712 --- [           main] h.a.p.ParameterTest$ParameterAspect      : [target]String hello.aop.member.MemberServiceImpl.hello(String) obj=class hello.aop.member.MemberServiceImpl
2022-09-16 01:17:13.340  INFO 40712 --- [           main] h.a.p.ParameterTest$ParameterAspect      : [@target]String hello.aop.member.MemberServiceImpl.hello(String) obj=@hello.aop.member.annotation.ClassAop()
2022-09-16 01:17:13.341  INFO 40712 --- [           main] h.a.p.ParameterTest$ParameterAspect      : [this]String hello.aop.member.MemberServiceImpl.hello(String) obj=class hello.aop.member.MemberServiceImpl$$EnhancerBySpringCGLIB$$d81038b2
2022-09-16 01:17:13.341  INFO 40712 --- [           main] h.a.p.ParameterTest$ParameterAspect      : [@within]String hello.aop.member.MemberServiceImpl.hello(String) obj=@hello.aop.member.annotation.ClassAop()
```

## This vs Target

위의 매개변수 전달에서 확인했듯이, This는 Spring Container에 등록된 프록시 객체에 대한 조인 포인트를 제공하며, Target은 실제 객체에 대한 조인 포인트를 제공한다.

This/Target는 Proxy 방식에 따라 실행되는 방식이 다르다.

### JDK 동적 프록시

![jdk_proxy_aop](/assets/images/jsf/advanced/jdk_proxy_aop.png)

> MemberService 타입에 대한 포인트컷

this(hello.aop.member.MemberService)
target(hello.aop.member.MemberService)

두 경우, 모두 정상적으로 AOP가 적용된다.

> MemberServiceImpl 타입에 대한 포인트 컷

this(hello.aop.member.MemberServiceImpl)
target(hello.aop.member.MemberServiceImpl)

this의 경우, MemberServiceImpl에 대한 AOP가 적용되지 않는다. 이는 JDK Proxy가 프록시를 만들 떄, interface를 이용해서 Proxy를 만들기 때문에, MemberServiceImpl과 아무런 연관이 없기 때문이다. 따라서, JDK 프록시로 구성될 때, this을 통한 포인트컷 매칭시 AOP가 적용되지 않는다.

```java
@SpringBootTest(properties = "spring.aop.proxy-target-class=true") //JDK Proxy
```

proxy-target-class를 true로 명시해서 JDK 동적 프록시 방식을 강제한다.

```java
@Around("this(hello.aop.member.MemberService)")
public Object doThisInterface(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
	log.info("[this-interface]{}", proceedingJoinPoint.getSignature());
	return proceedingJoinPoint.proceed();
}
@Around("target(hello.aop.member.MemberService)")
public Object doTargetInterface(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
	log.info("[target-interface]{}", proceedingJoinPoint.getSignature());
	return proceedingJoinPoint.proceed();
}

@Around("this(hello.aop.member.MemberServiceImpl)")
public Object doThis(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
	log.info("[this-implement]{}", proceedingJoinPoint.getSignature());
	return proceedingJoinPoint.proceed();
}
@Around("target(hello.aop.member.MemberServiceImpl)")
public Object doTarget(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
	log.info("[target-implement]{}", proceedingJoinPoint.getSignature());
	return proceedingJoinPoint.proceed();
}
```

> Results

```
[target-impl] String hello.aop.member.MemberService.hello(String)
[target-interface] String hello.aop.member.MemberService.hello(String)
[this-interface] String hello.aop.member.MemberService.hello(String)
```

구현체에 대한 this 포인트컷은 실행되지 않을 것을 확인할 수 있다.


### CGLIB

![cglib_aop](/assets/images/jsf/advanced/cglib_aop.png)

> MemberService 타입에 대한 포인트컷

this(hello.aop.member.MemberService)
target(hello.aop.member.MemberService)

두 경우, 모두 정상적으로 AOP가 적용된다.

> MemberServiceImpl 타입에 대한 포인트 컷

this(hello.aop.member.MemberServiceImpl)
target(hello.aop.member.MemberServiceImpl)

JDK 프록시와 달리, CGLIB는 Impl 클래스에 대해서 프록시 클래스를 만들기 때문에, 구현체를 포인트컷을 지정하더라도 AOP가 적용된다.

```java
@SpringBootTest(properties = "spring.aop.proxy-target-class=false") //JDK Proxy
```

proxy-target-class를 false로 해서, CGLIB 방식으로 프록시를 구성하도록 한다.

프록시 예제 코드는 JDK 프록시 방식과 동일하다

> Results

```
[target-impl] String hello.aop.member.MemberServiceImpl.hello(String)
[target-interface] String hello.aop.member.MemberServiceImpl.hello(String)
[this-impl] String hello.aop.member.MemberServiceImpl.hello(String)
[this-interface] String hello.aop.member.MemberServiceImpl.hello(String)
```

정상적으로 모든 포인트컷에 대해 advice가 실행되는 것을 확인할 수 있다.


## References
link: [inflearn](https://www.inflearn.com/roadmaps/373)

link:[spring_advanced](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%ED%95%B5%EC%8B%AC-%EC%9B%90%EB%A6%AC-%EA%B3%A0%EA%B8%89%ED%8E%B8)
