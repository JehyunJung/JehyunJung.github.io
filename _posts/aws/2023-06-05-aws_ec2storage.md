---
title: "AWS Certified Developer Associate"
excerpt: "EC2 Storage Options"

categories:
  - aws
tags:
  - aws
  - cloud
---


# EC2 Storage Options

## EBS

![ebs_volumes](/assets/images/aws/ebs_volumes.png)

Elastic Block Store의 약어로, EC2 instance에 부착할 수 있는 네트워크 드라이브 형태의 스토리지이다. 생성 시, AZ(가용영역) 간에 공유가 가능하다. 특정 데이터를 영속적으로 저장하기  위해 주로 활용되므로, Instance를 제거하더도 데이터를 남기고자 할때 활용될 수 있다. Plug & Play 형태로 쉽게 탈부착이 가능하기 때문에 인스턴스 간에 데이터를 공유하는 것이 간편하다. 대신, 2개 이상의 복수 인스턴스가 하나의 EBS를 공유하는 것은 불가능하다(io2/io1 레벨이 아닌 경우)

고정 데이터를 할당 받기 때문에 비용이 발생하게 된다.

### Delete On Termination

![ebs_delete_on_termination](/assets/images/aws/ebs_delete_on_termination.png)

Default Option으로 Root Volume은 instance가 제거 될때 EBS Volume은 제거되지만, 기타 volume은 남아있게 된다. 만일 instance가 제거되더라도 volume을 남기고자 하면 delete on termination checkbox을 비활성화하면 된다.

### Volume Types

|Volume Type|Size|IOPS|Characteristics|
|--|--|--|--|
|gp3|1GiB~16TiB|3000~16000|General Purpose SSD|
|gp2|1GiB~16TiB|3000~16000|gp3와 유사하지만, Size와 IOPS가 연동되어 있어 Size을 높이면 그 만큼 IOPS는 낮아질 수 밖에 없다.|
|io1/io2|4GiB~16TiB|~32000(Nitro의 경우 64000)|고성능 I/O 작업을 위해 제공되는 SSD로 주로, DB workload에 활용되며 gp3와 마찬가지고 Storage Size와 IOPS를 별도로 수치를 조정할 수 있다.|
|io2 Block Express|4GiB~64TiB|~256000||
|st1|125GiB~16TiB|~500|Throughput optimized HDD, 자주 접근 되는 데이터(Hot Data)를 저장하기 위한 목적|
|sc1|125GiB~16TiB|~250|Cold HDD, 자주 접근되지 않는 데이터(Cold Data)의 저장 목적|

**HDD의 경우 Boot Volume으로 사용하기 부적합하므로, OS의 경우 gp3/gp2/io2/io1을 활용하여 구축해야한다.**

> EBS Multi-Attach

![ebs_multi_attach](/assets/images/aws/ebs_multi_attach.png)

io1/io2 기반의 EBS Volume에 대해서는 2개 이상의 Instance가 같은 Volume을 공유하는 것이 가능하다. 이를 통해, 고가용성 서비스를 제공할 수 있다. 최대 16개의 instance가 1개의 ebs volume을 공유하는 것이 가능하며, cluster 기반의 File System을 사용해야된다.(xfs, ext4, 등은 사용할 수 없다.)

### Snapshots

EBS에 대한 backup image을 생성할 수 있는 것으로, Snapshot을 통해 다시 volume을 생성하는 것이 가능하다. 이때, EBS는 AZ에 의존적이지만, Snapshot을 통해 다른 AZ로 EBS volume을 생성할 수 있다. 즉, Snapshot을 활용하여 AZ 간 Volume을 이동할 수 있는 장점이 있다.

> EBS Snapshot Archive

snapshot 또한 백업 이미지를 저장해야되므로 그 만큼의 비용이 발생하게 된다. 다만, 장기간에 걸쳐서 보존해야되는 백업 데이터의 경우 snapshot archive를 활용하면 비용을 75% 절감할 수 있다. 하지만, 복원 시간이 24H~72H 정도 소요된다.

> Recycle Bin

실수로 snapshot을 제거했을 때, snapshot이 바로 제거 되지 않고 recycle bin에 저장되게끔 하여, 복구할 수 있는 옵션을 제공한다. lifecycle policy를 지정하여 일정 기간 snapshot을 임시 저장할 수 있도록 한다.

> Fast Snapshot Restore

snapshot을 바로 초기화하여 사용할 수 있도록 하는 옵션으로, 처음 초기화하는 과정에서 지연 시간 없이 사용할 수 있도록 한다. 다만 그런 경우 비용이 그 만큼 더 발생하게 된다.

## AMI

Amazon Machine Image의 약어로 Virtual Machine 즉 EC2 Instance에 대한 백업 머신 이미지를 의미한다. 환경설정을 완료한 서버에 대해 이미지 형태로 저장할 수 있다. 이후, Instance를 제거하더도 AMI를 활용하여 기존의 환경설정을 유지한 Server을 생성할 수 있다. 이 AMI는 region에 의존적이다. 또한 AMI를 본인이 직접 생성하는 것은 물론이며, 기존의 사용자들이 만들어놓은 AMI를 사고 팔 수 있는 마켓이 존재한다.

기존의 EC2 instance를 새로운 지역에서 다시 생성하고자 할떄, AMI를 활용하면 간편하게 instance를 생성하는 것이 가능하다.

## EC2 Instance Store

기존의 EBS를 활용하며 Network Drive 형태로 데이터를 저장하는 것이 기본적이다. 하지만 경우에 따라 고성능 I/O 처리를 요구하는 경우, Instance Store를 활용할 수 있다. EBS에 성능이 좋지만, 종료시 데이터를 유지할 수 없기 때문에 주로 buffer, cache, temporary storage으로 주로 활용된다. 또한 휘발성 형태의 데이터이기 때문에 사용자는 중요한 데이터에 대해서는 백업을 실시해야한다. EBS의 경우 최대 64,000 IOPS(io2 Block Express의 경우 256,000)을 지원하지만 Instance Store는 그 이상의 IOPS를 지원한다.

## EFS

![efs](/assets/images/aws/efs.png)

Elastic File System의 약어로, Network을 통해 하나의 Volume을 여러 AZ을 통해 공유할 수 있다. 높은 가용성, 확장성을 제공하는 storage이지만, EBS와 달리 데이터를 사용하는 만큼 비용이 발생하게 되면 평균적으로 gp2에 비해 3배 이상 비싸다.

- security group를 통해 EFS로의 접근이 통제되며, Linux AMI와만 호환된다.
- 최대 1000개의 nfs client에서 사용되며, 10GB/s Throuhput을 지원한다.

EFS은 아래의 4가지 기준으로 구분된다.

> Performance Mode

- General Purpose: latency-sensitive(지연시간이 짧아야되는 작업)을 위한 것으로, webserver, cache의 등에 활용된다.
- Max I/O: 높은 처리 성능을 보이며, 주로 bigdata, 영상 처리에 활용된다.

> Throughput Mode

- Bursting: 50MiB/s ~ 100MiB/s
- Provisioned: storage size와 상관없이 Throughput을 사용하고자 할때 사용
- Elastic: 작업양에 따라 Throughput을 유동적으로 관리한다. 주로 예측하지 못하는 작업 처리에 적합하다.

> Storage Tiers

- Standard: 자주 접근되는 데이터를 보관하는 계층
- EFS-IA: 일정 기간 사용되지 않는 데이터를 EFS-IA에 보관하여 EFS의 비용을 절감할 수 있다.

> Availability and Durability

- Standard: Multi-AZ 지원
- One-Zone: 하나의 AZ만 지원

## EBS vs EC2 Instance Store vs EFS

처리 성능: EC2 Instance Store > EBS > EFS

가용성: EFS > EBS > EC2 instance Store











## References

### 영상
[udemy](https://www.udemy.com/course/best-aws-certified-developer-associate/learn/lecture/)

### 문서
[공식문서](https://docs.aws.amazon.com/)









