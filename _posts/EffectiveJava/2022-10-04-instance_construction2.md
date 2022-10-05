---
title: "Effective Java"
excerpt: "Item 4~9"

categories:
 - Java
tags:
 - Java
 - EffectiveJava
 - Clear Coding
---

# "Effective Java"  

## Item 4: Enforce noninstantiability with private constructor

java에서 클래스를 만들어서 사용하는 경우, 정적 메소드,변수를 이루어진 utility class를 만드는 경우가 종종 있다.

1. java.util.math와 같이 함수, 변수를 모아놓은 클래스
2. java.util.Collections 처럼 static factory를 모아놓은 클래스
3. final 클래스를 모아놓은 class

위와 같은 클래스에 대해서는 인스턴스를 생성하지 않는 것을 전제로 한다.

기본적으로 default constructor가 생성되기 때문에, 이러한 클래스에 대해서 인스턴스를 생성하는 것을 방지하기 위해 private constructor을 활용한다.

```java
public class UtilityClass {
    // 기본 생성자가 만들어지는 것을 막는다(인스턴스화 방지용).
    // 악의적 리플렉션을 막을 수 있다.
    private UtilityClass() {
        throw new AssertionError();
    }
}
```

## Item 5: prefer dependency injection to hardwiring resources

특정 자원을 활용하는 클래스가 존재하는데, 이는 동작에 따라 넘겨주는 자원의 종류가 달라지게 된다. Spring에서의 Repository를 살펴보면 JPA, H2 등 여러 가지 DB instance에 대한 repository를 DI를 통해 주입할 수 있다.

이 같이, 필요에 따라 다른 자원을 활용하는 클래스에 대해서 아래와 같이 DI를 활용한다.

```java
public class SpellChecker {
    private final Lexicon dictionary;
    
    // 여기서 의존성 주입을!
    public SpellChecker(Lexicon dictionary){
        this.dictionary = Objects.requireNotNull(dictionary);
    }
    
    public static boolean isVaild(String word) {...}
    public static List<String> suggestions(String typo) {...}
        }
```

## Item 6: Avoid creating unnecessary objects

```java
new String() vs ""
```

String 클래스를 통한 string 객체를 생성하는 것은 불필요한 string instance를 만들게 된다. 반면 ""를 통해 만들어진 string 객체는 immutable instance로 언제든지 재사용이 가능하다.

인스턴스 생성 비용이 큰 경우 캐싱을 통한 재사용을 고려한다.

아래의 String.matches 메소드는 matches를 호출하는 매번의 과정에서 Final State Machine을 만들게 되어 생성비용이 높다.

```java
public class RomanNumerals {
    static boolean isRomanNumeral(String s) {
        return s.matches("^(?=.)M*(C[MD]|D?C{0,3})" +
            "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})");
    }
}
```

이러한 불필요한 시간을 줄이기 위해 pattern instance를 생성해놓고, 계속해서 재사용할 수 있도록 한다.

```java
public class RomanNumerals {
    private static final Pattern ROMAN = Pattern.compile("^(?=.)M*(C[MD]|D?C{0,3})" +
        "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})");
    
    static boolean isRomanNumeral(String s) {
        return ROMAN.matcher(s).matches();
    }
}
```

또한, autoboxing을 활용하게 되면 매 연산을 수행하는 과정에서 매번 새로운 box instance를 만들게 된다. 아래의 sum은 Long instance으로 정의되어, 매번 primitive type인 long과의 연산과정에서 매번 새로운 Long instance을 생성하게 되어 불필요한 인스턴스가 생성된다.

```java
public class Sum {
    private static long sum() {
        Long sum = 0L;
        for (long i = 0; i <= Integer.MAX_VALUE; i++) {
            sum += i;
        }
        return sum;
    }
}
```
object pool을 이용해서 추가적인 객체 생성을 방지하는 방법도 있지만, DB Connection 생성과 같이 객체 생성과정이 무겁지 않은 이상 object pool은 사용하지 않는다. object pool를 이용하게 되면 오히려 코드를 복잡하게 만들고, 성능에 부정적인 영향을 끼친다.

추가적인 객체 생성이 항상 안좋은 것은 아니다. 명확성, 간결성, 기능을 고려한 객체 생성은 오히려 좋은 효과를 보인다.


## Item 7: Eliminate Obsolete object references

사용이 끝난 객체에 대해서는 자원을 해제해야한다. java의 Garbage Collector가 있어, 자원 해제 과정이 자동을 동작할 것이라는 기대를 할 수 있지만 아래와 같은 경우에는 GC가 동작하지 않는다.

```java
public class Stack {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;
    
    public Stack() {
        elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }
    
    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }
    
    public Object pop() {
        if (size == 0) {
            throw new EmptyStackException();
        }
        return elements[--size];
    }
    
    private void ensureCapacity() {
        if (elements.length == size) {
            elements = Arrays.copyOf(elements, 2 * size + 1);
        }
    }
}
```

pop메소드를 살펴보면, size를 줄이는 과정만 있고, 기존에 사용하던 자리에 할당된 object의 메모리를 해제하지 않는다. 이는 스택에서 다쓴 참조(obsolete reference)를 가지고 있기 때문이다. 즉, 해당 객체에 더 이상 참조가 없는 경우에도, obsolete reference로 인해 Garbage Collector을 통한 메모리 해제가 발생하지 않는다는 것이다.

이를 해결하기 위해 아래와 같이 null를 이용해서 더이상 참조가 발생하지 않는 객체에 대해 자원을 해제한다.

```java
public Object pop() {
    if (size == 0)
        throw new EmptyStackException();
    Object result = elements[--size];
    elements[size] = null; // 다 쓴 참조 해제
    return result;
}
```

위 stack 클래스 처럼 클래스에 자신만의 저장소를 가지는 클래스에 대해서는 null을 이용해서 GC에 해당 객체가 더이상 참조될일이 없어 메모리 해제를 하도록 요청할 수 있다.

## Item 8: Avoid using finalizer and cleaner

finalizer와 cleaner와 같은 객체 소멸자 메소드 사용을 지양해야한다.

1. 우선, 객체 소멸 과정이 즉각적으로 발생하지 않는다는 문제점이 있다.
그래서, file-close와 같이 즉각적으로 실행되어야 하는 연산을 finalizer, cleaner 내부에서 동작하도록 하면 안된다.

2. 성능상으로 악영향을 끼친다.
일반적으로 finalizer을 통한 객체 소멸 과정은 시간이 많이 소요되는 무거운 연산이다. finalizer 보다 Auto-Closeable 객체를 통한 자동 소멸 과정을 활용하는 방안이 시간을 효율적으로 활용이 가능하다.

3. 심각한 보안 문제를 가진다.
생성자, 직렬화 과정에서 예외가 발생하게 되면 미완성된 하위 클래스의 finalizer가 동작하여 staic field에 객체를 할당해서 객체의 소멸과정을 방지하는 문제를 낳게 된다.

보통 finalizer와 cleaner은 자원의 소유자가 close를 호출 하지 않는 경우에 대한 안전망 역할을 하기 위해 사용된다. --> 하지만 정상적으로 동작을 하리라는 보장은 없다.

## Item 9: Prefer try-with-resources to try-finally

Try-finally 구문을 이용해서 예외가 발생하더라도 특정 연산이 항상 동작하도록 강제할 수 있다. 

```java
// 자원 하나 회수
static String firstLineOfFile(String path) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(path));
    try {
        return br.readLine();
    } finally {
        br.close();
    }
}
```

하지만 아래와 같이 자원을 여러개 활용하는 경우에 대해서는, try-finally 구문을 사용하면 오히려 복잡해진다. 

```java
// 자원 복수개 회수
static void copy(String src, String dst) throws IOException {
    InputStream in = new FileInputStream(src);
    try {
        OutputStream out = new FileOutputStream(dst);
        try {
            byte[] buf = new byte[BUFFER_SIZE];
            int n;
            while ((n = in.read(buf)) >= 0) {
                out.write(buf, 0, n);
            }
        } finally {
            out.close();
        }
    } finally {
        in.close();
    }
}
```
try, finally 영역 모두에서 에러가 발생할 수 있는데, 이럴때 문제가 발생한다. out.write에서 에러가 발생하게 되면 자동적으로 close에서도 에러가 발생하게 되는데, 이때 가장 먼저 발생되는 에러에 의해 나머지 에러들이 감춰지게 된다. 이에 따라 추후 에러 디버깅이 불가능하다.


이럴 때, try-with-resources를 통해 close를 자동으로 해주는 형태로 활용할 수 있다. 단, Auto-Closeable 한 객체에 대해서만 try-with-resources를 이용하는 것이 가능하다.

```java
static void copy(String src, String dst) throws IOException {
    try (InputStream in = new FileInputStream(src);
        OutputStream out = new FileOutputStream(dst)) {
        byte[] buf = new byte[BUFFER_SIZE];
        int n;
        while ((n = in.read(buf)) >= 0) {
            out.write(buf, 0, n);
        }
    }
}
```

try-with-resource에서도 에러가 발생할 수 있다. 만일, out.write와 close 동작에서 에러가 발생하더라도 맨 첫번째 발생한 에러인 out.write가 에러가 출력되며, close 메소드 동작과정에서 발생한 에러는 나중에 stack-trace를 이용해서 에러를 추적할 수 있다(연쇄적인 메소드 호출과정으로 인해 stack trace에 기록된다.)