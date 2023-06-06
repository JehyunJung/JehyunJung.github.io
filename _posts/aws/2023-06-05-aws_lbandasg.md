---
title: "AWS Certified Developer Associate"
excerpt: "Load Balancer & Auto Scaling Groups"

categories:
  - aws
tags:
  - aws
  - cloud
---


# Load Balancer & Auto Scaling Groups

## Terms

- Vertical Scalability: 수직적 확장성으로, HW에 자체에 대한 성능을 높이는 것을 의미한다. 가령, t2.micro -> t2.large 와 같이 instance size을 키우는 것을 예로 들 수 있다.
- Horizontal Scalability: 수평적 확장성으로, HW 갯수를 늘리는 것을 의미한다. 기존의 ec2 instance 1개로 대응하던 것을 3개로 늘리는 방식이다.
- High Availability: 고가용성을 의미하는 것으로, 여러 AZ에 걸쳐서 데이터 센터를 구축하는 것을 의미한다. 1개의 AZ에 문제가 발생하더라고 다른 AZ을 통해 서비스를 대체함으로써 서비스 중단을 방지한다.

## Load Balancer

load balancer는 왜 필요할까?

![load_balancer](/assets/images/aws/load_balancer.png)

위 처럼, 여러 개의 instance가 동작하는 과정에서 user은 특정 서버로 직접 연결하는 것이 아니라, load balancer을 통해 서버와 연결된다. load balancer을 통해 하나의 DNS, IP(single point of access)를  활용하여 서비스를 묶는 것이 가능하며, instance에 대한 health-checking 기능을 통해 instance의 정상 동작 여부를 점검할 수 있다. 또한, 중간에 트래픽을 매개하므로써, SSL Termination 등의 보안 기능을 제공할 수 있다.

> health-check?

load balancer는 여러 개의 instance를 관리하게 되는데, 이 과정에서 instance가 정상적으로 동작하고 있는지 여부를 체크해야된다. 이를 위해 주기적으로 health-check을 통해 instance가 정상 동작하는지 확인하며, 만일 정상적이지 않는 경우 해당 instance로 요청을 전달하지 않는다. 이는 *connection-draining*과도 연관되어 있다. 인스턴스가 종료되게 되면, 기존의 instance가 처리하던 작업을 마무리하기 위해 일정 시간 기다리게 되는데, 이를 connection-draining 혹은 deregistration-delay라고 한다. 이는 TCP의 4-way handshaking의 Time-Wait와 유사한 기능이다.

> ELB

Elastic Load Balancer, 즉 AWS에서 제공하는 load balancer을 활용하게 되면 따로 추가적인 네트워크 자원 대신에, AWS가 관리하는 Load Balancer을 통해 빠른 구축이 가능하다. 뿐만 아니라, 다양한 AWS Service와도 연관되어 있어, Service의 동작을 통해 instance을 유동적으로 관리할 수 있다.(CloudWatch + AWS)

### Classic Load Balancer

classic load balancer은 Level 4(TCP) + Level 7(Http) 기반에서 동작하는 load balancer로, 1개의 application에 대한 load balancing 기능을 제공한다. Classic Load Balancer의 경우 오래된 버전으로 더 이상 사용되지 않는다.

### Application Load Balancer

Application Load Balancer은 Level 7(Http) 계층에서 동작하는 Load Balancer이다. ALB는 여러 machine에 걸쳐서 여러 application에 대한 load balancing, 한 개의 machine에 대해 여러 application에 대한 load balancing(ex: containers)이 가능하다.

HTTP/2와 WebSocket 방식을 지원한다. 

> Routing 방식

ALB는 load balancing을 할 때, path, hostname, query string, headers을 활용하여 routing을 진행한다. routing의 결과로 target groups으로 요청이 전달되게 된다.

아래의 경우는 path 기반의 load balancing을 진행하도록 routing을 설계한 것이다.

![path_load_balancing](/assets/images/aws/path_load_balancing.png)

위 처럼, request에 대해서 load balancer은 적절 target groups으로 routing을 진행한다. target groups으로 설정 가능한 resources은 아래와 같다.

1. EC2 instances
2. EC2 tasks
3. lambda functions
4. IP Addresses, private IP로 설정해서 기존의 local 서버로 load-balancing 될 수 있도록 구성하는 것도 가능하다.

target groups을 설정해서 application으로 request가 전달될 수 있도록 한다. 이를 활용하면 docker, Amazon ECS와 같은 micro service, container 기반의 어플리케이션을 동작하는 것이 가능하다.

*ALB에서 health-check 기능은 target groups에서 이루어지게 된다.*

아래의 그림을 보면, application으로 load balancer의 ip가 source ip가 되면서, client의 ip를 직접적으로 얻을 수는 없다. 이때, request의 header을 통해 client-ip을 획득할 수 있다.

![load_balancer_client_ip](/assets/images/aws/load_balancer_client_ip.png)

- X-Forwarded-For: client-ip
- X-Forwarded-Port: port
- X-Forwarded-Proto: protocol

### Network Load Balancer

Network Load Balancer은 Level 4(TCP) 계층에서 동작하는 Load Balancer로, TCP, UDP 트래픽을 제어하기 위해 사용된다. NLB은 초당 수백만개의 요청을 처리할 수 있기 때문에, 낮은 지연시간을 요하는 application에 주로 활용된다. 또한, NLB은 1개의 AZ에 대해 1개의 static-ip를 지원하여 application에 접근하는 IP를 제한할 수 있다.

NLB의 target groups가 될 수 있는 것은 아래와 같다.

1. EC2 Istances
2. IP Addresses
3. ALB

![network_load_balancer](/assets/images/aws/network_load_balancer.png) 

위의 그림처럼 nlb의 target groups으로 alb을 설정할 수 있는데, 이렇게 되면 NLB을 통해 1개의 static-ip로 고정하고, alb를 활용해서는 http 기반의 load-balancing을 수행할 수 있게끔 구축할 수 있다.

*NLB에서 HTTP,HTTPS,TCP를 이용해서 health-check를 수행할 수 있다.*

### Gateway Load Balancer

Gateway Load Balancer은 Level 3(IP) 계층에서 동작하는 Load Balancer로 모든 network traffic을 통제한다. GWLB는 주로, 방화벽, 침임방지,예방 시스템, 패킷 감시 장비 등의 네트워크 방지에 대한 load balancing을 진행하게 된다. 네트워크 패킷에 대한 게이트웨이 역할을 수행하기 위해 활용되는 Load Balancer이다. 


### Sticky Sessions

load balancer을 통해 scale-out을 수행하게 되면 client은 어떤 server와 연결될지 알 수 없다. 그렇기 때문에 기존의 server와 이미 인증을 완료했더라도, 다음의 요청에서는 다른 server와 매핑되여 다시 인증을 요구할 수도 있다. 이때, 같은 server로 연결될 수 있게끔하면 기존의 client 정보가 저장되어 재인증을 생략할 수 있는데, 이는 sticky-session을 활용하는 것이다. 즉 매번 같은 서버로의 접근을 수행하는 것이다. 

sticky-session은 cookie 값을 통해 이루어지게 된다. 

1. Application-based Cookie
    - Custom Cookie: application에 의해 생성되는 cookie로, 각 target-group 별로 이름을 설정한다. 단, 예약어(AWSALB,AWSALBAPP,AWSALBTG)로 지정된 cookie name은 사용할 수 없다.
    - Application Cookie: load balancer에 의해 생성되는 cookie로, cookie 이름이 AWSALBAPP이다.
2. Duration-based Cookie
    - Load Balancer에 의해 생성되는 cookie로, AWSALB를 cookie 이름으로 설정한다.

sticky-sesion을 활용하게 되면 연결될 서버를 고정할 수 있지만, 이는 scalability에 위배되는 동작으로, 신중하게 사용되어야 한다.

### Cross-Zone Load Balancing

![cross_zone_load_balancing](/assets/images/aws/cross_zone_load_balancing.png)

cross zone load balancing을 활용하게 되면 여러 AZ에 걸쳐서 등록된 instance에 대해 고르게 request을 분산하는 것이 가능하다.

ALB에 대해서는 무료로 설정하는 것이 가능하며, 기본적으로 Cross-Zone Load Balancing이 활성화되어 있다.

반면, NLB에서는 Cross-Zone Load Balancing 설정시 비용이 발생하게 된다.

### SSL/TLS

암호화된 회선인 HTTPS을 활용하여 request을 요청하고자 할때는 SSL-Certificate을 활용해서 HTTPS 회선을 초기화해서 통신 과정을 암호화해야한다. SSL-Certificate은 CA에 의해 발급되는데, 해당 인증서 내부에는 서버에 대한 정보, 공개키,등 암호화/복호화에 필요한 정보들이 포함되어 있다.

X.509 프로토콜 기반으로 동작하며, ACM(Amazon Certificate Manager)을 이용해서 SSL-Certificate을 관리할 수 있다. 

AWS에서는 여러 host에 대해 개별적으로 SSL-Certificate을 사용할 수 있도록 설정할 수 있는데, 이때, Client은 SNI을 통해 연결하고자 하는 host를 명시하여, 적합한 SSL-Certificate을 활용한 통신 회선을 구축할 수 있도록 한다. SNI는 ALB, NLB, CloudFront에서만 지원한다.

![load_balancer_sni](/assets/images/aws/load_balancer_sni.png)

## Auto Scaling Groups

항상 일정하게 작업을 요청하게 되면 고정된 instance 자원을 설정하면 되지만, 현실 세계에서는 경우에 따라서 서버 자원을 유동적으로 변경해야된다. 이럴 때, Auto Scaling Groups을 활용하면 필요에 따라 Scale-out(인스턴스를 늘리는 작업), Scale-in(인스턴스를 줄이는 작업)을 수행하여 서버 자원을 유동적으로 관리할 수 있다. 또한, ASG를 ELB에 부착해서 ASG를 통해 생성되는 instance가 바로 ELB에 등록될 수 있도록 지원한다.

![asg_elb](/assets/images/aws/asg_elb.png)

미리, Launch Template을 통해 생성하고자 하는 Instance 형태를 정의해서 작업양에 따라 유동적으로 서버 자원을 관리한다.

> Cloud Watch Alarms

CloudWatch Alarm을 활용하면 특정 수치(CPUUtilization, RequestCount, etc)에 변화가 발생할 때 알람을 동작하여 ASG로 하여금 Scaling 작업을 수행하도록 Trigger을 설정할 수 있다.

### Scaling Policies

1. Target Tracking Scaling

가장 간단한 정책으로, 특정 지표에 대한 수치가 일정값 이상/이하가 되도록 유지되도록 한다. 

예를 들어, CPU 이용률이 40%가 되지 않도록 설정하게 되면, 40% 넘어가게 되면 Instance scale-out을 실시한다.(Maximum-Capacity가 여유가 되는 선에서)

2. Simple/Step Scaling

특정 지표 수치에 변동이 발생하였을때, 단계적으로 instance 자원을 scaling 할 수 있다.

예를 들어, CPU 자원이 30%이상이 될때는 2개, 40% 이상이 될때는 3개, 이런 식으로 단계를 구성할 수 있다.

3. Scheduled Actions

이용 패턴을 알고 있을 때, 특정 시점에 scaling 작업을 할 수 있도록 지정할 수 있다.

가령, 금요일 밤 10~12시에는 서비스 이용이 활발해지는 것을 알고 있으면, 해당 시간대에 instance를 늘리도록 지시할 수 있다.

4. Predicted Policy

과거의 workload 분석해서 미래의 workload을 예측해서 instance를 scaling 한다. AI, Machine Learning 기반으로 동작하기 때문에, 앞으로도 더욱 발전가능한 방식이다.

![asg_predictive_scaling](/assets/images/aws/asg_predictive_scaling.png)

### Others

> Scaling Cooldowns

scaling 작업을 수행하고 난 이후, 약 5분간 추가적인 scaling 작업이 이루어지 않도록 한다. scaling 작업을 수행한 이후에 지표값이 안정화되도록 기다리는 것이다. 이를 통해 무분별한 scaling이 발생되지 않도록 방지한다. **well-known AMI를 활용하게 된다면 configuration time, install time을 줄여서 이러한 scaling cooldown을 낮출 수 있다.**

> Instance Refresh

만일 기존의 Launch Template을 통해 Instance가 실행되고 있는 상황에서 새로운 Launch Template을 적용하고자 하는 경우, 자동으로 새로운 Instance로 대체될 수 있도록 지원한다. 이때 min-healthy percentage을 설정해서 동작하고 있는 최소 인스턴스를 제한하여 인스턴스 교체 작업을 진행한다. 모든 instance가 정상적으로 동작할 때까지 소요되는 시간을 warm-up time으로 지정한다.





## References

### 영상
[udemy](https://www.udemy.com/course/best-aws-certified-developer-associate/learn/lecture/)

### 문서
[공식문서](https://docs.aws.amazon.com/)









