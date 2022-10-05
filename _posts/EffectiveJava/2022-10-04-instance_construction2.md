---
title: "Effective Java"
excerpt: "Item 4~6"

categories:
 - Java
tags:
 - Java
 - EffectiveJava
 - Clear Coding
---
# "Effective Java"  

## Item 1: Use Static Factory for Instance Creation

```java
public static Boolean valueOf(boolean b){
    return b ? Boolean.TRUE : Boolean.FALSE;
}
```

위의 방식 처럼 인스턴스를 생성할때, static factory method 방식으로 인스턴스를 생성할 수 있다.

> ### 장점

1. static method으로 이름을 가지기 때문에, 해당 인스턴스가 어떠한 인스턴스를 반환하는 지에 대한 정보를 명확하게 메소드 이름을 통해서 나타낼 수 있다.
또한, 이름을 통해 구분할 수 있기 때문에, 다양한 매개변수를 가지는 생성자를 대체할 수 있다.
2. 매 호출 마다 새로운 인스턴스를 생성하지 않는다.
3. 반환형의 하위 타입을 반환할 수 있다.
4. 어떤 매개변수를 사용하는냐에 따라 매번 다른 반환형을 설정할 수 있다.
5. static method을 작성하는 시점에 반환형 클래스가 없어도 된다.

> ### 단점

1. public, protected 생성자를 가지지 않는 클래스에 대해서는 하위 타입의 클래스를 반환받을 수 없다. 이는 상속을 사용하면서 나타나는 문제로, composition 방식을 통해 객체를 변수로 가지고 있게 되면 해당 문제는 발생하지 않는다.
2. static method을 위치하기 어려울 수 있다.

> ### Naming Static Methods

- from : 매개변수를 하나만 받아서 해당 타입의 인스턴스를 반환하는 메서드
  ```java
  Date date = Date.from(dateStr);
  ```
- of: 여러 매개변수를 받아 적합한 타입의 인스턴스를 반환하는 집계 메서드
  ```java
  Set<Rank> faceCards = EnumSet.of(JACK, QUEEN, KING);
  ```
- valueOf: from과 of의 더 자세한 버전
  ```java 
  BigInteger prime = BigInteger.valueOf(Integer.MAX_VALUE);
  ```
- instance(getInstance):매개변수를 받는다면, 매개변수로 명시한 인스턴스를 반환하지만, 같은 인스턴스임을 보장하지 않는다. 싱글턴일 수도 있다.
  ```java 
  StackWalker luke = StackWalker.getInstance(options);
  ```
- create(newInstance): instance/getInstance와 같지만, 매번 새로운 인스턴스를 반환함을 보장한다.
- getType:getInstance와 맥락은 같으나 특정 Type을 반환할 때 사용
  ```java
  Steak steak = Food.getSteak(Meet.BEEF);
  ```
- newType: newInstance와 같으나, 생성할 클래스가 아닌 다른 클래스의 팩터리 메서드를 정의 할 때 사용
  ```java 
  Steak steak = Food.newSteak(Meet.BEEF);
  ```
- Type: getType, newType의 같결한 버전
  ```java
  Steak steak = Food.steak(Meet.BEEF);
  ```

## Item 2: Use Builder when faced with many constructor parameters

```java
class NutritionFacts{
    private final int servingSize;
    private final int servings;
    private final int calories;
    private final int fat;
    private final int sodium;
    private final int carbohydrate;
    
    public static class Builder{
        // 필수 매개변수
        private final int servingSize;
        private final int servings;
        
        // 선택 매개변수
        private int calories     = 0;
        private int fat          = 0;
        private int sodium       = 0;
        private int carbohydrate = 0;
        
        public Builder(int servingSize, int servings) {
            this.servingSize = servingSize;
            this.servings = servings;
        }
        
        public Builder calories(int calories){
            this.calories = calories;
            return this;
        }
        
        public Builder fat(int fat){
            this.fat = fat;
            return this;
        }
        
        public Builder sodium(int sodium){
            this.sodium = sodium;
            return this;
        }
        
        public Builder carbohydrate(int carbohydrate){
            this.carbohydrate = carbohydrate;
            return this;
        }
        
        public NutritionFacts build(){
            return new NutritionFacts(this);
        }
    }
    
    private NutritionFacts(Builder builder){
        servingSize  = builder.servingSize;
        servings     = builder.servings;
        calories     = builder.calories;
        fat          = builder.fat;
        sodium       = builder.sodium;
        carbohydrate = builder.carbohydrate;
    }
}
```

아래와 같은 방식으로 필요한 parameter만 받아서 객체를 생성할 수 있다.

```java
NutritionFacts cocaCola = new NutritionFacts.Builder(240, 8)
    .calories(100)
    .sodium(35)
    .carbohydrate(27).build();
```

이러한 빌더 패턴을 이용해서 계층 구조에도 활용할 수 있다.

```java
public abstract class Pizza{
    public enum Topping { HAM, MUSHROOM, ONION, PEPPER, SAUSAGE }
    final Set<Topping> toppings;
        
    abstract static class Builder<T extends Builder<T>>{
        EnumSet<Topping> toppings = EnumSet.noneOf(Topping.class);
            public T addTopping(Topping topping){
                toppings.add(Objects.requireNonNull(topping));
                return self();
            }
            abstract Pizza build();
            
            protected abstract T self();
                  
            Pizza(Builder<?> builder){
                toppings = builder.toppings.clone();
            }
    }
                
}

public class NyPizza extends Pizza{
    public enum Size { SMALL, MEDIUM, LARGE }
    private final Size size;
    
    public static class Builder extends Pizza.Builder<Builder>{
        private final Size size;
        
        public Builder(Size size){
            this.size = Objects.requireNonNull(size);
        }
        
        @Override public NyPizza build(){
            return new NyPizza(this);
        }
        
        @Override protected Builder self(){
            return this;
        }
    }
    
    private NyPizza(Builder builder){
        super(builder);
        size = builder.size();
    }
    
    }
 

public class Calzone extends Pizza{
    private final boolean sauceInside;
    
    public static class Builder extends Pizza.Builder<Builder>{
        private boolean sauceInside = false;
        
        public Builder sauceInside(){
            sauceInside = true;
            return this;
        }
        
        @Override public Calzone builde(){
            return new Calzone(this);
        }
        
        @Override protected Builder self(){ return this; }
    }
    private Calzone(Builder builder){
        super(builder);
        sauceInside = builder.sauceInside;
    }
    }

// 객체 생성
NyPizza pizza = new NyPizza.Builder(SMALL)
    .addTopping(SAUSAGE).addTopping(ONION).build();
Calzone calzone = new Calzone.Builder()
    .addTopping(HAM).sauceInside().build();
```

위의 빌더 패턴을 통한 객체 생성 방식을 보면 알듯, method chaining 방식으로 연달아서 builder 클래스를 활용한 객체 생성이 가능하다.

하지만 아래의 단점들도 존재한다.

> ### 단점

1. 객체를 생성하고자 할때, 빌더 클래스를 만들어야한다는 문제가 발생한다. 
2. 기존 생성자를 만드는 것보다 더 복잡하기 때문에, 매개변수가 많은 경우에만 활용하도록 한다.

## Item 3: Enforce Singleton property with private contsructor or enum type

싱글톤이란, 어플리케이션 동작과정에서 객체를 하나만 생성해서, 해당 객체를 공유하는 방식이다. 대표적으로 Java Spring에서 container는 Spring Bean을 Singleton 객체로 관리한다.


### Making Singleton Instances

1. #### public final 방식의 static method 활용

```java
public class Elvis {
    public static final Elvis INSTANCE = new Elvis();
    private Elvis { ... }
    public void leaveTheBuilding() { ... }
```
> 장점 

public staic final을 통해 생성과 즉시 초기화를 진행하도록 하며, private type의 constructor을 통해 외부에서 constructor을 호출할 수 없도록 한다.

> 단점

다만, 권한이 있는 클라이언트에서 리플렉션 API인 AccessibleObject.setAccessible을 사용해 private 생성자를 호출 할 수 있다.

2. #### static factory method를 통해 public staic 객체 초기화

```java
public class Elvis {
    private static final Elvis INSTANCE = new Elvis();
    private Elvis { ... }
    public static Elvis getInstance() {return INSTANCE;}
    
    public void leaveTheBuilding() { ... }
}
```
>장점

1. API 변경 없이, static factory method을 통해 싱글톤 여부를 조정가능하다
2. 정적 팩터리를 제네릭 싱글턴 팩터리로 만들 수 있다.
3. 정적 팩터리의 메서드 참조를 supplier로 사용할 수 있다.
  ```java
  Elvis::instance
  ```

> 단점

1. 위의 리플렉션 API를 통한 private constructor 호출이 가능하다는 점이 존재
2. 해당 singleton class을 serializable하게 설정하려면, 모든 필드를  transient 처리해야되며 readResolve 메소드를 구현해야한다. 그렇지 않으면 deserialize 과정에서 매번 새로운 인스턴스가 생성된다.

  ```java
  private Object readResolve() {
    // '진짜' Elvis를 반환하고, 가짜 Elvis는 가비지 컬렉터에 맡다.
    return INSTANCE;
  }
  ```

3. #### enum type을 통한 싱글톤 인스턴스 생성

```java
public enum Elvis {
    INSTANCE;
    public void leaveTheBuilding() { ... }
}
```

> 장점

1. 간결하면서, 직렬화가 가능하다
2. 위의 2가지 방식에서 갖는 reflection api 문제가 발생하지 않는다.
3. 보통 위와 같이 하나의 원소만을 갖는 enum type 싱글톤이 싱글톤을 구현하는 최선의 방안이다.

> 단점

1. enum type 방식의 싱글톤을 이용하는 경우 상속을 이용할 수 없다.



  




