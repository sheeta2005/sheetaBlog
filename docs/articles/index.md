---
title: 精选工程复盘
description: takeMe 与 Redis 限流 Starter 的订单并发、缓存、认证、消息、双窗口算法和自动化验证记录。
---

# 精选工程复盘

这里收录 takeMe 与 Redis 限流 Starter 的实践记录。围绕订单、缓存、消息、认证和组件接入，展开问题、实现过程与验证边界。

## 订单流程与业务正确性

<!-- 整行文章入口统一展示标题与摘要，键盘聚焦时也能清楚识别目标。 -->
<div class="article-reading-list">
  <a href="./order-concurrency.html"><span class="article-list-title">从重复下单到并发接单：订单约束怎么落到数据库</span><span class="article-list-description">requestId 幂等、当前读、条件更新，以及志愿者、父订单与服务项的统一加锁顺序。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./order-timeout.html"><span class="article-list-title">预约超时为什么要重新读取订单状态</span><span class="article-list-description">扫描候选后进入独立事务，区分整单与单项取消，避免超时任务覆盖已经开始的服务。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./outbox.html"><span class="article-list-title">订单通知为什么使用 Outbox</span><span class="article-list-description">事务提交、发送确认、重试和消费去重之间的边界。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
</div>

## 缓存、查询与性能排查

<div class="article-reading-list">
  <a href="./redis-cache.html"><span class="article-list-title">服务目录缓存：把空值、失效和并发回源一起考虑</span><span class="article-list-description">从目录与看板查询出发，展开空值哨兵、TTL 抖动、提交后失效与单 JVM 热点回源合并。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./loadtest.html"><span class="article-list-title">一次突发压测失败后的排查</span><span class="article-list-description">建立负载模型，结合延迟、错误、GC、数据库与消息积压识别问题。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./sql-optimization.html"><span class="article-list-title">从 N+1 查询到批量装配</span><span class="article-list-description">查询次数、索引、聚合与并发冷回源的优化和短测复盘。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
</div>

## 认证与头像存储

<div class="article-reading-list">
  <a href="./login-security.html"><span class="article-list-title">JWT 之外：角色校验、数据归属与登录限频</span><span class="article-list-description">实时账号状态、资源归属，以及账号优先、IP 辅助的 Redis Lua 登录限流。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./avatar-storage.html"><span class="article-list-title">头像上传不只涉及 OSS：文件校验与字段更新</span><span class="article-list-description">扩展名、大小、UUID 对象名与头像字段更新，避免覆盖并发资料变更。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
</div>

## 限流组件的设计与验证

<div class="article-reading-list">
  <a href="./rate-limiter-windows.html"><span class="article-list-title">Redis 双窗口限流：固定窗口与滑动窗口的取舍</span><span class="article-list-description">HASH 与 ZSET、Redis 服务端时间、Lua 原子判断，以及窗口边界和键隔离。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./rate-limiter-integration.html"><span class="article-list-title">一个限流注解如何接入 Spring Boot</span><span class="article-list-description">条件自动装配、Spring 代理、三级配置继承和 SpEL 参数解析。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./rate-limiter-failure.html"><span class="article-list-title">Redis 不可用时，限流应该放行还是拒绝</span><span class="article-list-description">pass 与 deny 的取舍，区分 Redis 异常、业务异常及 Lua 资源加载。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./rate-limiter-testing.html"><span class="article-list-title">用真实 Redis 验证限流：从阈值到故障策略</span><span class="article-list-description">JUnit 5 与 Testcontainers 的分层覆盖，区分历史测试记录、当前报告与容量结论。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
</div>

## 从哪里开始读

- **理解业务系统**：[项目概览](/projects/takeme) → [订单并发](./order-concurrency) → [超时处理](./order-timeout) → [通知可靠性](./outbox)。
- **理解性能改进**：[压测排查](./loadtest) → [查询优化](./sql-optimization) → [缓存设计](./redis-cache)。
- **理解通用组件**：[限流项目](/projects/rate-limiter) → [双窗口算法](./rate-limiter-windows) → [接入链路](./rate-limiter-integration) → [故障策略](./rate-limiter-failure) → [测试设计](./rate-limiter-testing)。

## 阅读约定

文章依据简历项目经历、本地源码和既有文档整理。新增专题于 2026 年 10 月 11 日核对实现，性能复盘保留原测试时间与环境；单次诊断、短测、持续测试和历史验收结果分别说明。

本次博客整理没有重新执行后端压测或 Redis 容器测试，文章中的功能设计与测试成绩按各自材料说明。

更多基础知识和练习见 [学习笔记](/notes/)，项目全貌见 [项目实践](/projects/)。
