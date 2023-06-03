---
title: "AWS Certified Developer Associate"
excerpt: "EC2 Basics"

categories:
  - aws
tags:
  - aws
  - cloud
---


# EC2 Basics

## What is EC2?

Elastic Compute Cloud의 약어로, IaaS의 일종으로 클라우드를 활용하여 가상의 서버를 동작시킬 수 있다. 서버를 구성하여 내부에 어플리케이션이 동작하도록 할 수 있다. 웹 페이지를 구성하여 웹서버를 구성하게 되면 언제든지 해당 웹 서버로 접속하는 것이 가능해진다. AWS에서 제공하는 가장 강력한 기능 중의 하나로, AWS Service에서 필수적으로 다뤄야할 개념이다.

EC2를 활용하여 아래의 서비스들을 수행할 수 있다.
- EC2: virtual server
- EBS: virtual storage
- ELB: load balancer
- ASG: auto-scaling-group

## Configurations

EC2를 구성할 때에는 아래의 요소들을 설정하게 된다.

|Components|Descriptions|
|--|--|
|OS|운영체제(Linux,Windows,etc)|
|CPU|컴퓨팅 성능|
|RAM|메모리 크기|
|Storage|저장 장치, Network(EBS,EFS), HW(EC2 Instance Store)|
|Network Card|네트워크 속도|
|Security Group|방화벽 설정|
|EC2 User Data|Bootstrap srcipt|

> EC2 User Data

EC2 Instance가 처음 실행될때에만 실행되는 명령어로, 초기에 구성해야하는 서비스들이 동작할 수 있도록 script을 짤 수 있다. 가령, 아래와 같이 웹 서버를 동작시키도록 할 수 있다.

```sh
#!/bin/bash
# Use this for your user data (script from top to bottom)
# install httpd (Linux 2 version)
yum update -y
yum install -y httpd
systemctl start httpd
```

## Instance Types

EC2는 여러 종류의 Instance Type를 지원하는데, application의 사용목적에 맞게 원하는 사양을 선택하면 된다. 각 Instance Type은 크게 computing, memory, networking 3가지 변수를 고려하여 나눠지게 된다.

[instance type](https://aws.amazon.com/ko/ec2/instance-types/)

> General Purpose

범용적인 사용을 위한 instance type으로 computing, memory, networking 사양이 균형잡혀 있다.

![general_purpose](/assets/images/aws/instancetype_generalpurpose.png)

해당 과정에서 구성하게 될 EC2는 t2.micro로, general purpose에 해당하며 freetier으로 동작하는 것이 가능하다.

> Computing Optimized

연산량이 많은 작업들을 수행하기 위한 Instance Type으로 computing 부분이 높게 책정되어 있다.

![instancetype_computingoptimized](/assets/images/aws/instancetype_computingoptimized.png)

주로 아래의 작업들을 수행할 때 활용된다.

- Batch Processing
- Media Transcoding
- High Performance Web Servers
- Scientific & Machine Modeling
- Dedicated Game Servers

> Memory Optimized

메모리에 많은 양의 데이터를 로드해서 동작시켜야하는 경우 해당 instance type으로, memory 성능이 높다.

![memory_optimized](/assets/images/aws/instancetype_memoryoptimized.png)

주로 아래의 작업들에 활용된다.

- High Performance Relational/Non-Relational DB
- Web Cache Stores
- In-Memory DB
- Real-Time Processing 

> Storage Optimized

빠른 I/O 연산을 처리해야되며, 많은 양의 데이터를 처리해야되는 서비스에 주로 활용되며, storage 성능이 높다.

![instancetype_storageoptimized](/assets/images/aws/instancetype_storageoptimized.png)

주로 아래의 작업들에 활용된다.

- OLTP
- Relational & NoSQL DB
- Date WareHousing
- Distributed File System

## Security Group

Security Group는 EC2의 방화벽 역할을 수행하는 것으로, EC2 instance의 in-bound 와 out-bound network traffic을 제어하게 된다. 아래와 같이 in-bound, out-bound에 대해서, IP range, Port, Protocol 값들을 설정하여 traffic을 제어한다.

![securitygroup_inbound](/assets/images/aws/securitygroup_inbound.png)

![securitygroup_outbound](/assets/images/aws/securitygroup_outbound.png)

위와 같이 IP를 직접적으로 할당할 수도 있지만, 기존의 Security Group을 할당하는 것도 가능하다. 그렇게 되면 Security Group이 2중으로 설정되게 되는 것이다. **EC2 instance 접속하려고 할때, 만일 timeout error가 발생하는 경우, 대부분 Security Group에 의해서 Instance 접속이 제한 되는 경우이므로, Security Group에 적절한 rule을 추가하도록 한다.**

기본적으로, 모든 in-bound은 차단, 모든 out-bound는 allow가 원칙이다.

## Purchasing Options

EC2 instance를 생성하려고 할 때, 다양한 가격 정책을 적용할 수 있다. 무작정 동작시키는 것이 아닌, 일정한 규칙을 통해 예산을 절약하거나, 보안 규정을 따르기 위해 host을 고정하는 등 다양한 옵션을 고려할 수 있다.

> On-Demand

인스턴스를 사용하는 대로, 비용이 나가는 것으로 별다른 옵션을 선택하지 않은 상태이다. 무작정 사용하는 만큼 나가기 때문에 비용이 가장 높게 설정된다. 그렇기 때문에 장기간에 걸쳐 사용되는 application에는 적합하지 않다.

> Reserved Instance

특정 Instance Type, Region, Tenancy, OS를 지정하고 기간 설정(1년 혹은 3년), 선결제 여부(100%, 일부, 0%) 등을 고정해서 예약하게 되면 On-Demand 보다 대략 72% 저렴하게 사용하는 것이 가능하다. 주로 장기간 꾸준하게 사용되는 application 구동에 적합하다. Convertible Reserved Instance도 있는데 이는 Intance Type, OS, scope 등을 중간에 변경하는 것이 가능한 옵션으로 약 66% 할인율이 적용된다.

> Saving plans

해당 옵션은 미리 사용할 금액을 지정하는 것이다. "1시간 $10 사용하겠다"와 같이 지정하게 되면 해당 비용에 맞춰서 Instance가 생성된다. Instance-family와 Region을 고정한 상태에서 Instance type, OS, Tenancy(Host, Dedicated) 값들이 유동적으로 변경된다. 이 옵션의 경우 약 72% 할인율이 적용된다.

> Spot Instances

가장 공격적인 가격 옵션으로, 가장 저렴하게 instance를 사용하는 것이 가능하다. 최대 90% 할인율이 적용될 수 있지만, 비용 조건이 부합하지 않는 경우에는 instance가 반환될 수 있기 때문에 데이터를 유지해야되는 application 동작에는 적합하지 않다.

> Dedicated Hosts

특정 물리서버 하나를 할당 받는 것으로, host를 고정시켜 놓은 상태로 인스턴스를 동작시킬 수 있는 옵션이다. 회사에 보안 규정이 있거나, 기존의 하드웨어에 귀속된 소프트웨어 라이선스들을 활용해야 되는 경우 이 옵션을 고려한다. 고정된 호스트를 할당하는 것이므로 가장 비싼 옵션이다. 해당 옵션과 on-demand 혹은 reserved option을 고려하면 조금 더 저렴하게 사용 가능하다. 

이와 유사한 옵션으로 Dedicated Instance가 있는데, physical server가 아닌 instance를 고정적으로 할당하는 것이다. 이 두개의 차이는 Physical Server에 대해 instance 배치 방법에 대한 가시성을 제공하느냐의 유무이다. Distance Host에서는 Instance 배치를 설정할 수 있다.

> Capacity Reservations

특정 가용 영역의 Amazon EC2 인스턴스에 대해 원하는 기간만큼 컴퓨팅 용량을 예약할 수 있다. 용량 예약을 통해 언제든지 instance 용량이 필요한 경우 할당 받을 수 있게 된다. 해당 옵션을 사용하게 되면 Instnace를 사용하지 않는 경우에도 계속해서 비용이 발생하게 된다. Regional Reserved Instance, Saving Plan과 결합하여 비용을 절약할 수 있다. 주로, 단기간에 간섭되지 않는 어플리케이션 동작에 사용되는 옵션이다. 


## References

### 영상
[udemy](https://www.udemy.com/course/best-aws-certified-developer-associate/learn/lecture/)

### 문서
[공식문서](https://docs.aws.amazon.com/)









