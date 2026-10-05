---
title: 项目实践
description: takeMe 社区助老平台与 Redis 限流 Starter 的实现、技术取舍和验证记录。
---

# 项目实践

两个项目分别聚焦业务系统与通用组件。这里先介绍它们解决的问题，再展开实现、验证和限制。

## 项目一：takeMe 社区助老平台

面向老人、志愿者和管理员，提供助餐、助洁、助医、代购等服务的预约、接单与管理流程。后端采用 Java 21、Spring Boot、MyBatis-Plus、MySQL、Redis 和 RabbitMQ，当前按单小区、单 JVM、单数据库设计。

重点阅读：幂等建单与状态约束、Outbox 通知、分页查询优化、缓存与压测复盘。

**[阅读项目介绍](./takeme)** · [查看仓库](https://github.com/sheeta2005/takeMe)

## 项目二：Redis 限流 Starter

基于 Redis + Lua 的固定窗口限流组件，通过方法注解和 AOP 拦截请求，用 SpEL 生成限流维度，并通过 Spring Boot 自动配置接入应用。

重点阅读：组件职责划分、限流调用链、窗口边界、故障策略与配置行为。

**[阅读项目介绍](./rate-limiter)** · [查看仓库](https://github.com/sheeta2005/rate-limiter-starter)

## 工程复盘

- [突发压测失败后的排查](/articles/loadtest)
- [N+1 查询与缓存优化](/articles/sql-optimization)
- [Outbox 通知与消费去重](/articles/outbox)

页面依据截至 2026 年 10 月 5 日的本地代码和项目文档整理。公开仓库若尚未同步，请以对应文件和版本核对；测试指标仅代表记录中的环境与负载。
