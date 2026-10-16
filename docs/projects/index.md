---
title: 项目实践
description: takeMe 社区助老平台与 Redis 双窗口限流 Starter 的业务流程、实现专题和验证记录。
---

# 项目实践

两个独立已完成项目分别聚焦业务系统与通用组件。这里先介绍它们解决的问题，再展开实现、验证和限制。

## 项目一：takeMe 社区助老平台

面向老人、志愿者和管理员，提供助餐、助洁、助医、代购等服务的预约、接单与管理流程。后端采用 Java 21、Spring Boot、MyBatis-Plus、MySQL、Redis 和 RabbitMQ，当前按单小区、单 JVM、单数据库设计。

实践主题包括订单并发、预约超时、通知可靠性、认证与头像管理，以及缓存和查询优化。

**[阅读项目介绍](./takeme)** · [查看仓库](https://github.com/sheeta2005/takeMe)

### 业务流程与访问边界

- [订单幂等与并发接单](/articles/order-concurrency)：从重复下单到竞争操作，将约束落实到事务、行锁和条件更新。
- [预约超时处理](/articles/order-timeout)：按预约时间复核整单与服务项，避免影响其他仍有效的服务。
- [Outbox 通知](/articles/outbox)：业务事务保留待发送事件，在线提醒与持久化消息各司其职。
- [认证与登录限频](/articles/login-security) · [OSS 头像存储](/articles/avatar-storage)：身份、账号状态、资源归属和字段更新。

### 查询与性能改进

- [服务目录缓存](/articles/redis-cache)：空值、TTL 抖动、主动失效与热点回源合并。
- [N+1 查询优化](/articles/sql-optimization)：每页 10 条时业务查询由 12 / 22 次减为 3 / 4 次，展开诊断口径与验证边界。
- [突发压测复盘](/articles/loadtest)：从实际失败结果出发，分析资源、延迟与通知积压。

## 项目二：Redis 限流 Starter

基于 Redis + Lua 的方法级限流组件，支持 HASH 固定窗口与 ZSET 滑动窗口。通过注解、AOP、SpEL 和条件自动配置接入 Spring Boot，多个实例可以按相同业务键共享额度。

技术栈为 Java 21、Spring Boot 3、Spring AOP、Redis 与 Lua；功能用例使用 JUnit 5 和 Testcontainers。

**[阅读项目介绍](./rate-limiter)** · [查看仓库](https://github.com/sheeta2005/rate-limiter-starter)

### 从规则到验证

- [双窗口算法](/articles/rate-limiter-windows)：Redis 时间、Lua 原子判断、边界突刺与状态量的取舍。
- [声明式接入](/articles/rate-limiter-integration)：三级配置继承、SpEL 业务维度与 Spring 代理。
- [故障处理](/articles/rate-limiter-failure)：放行或拒绝、业务异常传播及 EVALSHA 缓存回退。
- [真实 Redis 测试](/articles/rate-limiter-testing)：窗口恢复、用户隔离、配置装配和停止容器后的故障策略。

## 材料与验证

项目介绍及新增专题结合简历与 2026 年 10 月 11 日核对的本地代码整理。已有性能数据保留原测量环境与时间，限流测试的历史记录和当前报告在对应文章中分别说明。

[浏览全部工程文章](/articles/) · [进入后端专栏](/posts/backend/)
