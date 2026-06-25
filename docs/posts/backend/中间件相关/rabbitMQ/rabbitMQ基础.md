# RabbitMQ 完整教程
## 第一批次：MQ基础 01~05（初识MQ、RabbitMQ安装）
### 01. RabbitMQ课程介绍
整体学习路线分两大块：
1. **MQ基础**：什么是消息队列、同步/异步区别、主流MQ选型、RabbitMQ安装、四大交换机模型、SpringBoot整合、业务改造
2. **MQ高级**：生产者可靠性、消息持久化、消费者可靠性、幂等、延迟消息（死信/插件两种方案）
   学习目标：能在项目中落地可靠消息队列，解决异步解耦、削峰、最终一致性问题，应对面试高频MQ八股。

### 02. 初识MQ-同步调用
#### 1. 同步调用流程
A服务调用B服务，**阻塞等待B完整执行并返回结果**，全程同步阻塞：
1. A发起HTTP/Feign请求
2. B执行业务逻辑
3. B返回数据给A
4. A收到结果才继续执行后续代码

#### 2. 同步调用痛点
- 耦合严重：A强依赖B，B宕机/超时，A直接报错
- 响应慢：A必须等B完成，链路越长接口耗时越高
- 峰值扛不住：高并发下所有请求同时打向B，B瞬间压垮
- 无法削峰：流量洪峰直接穿透到下游数据库

#### 场景举例
下单同步调用积分服务、短信服务：用户下单必须等积分增加、短信发送完成才返回订单成功，接口耗时拉满。

### 03. 初识MQ-异步调用（消息队列核心价值）
#### 1. 异步调用（MQ实现）流程
生产者（A）只发消息到MQ队列，**不用等待下游执行，直接返回**；消费者（B/C）后台异步消费：
1. A完成核心业务（下单），发送消息到RabbitMQ
2. A立刻给前端返回“下单成功”，不阻塞
3. MQ持久保存消息
4. B（积分）、C（短信）后台从队列拉取消息，各自异步执行业务

#### 2. MQ三大核心作用
1. **解耦**：生产者、消费者完全隔离，新增下游只新增消费者，不用改生产者代码
2. **异步提速**：主流程只做核心逻辑，非核心任务丢MQ，接口响应速度大幅提升
3. **削峰填谷**：高峰期消息存入队列，下游匀速消费，避免瞬间压垮数据库/下游服务

#### 补充：异步额外优势
- 流量削峰：秒杀、大促海量请求堆积队列，平缓消费
- 消息可靠：服务宕机消息不丢失，恢复后继续消费

### 04. 初识MQ-技术选型（主流中间件对比）
| 中间件 | 开发语言 | 吞吐量 | 可靠性 | 延迟消息 | 适用场景 |
|--------|----------|--------|--------|----------|----------|
| RabbitMQ | Erlang | 万级/秒 | 极高（持久化、死信、事务、确认机制完善） | 原生支持插件延迟 | 电商业务、金融、可靠性优先、中小企业 |
| RocketMQ | Java | 十万级 | 高，阿里开源 | 原生支持定时/延迟 | 阿里系、大数据、高吞吐业务 |
| Kafka | Scala | 百万级 | 基础可靠，侧重日志 | 不原生支持，需自行实现 | 日志收集、大数据流处理、实时计算 |

#### 选型结论（课程选用RabbitMQ原因）
1. 可靠性机制最完善：生产者确认、消费者ACK、持久化、死信队列，适合支付、订单等不能丢消息的业务
2. Erlang语言天生高并发、低延迟，消息路由模型丰富（4种交换机）
3. 可视化管理界面，运维简单，学习门槛低
4. Spring生态完美适配，SpringAMQP封装极简

### 05. RabbitMQ-认识和安装
#### 一、RabbitMQ核心架构概念
1. **Broker**：RabbitMQ服务实例，整个消息中间件服务
2. **VirtualHost（虚拟主机）**：数据隔离单元，07节课详细讲，多业务环境区分队列、交换机，权限隔离
3. **Exchange（交换机）**：接收生产者消息，根据路由规则转发到队列，分4种类型
4. **Queue（队列）**：存储消息，等待消费者拉取，消息最终落地队列
5. **Binding（绑定）**：交换机和队列之间的绑定关系，携带routingKey路由键
6. Producer生产者：发送消息客户端
7. Consumer消费者：接收消息客户端

#### 二、Docker快速安装（主流方式）
RabbitMQ依赖Erlang，Docker一键部署带管理面板版本：
```shell
# 1. 拉取带web管理界面镜像
docker pull rabbitmq:3.12-management

# 2. 启动容器
docker run -d \
--name rabbitmq \
-p 5672:5672 \   # 消息通信端口
-p 15672:15672 \ # web管理面板端口
-e RABBITMQ_DEFAULT_USER=admin \
-e RABBITMQ_DEFAULT_PASS=123456 \
rabbitmq:3.12-management
```
#### 三、访问管理面板
地址：`http://服务器IP:15672`，账号admin/123456
面板功能：查看虚拟主机、交换机、队列、消息、连接、通道、权限管理

#### 端口说明
- 5672：Java客户端连接RabbitMQ通信端口
- 15672：浏览器可视化管理后台端口

## 06. RabbitMQ-快速入门（管理控制台实操）
### 整体流程：生产者发消息 → 交换机 → 队列 → 消费者收消息
1. 创建虚拟主机（vhost），分配账号权限
2. 创建交换机（默认先使用Direct直连交换机）
3. 创建消息队列Queue
4. 绑定交换机与队列，设置路由键RoutingKey
5. 控制台模拟生产者发送消息，携带routingKey
6. 控制台查看队列内消息、手动获取消息（模拟消费）

### 控制台核心操作要点
- 发送消息时可自定义消息头、消息持久化属性
- Get Message：单次取一条消息，消费后立即删除
- Purge Message：清空队列全部消息（生产环境禁止随便操作）
- 队列详情可查看消息堆积数量、消费者连接、绑定关系

## 07. RabbitMQ-数据隔离（VirtualHost虚拟主机）
### 1. 什么是VirtualHost
相当于RabbitMQ内部的**独立命名空间**，每一个vhost下的交换机、队列、绑定、权限完全隔离，互不干扰。
- 根默认虚拟主机：`/`
- 多业务场景：订单业务创建`/order`、支付业务`/pay`，两套资源完全隔离

### 2. 核心作用
1. 数据隔离：不同业务队列互不冲突，同名队列在不同vhost是两个独立队列
2. 权限管控：给业务账号仅分配对应vhost的读写权限，防止越权操作
3. 环境区分：开发/测试/生产创建独立vhost，不用部署多套RabbitMQ服务

### 3. 控制台操作
1. Admin → Virtual Hosts → Add a new virtual host，填写名称创建
2. 用户授权：选中用户 → Set permission，绑定指定vhost，配置配置/写/读权限
3. Java客户端连接时，配置参数指定对应vhost，否则默认连接`/`

## 08. Java客户端-快速入门（原生AMQP API）
### 1. 核心依赖
```xml
<!-- rabbit原生客户端 -->
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>amqp-client</artifactId>
    <version>5.16.0</version>
</dependency>
```
### 2. 核心对象说明
1. ConnectionFactory：连接工厂，封装IP、端口、账号、密码、虚拟主机配置
2. Connection：TCP物理连接，重量级对象，项目全局单例复用
3. Channel：通道，轻量级，基于Connection创建，绝大多数API操作都在Channel执行
    - 一条连接可创建上千个Channel，避免频繁创建销毁TCP连接开销
4. QueueDeclare：声明队列（不存在则创建，存在则校验属性）
5. BasicPublish：生产者发送消息
6. BasicConsume：消费者监听队列消息

### 3. 最简生产者代码流程
1. 初始化工厂，配置连接信息
2. 获取Connection连接
3. 打开Channel通道
4. 声明队列（保证队列一定存在）
5. channel.basicPublish发送消息
6. 关闭通道、连接

### 4. 最简消费者代码流程
1. 同样创建工厂、连接、通道、声明队列
2. 编写DefaultConsumer回调，重写deliverMessage方法接收消息
3. channel.basicConsume绑定队列，持续监听消息

## 09. Java客户端-work工作模型（点对点模式）
### 1. 模型结构
1个队列 + 多个消费者，多条消息均匀分发，实现**任务分发、负载均衡**
- 生产者发送多条消息存入同一队列
- 多个消费者监听同一个队列，RabbitMQ默认轮询分配消息

### 2. 默认轮询机制
RabbitMQ会提前把队列里消息均分，不管消费者处理快慢，一人一条。
缺陷：如果消费者A处理快、消费者B处理慢，会出现B大量消息堆积，A空闲。

### 3. 公平分发优化（能者多劳）
消费者开启预取限制：`channel.basicQos(1)`
含义：同一时刻，这个消费者最多只收到1条未确认消息，处理完ACK后才会分配下一条。
实现处理快的消费者自动多消费，慢的少拿，均衡处理压力。

### 4. 适用场景
文件解析、订单批量处理、后台异步任务分发。

## 10. Java客户端-Fanout广播交换机
### 1. Fanout特性：广播模式，无视路由键
1. 交换机收到消息后，**转发给所有绑定该交换机的队列**
2. RoutingKey参数直接忽略，写任意值都不影响
3. 一条消息，所有下游队列全部收到，一对多广播

### 2. 使用流程
1. 声明Fanout类型交换机
2. 声明多个队列，全部绑定到该交换机（无需routingKey）
3. 生产者发消息到交换机，所有绑定队列同步收到消息

### 3. 业务场景
1. 系统公告同步给所有服务
2. 缓存刷新：更新商品后，所有微服务本地缓存同时失效
3. 多渠道通知：下单成功，同时发送短信、站内信、APP推送

## 11. Java客户端-Direct直连交换机
### 1. Direct核心：精准匹配路由键
1. 队列绑定交换机时指定BindingKey
2. 生产者发消息携带RoutingKey
3. 只有BindingKey和RoutingKey**完全相等**的队列，才能收到消息

### 2. 两种用法
1. 一对一：一个队列绑定单个key，普通点对点消息
2. 多订阅：多个队列绑定同一个key，实现精准广播（指定分类推送）

### 3. 业务场景
日志分级推送：error日志只推送到告警队列，info推送到日志存储队列。

## 12. Java客户端-Topic主题交换机
### 1. Topic特性：模糊匹配路由键，支持通配符
路由键格式规范：使用`.`分割多层单词，例：`order.create.pay`
通配符规则：
- `*`：匹配**单个**单词
- `#`：匹配**0个或多个**单词

示例：
- 绑定key `order.*`：能匹配 `order.create`、`order.cancel`，不能匹配 `order.create.pay`
- 绑定key `order.#`：能匹配 `order`、`order.create`、`order.create.pay`

### 2. 和Direct/Fanout对比
- Fanout：全部接收，无匹配
- Direct：完全相等精准匹配
- Topic：模糊通配匹配，灵活性最高

### 3. 业务场景
商品消息分类：`goods.insert`、`goods.update`、`goods.delete`，不同服务订阅不同操作。

## 13 & 14. Java客户端-声明队列和交换机（持久化、参数详解）
### 1. 队列声明参数详解 `queueDeclare(String queue, boolean durable, boolean exclusive, boolean autoDelete, Map<String, Object> arguments)`
1. durable：队列是否持久化，true服务重启队列不丢失
2. exclusive：是否独占，true仅当前连接可用，连接断开队列自动删除（临时队列）
3. autoDelete：无消费者监听时，自动删除队列
4. arguments：额外配置（过期时间、死信交换机、Lazy队列等高级参数）

### 2. 交换机声明 `exchangeDeclare(String exchange, BuiltinExchangeType type, boolean durable)`
1. type：交换机类型 FANOUT/DIRECT/TOPIC
2. durable：交换机持久化，重启不丢失交换机定义

### 3. 绑定关系 `queueBind(String queue, String exchange, String routingKey)`
队列、交换机、路由键三者绑定，声明幂等（重复调用不会报错，仅校验属性）

## 15. Java客户端-消息转换器（SpringAMQP重点）
### 1. 原生客户端问题
原生API发送消息只能传byte[]字节数组，对象需要手动序列化、消费时手动反序列化，代码繁琐。

### 2. SpringAMQP消息转换器MessageConverter
默认使用`SimpleMessageConverter`，底层Jdk序列化，缺点：
- 序列化后字节体积大
- 必须实现Serializable接口
- 跨语言不兼容

### 3. 推荐替换Jackson2JsonMessageConverter
1. 导入jackson依赖
2. 注册转换器Bean
3. 发送时直接传POJO对象，框架自动序列化为JSON；消费自动JSON转实体
   优势：体积小、跨语言通用、可读性强，企业项目标准方案

## 16. 改造业务代码（SpringBoot整合SpringAMQP实战）
### 1. 引入依赖
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```
### 2. yml配置连接信息
```yaml
spring:
  rabbitmq:
    host: 127.0.0.1
    port: 5672
    username: admin
    password: 123456
    virtual-host: /order
```
### 3. 生产者发送消息
注入RabbitTemplate，直接调用convertAndSend(exchange, routingKey, 消息对象)，自动JSON序列化

### 4. 消费者监听消息
使用注解`@RabbitListener(queues = "队列名")`，方法参数直接接收实体类，框架自动反序列化

### 5. 业务改造案例
下单核心流程：创建订单、扣库存（主流程同步）；发送MQ消息，异步执行积分、短信通知，大幅缩短下单接口响应时间。

# 第三批次：MQ高级 01 ~ 09
## MQ高级-01.今日课程介绍
高级核心解决**消息可靠性**与**异常场景处理**，分为三大模块：
1. 生产者可靠性：保证消息能稳妥投递到MQ服务，不丢失、不重复发送
2. 服务端可靠性：队列、消息持久化，Lazy队列解决海量消息堆积内存溢出
3. 消费者可靠性：消费确认、失败重试、业务幂等，避免重复消费、消息丢失
4. 拓展能力：延迟消息（死信+插件两套实现），解决超时订单、定时任务需求

面试高频考点：消息丢失场景、消息重复解决方案、死信队列、延迟消息实现、Lazy队列作用。

## MQ高级-02.生产者可靠性-生产者重连
### 1. 重连出现的场景
生产者发送消息时，RabbitMQ服务宕机、网络断开、防火墙断连，当前Channel/Connection失效，直接发送会抛异常。

### 2. SpringAMQP自动重连机制
底层CachingConnectionFactory内置重试、重连逻辑：
1. 连接断开后，按照固定间隔自动重试建立TCP连接
2. 连接恢复后自动重建Channel，无需手动创建连接
3. 可配置重试间隔、最大重试次数，生产环境默认永久重试

### 3. 自定义重连参数（yml）
```yaml
spring:
  rabbitmq:
    connection-timeout: 1000
    cache:
      connection:
        size: 5 # 缓存连接数量
    template:
      retry:
        enabled: true # 开启发送失败重试
        initial-interval: 1000 # 初始重试间隔1s
        max-attempts: 3 # 最大重试3次
```
### 4. 业务注意
重连期间发送消息会阻塞/抛出异常，需要配合生产者确认机制，记录本地消息表兜底。

## MQ高级-03 & 04.生产者可靠性-生产者确认（Publisher Confirm）
### 一、两种确认模式
1. **简单模式（single）**：每发一条消息，等待一次ACK，吞吐量极低，仅测试使用
2. **批量模式（batch）**：批量发送一批消息，统一接收ACK，性能中等
3. **异步回调模式（async，生产推荐）**：发送消息不阻塞，注册回调函数，MQ返回ack/nack时异步通知，高并发首选

### 二、核心逻辑
生产者开启confirm机制后：
1. 消息成功抵达交换机 → 回调`confirmCallback`，ack=true
2. 消息无法抵达交换机（交换机不存在、网络故障）→ ack=false
3. 消息到交换机，但路由不到任何队列 → 触发`returnCallback`返回退回消息

### 三、完整保障方案（防止消息丢失）
1. 开启confirm异步回调
2. 开启消息退回return回调
3. 数据库记录本地消息表，发送前落库，收到ack后更新状态为已发送；收到nack定时重试投递

### 四、配置开启确认
```yaml
spring:
  rabbitmq:
    publisher-confirm-type: correlated # 异步回调模式
    publisher-returns: true # 开启消息退回
```

## MQ高级-05.MQ的可靠性-数据持久化
消息丢失的第一大根源：RabbitMQ重启后内存数据清空，持久化分两层保障：
### 1. 交换机持久化
声明交换机时设置`durable=true`，重启后交换机定义不消失；
若不持久化，服务重启交换机直接删除，消息无法路由。

### 2. 队列持久化
队列声明`durable=true`，重启后队列元数据保留；不持久化重启队列直接清空。

### 3. 消息持久化（MessageDeliveryMode.PERSISTENT）
发送消息时设置持久化，消息写入磁盘；不设置仅存在内存，重启全部丢失。
SpringAMQP默认发送消息即为持久化，无需手动配置。

### 4. 三层缺一不可
交换机+队列+消息全部持久化，才能保证重启消息不丢失；任意一层非持久化都会丢数据。

## MQ高级-06.MQ的可靠性-LazyQueue（惰性队列）
### 1. 普通队列缺陷
消息全部优先存入内存，海量消息堆积（百万/千万条）会占满RabbitMQ内存，触发流控阻塞生产者，严重直接OOM宕机。

### 2. LazyQueue惰性队列机制
创建队列时配置参数`x-queue-mode=lazy`：
1. 消息接收后**直接写入磁盘**，仅少量热消息缓存内存
2. 消费者拉取消息时，才从磁盘加载到内存处理
3. 大幅降低内存占用，支持海量消息堆积

### 3. 适用场景
秒杀、大促、流量洪峰，会产生大量消息堆积的业务队列，生产环境订单队列强制开启。

### 4. SpringAMQP代码配置
声明队列时传入arguments参数：
```java
Map<String,Object> args = new HashMap<>();
args.put("x-queue-mode","lazy");
Queue queue = QueueBuilder.durable("order.queue").withArguments(args).build();
```

## MQ高级-07.消费者可靠性-消费者确认ACK
### 1. 三种ACK模式
1. **自动ACK（AUTO）**：SpringAMQP默认模式，消息交付消费者后立即告知MQ删除消息
   缺陷：业务代码执行中途宕机，消息未处理完成，但MQ已删除 → 消息丢失
2. **手动ACK（MANUAL，生产必用）**：开发者代码手动通知MQ是否消费成功
   - `channel.basicAck()`：正常消费，MQ删除消息
   - `channel.basicNack()`：消费失败，参数控制是否重回队列
3. **NONE**：完全不确认，MQ立刻删除消息，几乎不用

### 2. 手动ACK流程
1. 监听接收消息
2. 执行业务逻辑
3. 无异常调用ack，MQ删除消息
4. 出现异常调用nack，消息重回队列重新消费

### 3. 开启手动ACK配置
```yaml
spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: manual
```

## MQ高级-08.消费者可靠性-失败重试机制
### 1. 本地重试（Spring内部重试）
消费异常时，本地循环重试，不返还队列消息；配置重试次数，耗尽后抛出异常。
```yaml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true
          max-attempts: 3 # 本地最多重试3次
```
优点：速度快，不重复投递；缺点：本地重试耗尽后消息直接丢失。

### 2. 消息重回队列重试
本地重试失败后调用`basicNack(true)`，消息返回队列尾部，重新分发；
风险：无限循环重试（代码永久报错，消息死循环占用服务）。

### 3. 最优方案：本地重试耗尽 → 转发死信队列
1. 本地重试3次失败
2. nack不重回原队列，消息转入DLX死信交换机、死信队列
3. 单独监听死信队列，人工排查异常数据，避免死循环阻塞正常业务

## MQ高级-09.消费者可靠性-业务幂等性
### 1. 为什么会重复消费
生产者confirm超时重发、网络延迟、消费者处理完ACK前宕机，都会导致同一条消息多次投递。
如果接口不幂等，重复消费会产生脏数据（重复加积分、重复创建订单）。

### 2. 四大幂等实现方案
1. **唯一消息ID（推荐）**
   生产者每条消息携带全局唯一msgId，消费前查询数据库是否已处理该msgId；存在直接跳过，不存在执行业务并插入记录。
2. **业务唯一键约束**
   订单消息携带orderId，数据库order表给orderId加唯一索引，重复插入直接报错，捕获异常忽略。
3. **状态机判断**
   订单消息先判断订单状态，已完成则不再处理。
4. **分布式锁**
   消费前抢占msgId分布式锁，同一消息同时只能被一个消费者处理。

### 3. 生产标准组合
消息唯一ID + 本地消息记录表，彻底杜绝重复消费带来的数据问题。

# 第四批次：MQ高级 10 ~ 15 延迟消息完整模块
## MQ高级-10.延迟消息-什么是延迟消息
### 1. 定义
消息发送到MQ后，**不会立刻被消费者消费**，等待指定时长到达后，才会投递到目标队列供业务处理，这类消息称为延迟消息。
### 2. 典型业务场景
1. 电商下单30分钟未支付，自动取消订单、释放库存
2. 退款申请7天后未处理，自动提醒运营人员
3. 用户注册后24小时发送回访短信
4. 定时活动预热，提前一段时间推送通知

### 3. RabbitMQ原生两种实现方案
方案一：死信队列DLX（无需插件，所有RabbitMQ版本通用）
方案二：延迟消息插件delayed-message-exchange（更简洁，需额外安装插件）

## MQ高级-11.延迟消息-死信交换机DLX实现方案
### 一、基础概念：什么是死信
一条消息满足以下任意一种情况，会变成死信：
1. 消息过期：队列设置了`x-message-ttl`过期时间，超时未消费
2. 消费拒绝：手动nack，且设置不重回原队列
3. 队列满了：队列设置`x-max-length`，消息超出上限溢出

死信不会直接丢弃，会转发到预先绑定的**死信交换机DLX**，再路由到死信队列。

### 二、利用死信实现延迟消息完整流程
1. 创建**延迟缓冲队列**（无消费者监听），配置两个参数：
   - `x-message-ttl`：消息存活时长（延迟时间，单位毫秒）
   - `x-dead-letter-exchange`：绑定死信交换机DLX名称
   - `x-dead-letter-routing-key`：死信转发的路由键
2. 创建死信交换机DLX（普通Direct交换机即可）
3. 创建**业务目标队列**，绑定DLX交换机、对应路由键
4. 生产者发送消息到缓冲队列
5. 消息在缓冲队列等待TTL时长，超时自动变成死信
6. 死信转发至DLX交换机，路由到业务目标队列
7. 消费者监听业务队列，到期后收到消息执行业务

### 三、优缺点
优点：无需安装任何插件，兼容所有RabbitMQ环境，无环境改造成本
缺点：
1. 一个缓冲队列只能固定一种延迟时长，多种延迟时间要创建大量缓冲队列（5分钟、30分钟、1小时分别建队列）
2. 消息先进先出，队列前一条消息未到期，后面消息即使时间到也无法投递，存在时间误差

## MQ高级-12.延迟消息-延迟消息插件实现
### 1. 插件说明
插件名称：`rabbitmq-delayed-message-exchange`，不属于RabbitMQ内置功能，需要手动下载、上传到插件目录、启用。
核心能力：自定义一种**延迟交换机**，发送消息时单独设置本条消息的延迟时间，不用提前定义TTL队列。

### 2. 整体流程
1. 安装并启用延迟插件，重启RabbitMQ服务
2. 声明延迟类型交换机：
   - 基础类型仍为Direct/Fanout/Topic，额外参数`x-delayed-type`指定基础类型
   - 交换机参数增加`x-delayed-message`标识为延迟交换机
3. 生产者发送消息时，在消息头设置`x-delay`（单位毫秒，自定义延迟时长）
4. 消息存入交换机内部延迟存储，不会进入队列
5. 到达设定延迟时间，交换机自动将消息路由到绑定队列，消费者直接消费

### 3. 优缺点
优点：
1. 一条消息自定义任意延迟时长，同一个交换机支持5分钟、30分钟、2小时等不同延时，不用新建大量缓冲队列
2. 无FIFO阻塞问题，每条消息独立计时，精准度高于死信方案
   缺点：
1. 生产集群环境下，插件同步有兼容性问题
2. 服务重启后，未到期的延迟消息默认丢失（需要额外持久化配置）
3. 必须运维介入安装插件，部分公司生产环境不允许私自安装第三方插件

## MQ高级-13.延迟消息-取消超时订单业务落地（DLX死信方案实操）
### 业务需求
用户创建订单，30分钟未支付则自动关闭订单、恢复商品库存。
### 步骤拆解
1. 定义缓冲队列 `order.delay.30min`
   - TTL = 30 * 60 * 1000
   - 绑定死信交换机 `dlx.order.exchange`，转发路由键 `order.pay.timeout`
2. 死信交换机绑定业务队列 `order.timeout.queue`，routingKey匹配`order.pay.timeout`
3. 用户下单成功后，生产者发送订单ID消息到缓冲队列
4. 30分钟未支付，消息超时进入死信，投递到`order.timeout.queue`
5. 消费者监听超时队列，执行逻辑：
   1. 根据orderId查询订单状态
   2. 若订单状态为「待支付」：修改订单为已取消，释放库存
   3. 若订单已支付：直接丢弃消息（幂等判断，避免重复处理）

### 边界问题处理
用户中途完成支付，需要**删除缓冲队列里的延迟消息**？
答：原生RabbitMQ不支持删除指定消息，无法主动取消；解决方案：
消费超时消息时先判断订单真实状态，已支付直接跳过业务，不做处理。

## MQ高级-14.延迟消息-发送延迟检测订单（插件方案实操）
同样30分钟超时取消订单，改用延迟插件实现：
1. 声明延迟交换机 `delay.order.exchange`，基础类型Direct，参数`x-delayed-type=direct`
2. 绑定业务队列 `order.timeout.queue`，路由键`order.pay`
3. 下单发送消息时，设置消息头 `x-delay=1800000`（30分钟）
4. 消息存入延迟交换机计时，到期自动路由到业务队列
5. 消费者统一处理超时逻辑，无需创建多个TTL缓冲队列

### 多延迟场景优势
如需新增1小时、2小时超时订单，无需新建队列，发送消息时修改x-delay数值即可，代码扩展性更强。

## MQ高级-15.延迟消息-监听延迟消息（完整消费代码规范）
### 1. 通用消费规范（两种延迟方案通用）
1. 开启手动ACK模式，业务执行成功再ack，异常nack转入死信兜底
2. 消费第一步做幂等校验：根据订单ID查询订单状态
3. 捕获全部业务异常，防止消费死循环阻塞队列
4. 本地重试耗尽后，将异常消息转发至全局死信队列人工排查

### 2. SpringAMQP监听代码模板
```java
@RabbitListener(queues = "order.timeout.queue")
public void listenOrderTimeout(Message message, Channel channel) throws IOException {
    // 1. 获取消息体、消息唯一ID
    String orderId = new String(message.getBody());
    long deliveryTag = message.getMessageProperties().getDeliveryTag();
    try {
        // 2. 幂等判断：查询订单
        Order order = orderMapper.selectById(orderId);
        if(order == null || !"待支付".equals(order.getStatus())){
            // 订单不存在/已支付，直接确认丢弃
            channel.basicAck(deliveryTag, false);
            return;
        }
        // 3. 执行超时取消订单、释放库存逻辑
        closeOrderAndReleaseStock(orderId);
        // 4. 正常确认，删除消息
        channel.basicAck(deliveryTag, false);
    } catch (Exception e) {
        // 5. 异常：拒绝消息，不重回原队列，进入全局死信
        channel.basicNack(deliveryTag, false, false);
    }
}
```
### 3. 生产落地选择建议
- 中小公司、环境不允许装插件：选用DLX死信方案
- 业务延迟时长种类多、运维支持插件安装：选用延迟交换机插件方案

