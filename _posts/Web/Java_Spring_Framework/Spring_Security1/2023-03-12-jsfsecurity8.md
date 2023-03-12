---
title: "Spring Security Part 8"
excerpt: "실전 프로젝트 구성 - Method based Authorization"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# 실전 프로젝트 구성 - Method based Authorization

이전까지는 http 자원에 대한 url 경로에 대한 권한을 설정하여 이에 따른 인가 검증을 수행하였는데, 이제는 method에 대한 권한을 설정하여, method을 호출하였을 때 인가 검증을 수행하도록 한다.

Method의 경우 호출하기 전에 혹은 호출한 이후에 인가 검증이 진행되야 하므로, Method에 대한 Proxy를 생성해서 method 전후로 인가 검증을 수행한다. 이때, Proxy 생성 과정에서 Spring AOP 개념이 활용된다. Bean 객체를 만드는 과정에서 보안이 설정된 메소드를 만나게 되면, 해당 Bean에 대해서 Advice를 등록해서 Proxy에 의해 메소드가 호출되게 된다.

Method 기반의 인가 검증을 적용하기 위해 크게 2가지 방법이 존재한다. Annotation 기반, Map 기반이 있다.

## Annotation 

1. @PreAuthorize, @PostAuthorize
    - SpeL 표현식을 활용하여 필요한 보안 설정을 표현할 수 있다.
    - PreAuthorizeAuthorizationManager,PostAuthorizeAuthorizationManager가 동작한다.
    - ex: @PreAuthorize("hasRole('ROLE_USER') and #accountDto.username == principal.username") 


2. @Secured, @RolesAllowed
    - SpEL 표현식을 활용할 수 없고, Role만 명시하는 것이 가능하다.
    - PreAuthorizeAuthorizationManager에 의해 동작한다.
    - ex: @Secured("ROLE_USER")

### 동작과정

![method_invocation_flow](/assets/images/jsf/Spring_Security/method_invocation_flow.jpg)

1. Annotation 기반의 보안 설정, SecurityConfig 설정

MethodInvocationAuthorization을 적용하고자할 method에 annotation 설정

> Annotation 설정

```java
@Controller
public class AopSecurityController {

    @GetMapping("/preAuthorize")
    @PreAuthorize("hasRole('ROLE_USER') and #accountDto.username == principal.username")
    public String preAuthorize(AccountDto accountDto, Model model) {
        model.addAttribute("method", "Success @PreAuthorize");
        return "aop/method";
    }
}
```

@PrePostAuthorize 혹은 @Secured annotation 기반의 method authorization을 진행하고자 하는 경우 아래와 같이 Config에 Annotation을 설정해야한다.

```java
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
```



2. AbstractAdvisorAutoProxyCreator 의해 Advisor가 등록된다. 

> AbstractAdvisorAutoProxyCreator 

```java
@Override
@Nullable
protected Object[] getAdvicesAndAdvisorsForBean(
        Class<?> beanClass, String beanName, @Nullable TargetSource targetSource) {

    List<Advisor> advisors = findEligibleAdvisors(beanClass, beanName);
    if (advisors.isEmpty()) {
        return DO_NOT_PROXY;
    }
    return advisors.toArray();
}
```

![method_aop](/assets/images/jsf/Spring_Security/method_invocation_advisor.png)

위의 클래스를 통해 Advisor가 등록되는 것을 확인할 수 있다.

3. 실제 동작과정에서는 아래와 같이 AopSecurityController의 Proxy가 호출되면서 내부의 등록된 Advice가 실행된다.

![method_invocation_aopsecuritycontroller](/assets/images/jsf/Spring_Security/method_invocation_aopsecuritycontroller.png)


> AuthorizationManagerBeforeMethodInterceptor

```java
@Override
	public Object invoke(MethodInvocation mi) throws Throwable {
		attemptAuthorization(mi);
		return mi.proceed();
	}

	private void attemptAuthorization(MethodInvocation mi) {
		this.logger.debug(LogMessage.of(() -> "Authorizing method invocation " + mi));
		AuthorizationDecision decision = this.authorizationManager.check(this.authentication, mi);
		this.eventPublisher.publishAuthorizationEvent(this.authentication, mi, decision);
		if (decision != null && !decision.isGranted()) {
			this.logger.debug(LogMessage.of(() -> "Failed to authorize " + mi + " with authorization manager "
					+ this.authorizationManager + " and decision " + decision));
			throw new AccessDeniedException("Access Denied");
		}
		this.logger.debug(LogMessage.of(() -> "Authorized method invocation " + mi));
	}

```

4. Method 호출전에 아래와 같이 PreAuthorizeAuthorizationManager가 동작하게 된다.

> PreAuthorizeAuthorizationManager

```java
@Override
public AuthorizationDecision check(Supplier<Authentication> authentication, MethodInvocation mi) {
    ExpressionAttribute attribute = this.registry.getAttribute(mi);
    if (attribute == ExpressionAttribute.NULL_ATTRIBUTE) {
        return null;
    }
    EvaluationContext ctx = this.registry.getExpressionHandler().createEvaluationContext(authentication, mi);
    boolean granted = ExpressionUtils.evaluateAsBoolean(attribute.getExpression(), ctx);
    return new ExpressionAuthorizationDecision(granted, attribute.getExpression());
}
```

설정된 보안에 적합한 사용자인 경우 해당 메소드가 정상적으로 실행되며, 그렇지 않은 경우 AccessDeniedException이 발생하게 된다.



## References
link: [inflearn](https://www.inflearn.com/course/%EC%BD%94%EC%96%B4-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



