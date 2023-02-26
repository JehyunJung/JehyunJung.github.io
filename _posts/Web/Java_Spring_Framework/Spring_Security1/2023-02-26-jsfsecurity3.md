---
title: "Spring Security Part 3"
excerpt: "DelegatingFilterProxy, FilterChainProxy"

categories:
  - Web
tags:
  - Java_Spring
  - Spring_Security
  - inflearn
---

# DelegatingFilterProxy

Servlet Filter의 경우 Spring IoC Container 외부에 존재하는, servlet 영역에서 동작하는 component이다. 따라서, Spring Bean을 활용한 인증 처리가 불가능하다. 하지만, 인증 처리를 위해 Spring Bean에 의존적인 서비스 설계가 필요한 경우가 있는데, 이러한 의존관계를 해결해주기 위해 DelegatingFilterProxy가 존재한다.

## FilterChainProxy

![filer_chain_proxy](/assets/images/jsf/Spring_Security/delegating_filter_proxy.png)

request을 받은 DelegatingFilterProxy는 Spring Bean을 활용하기 위해 springSecurityFilterChain을 bean 이름으로 한 FilterChainProxy 객체를 생성하게 되며, 모든 인증/인가 처리를 FilterChainProxy에 위임한다.

### Flow

1. 위의 다이어그램을 토대로 FilterChainProxy Bean이 만들어지는 것을 확인할 수 있다.

> DelegatingFilterProxy

```java
public DelegatingFilterProxy(String targetBeanName, @Nullable WebApplicationContext wac) {
	Assert.hasText(targetBeanName, "Target Filter bean name must not be null or empty");
	this.setTargetBeanName(targetBeanName);
	this.webApplicationContext = wac;
	if (wac != null) {
		this.setEnvironment(wac.getEnvironment());
	}
}
```

> WebSecurityConfiguration

```java
@Bean(name = AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME)
public Filter springSecurityFilterChain() throws Exception {
	boolean hasFilterChain = !this.securityFilterChains.isEmpty();
	...
	return this.webSecurity.build();
}
```

> WebSecurity

```java
@Override
protected Filter performBuild() throws Exception {
	int chainSize = this.ignoredRequests.size() + this.securityFilterChainBuilders.size();
	List<SecurityFilterChain> securityFilterChains = new ArrayList<>(chainSize);
	List<RequestMatcherEntry<List<WebInvocationPrivilegeEvaluator>>> requestMatcherPrivilegeEvaluatorsEntries = new ArrayList<>();
	for (RequestMatcher ignoredRequest : this.ignoredRequests) {
		WebSecurity.this.logger.warn("You are asking Spring Security to ignore " + ignoredRequest
				+ ". This is not recommended -- please use permitAll via HttpSecurity#authorizeHttpRequests instead.");
		SecurityFilterChain securityFilterChain = new DefaultSecurityFilterChain(ignoredRequest);
		securityFilterChains.add(securityFilterChain);
		requestMatcherPrivilegeEvaluatorsEntries
				.add(getRequestMatcherPrivilegeEvaluatorsEntry(securityFilterChain));
	}
	FilterChainProxy filterChainProxy = new FilterChainProxy(securityFilterChains);
	...
}
```

2. FilterChainProxy에서는 인증/인가에서 사용되는 각종 filter가 초기화되는 것을 확인할 수 있다.

> FilterChainProxy

```java
private void doFilterInternal(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
	...
	List<Filter> filters = getFilters(firewallRequest);
	...
}

private List<Filter> getFilters(HttpServletRequest request) {
	int count = 0;
	for (SecurityFilterChain chain : this.filterChains) {
		if (logger.isTraceEnabled()) {
			logger.trace(LogMessage.format("Trying to match request against %s (%d/%d)", chain, ++count,
					this.filterChains.size()));
		}
		if (chain.matches(request)) {
			return chain.getFilters();
		}
	}
	return null;
}
```

각종 filter가 초기화되어 등록된것을 확인할 수 있다.

![filters](/assets/images/jsf/Spring_Security/filters.png)

## Multiple Security Configs

여러개의 보안 설정 클래스를 두어서 각각의 경로별로 별도의 보안 로직을 따르도록 설정하는 것이 가능하다.

![multiple_filter_chains](/assets/images/jsf/Spring_Security/multiple_filter_chains.png)

다음과 같이 2개의 SecurityConfig 파일에 대해서 따로 생성되어 FilterChainProxy의 SecurityFilterChains에 등록되는 것을 확인할 수 있다.

![multiple_filter_chains_flow](/assets/images/jsf/Spring_Security/multiple_filter_chains_flow.png)

각 설정 클래스 별로 등록된 RequestMatcher에 따라서, 부합하는 SecurityFilterChain의 filter들이 일괄적으로 실행된다.

### Flow

1. 다음과 같이 2개의 Security Config을 생성한다. 이때, @Order을 이용해서 구체적인 경로에서 범용적인 경로를 순서로 SecurityFilterChain을 생성해야 원하는 보안 로직이 실행된다.

```java
@Bean
@Order(0)
public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception{
	//인증 여부 처리
	httpSecurity
			.securityMatcher("/admin/**")
			.authorizeHttpRequests()
			.anyRequest().authenticated()
			.and().httpBasic();
	return httpSecurity.build();
}

@Bean
@Order(1)
public SecurityFilterChain filterChain2(HttpSecurity httpSecurity) throws Exception{
	httpSecurity
			.authorizeHttpRequests()
			.anyRequest().permitAll()
			.and()
			.formLogin();
	return httpSecurity.build();
}
```

2. WebSecurity에서는 각각의 Security Config에 대한 requestMatcher에 따라서 SecurityFilterChain을 등록한다.

> WebSecurity

```java
@Override
protected Filter performBuild() throws Exception {
	int chainSize = this.ignoredRequests.size() + this.securityFilterChainBuilders.size();
	List<SecurityFilterChain> securityFilterChains = new ArrayList<>(chainSize);
	List<RequestMatcherEntry<List<WebInvocationPrivilegeEvaluator>>> requestMatcherPrivilegeEvaluatorsEntries = new ArrayList<>();
	for (RequestMatcher ignoredRequest : this.ignoredRequests) {
		WebSecurity.this.logger.warn("You are asking Spring Security to ignore " + ignoredRequest
				+ ". This is not recommended -- please use permitAll via HttpSecurity#authorizeHttpRequests instead.");
		SecurityFilterChain securityFilterChain = new DefaultSecurityFilterChain(ignoredRequest);
		securityFilterChains.add(securityFilterChain);
		requestMatcherPrivilegeEvaluatorsEntries
				.add(getRequestMatcherPrivilegeEvaluatorsEntry(securityFilterChain));
	}
	FilterChainProxy filterChainProxy = new FilterChainProxy(securityFilterChains);
	...
}
```

![multiple_filter_chains](/assets/images/jsf/Spring_Security/multiple_filter_chains_debug.png)

위와 같이 2개의 SecurityFilterChain이 등록된 것을 확인할 수 있다.

3. 요청이 들어온 경로와 RequestMatcher을 비교하여, 대응되는 SecurityFilterChain이 실행된다.

> FilterChainProxy

```java
private List<Filter> getFilters(HttpServletRequest request) {
int count = 0;
for (SecurityFilterChain chain : this.filterChains) {
	if (logger.isTraceEnabled()) {
		logger.trace(LogMessage.format("Trying to match request against %s (%d/%d)", chain, ++count,
				this.filterChains.size()));
	}
	if (chain.matches(request)) {
		return chain.getFilters();
	}
}
return null;
}
```


## References
link: [inflearn](https://www.inflearn.com/course/%EC%BD%94%EC%96%B4-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%8B%9C%ED%81%90%EB%A6%AC%ED%8B%B0/dashboard)

docs: [spring_security](https://docs.spring.io/spring-security/reference/index.html)



