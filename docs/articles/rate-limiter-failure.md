---
project: rate-limiter
order: 30
title: Redis 不可用时，限流应该放行还是拒绝
description: 限流 Starter 的 pass 与 deny 策略、Redis 异常和业务异常的边界，以及 Lua 初始化与 EVALSHA 回退。
date: 2026-10-11
---

# Redis 不可用时，限流应该放行还是拒绝

限流依赖 Redis 判断剩余配额。当 Redis 连接失败时，应用既不能继续获得可靠的计数，也不一定适合把所有业务请求都拒绝。

我的 Starter 提供 `pass` 与 `deny` 两种策略。选择依据是具体业务对可用性和保护强度的要求，而不是把一种策略描述为所有场景的标准答案。

## 两种策略承担不同风险

| 策略 | Redis 访问或脚本执行异常时 | 需要承担的结果 |
| --- | --- | --- |
| pass | 记录异常并允许调用业务 | 此时无法保证限流约束，下游承受请求 |
| deny | 返回拒绝结果，抛出限流异常 | Redis 故障会影响正常业务访问 |

当前默认值为 pass。对非关键查询，可用性可能更重要；对验证码、昂贵计算或下游保护，应重新评估失去限流后的风险。策略需要由接入系统结合实际容量决定。

## 捕获范围限制在 Redis 执行

切面先执行脚本，再根据结果决定是否调用业务方法。连接异常、脚本执行异常和非法脚本结果在限流执行范围内处理；正常业务方法的执行发生在这一范围之外。

因此，业务方法自己抛出的异常正常向上传播，不因为 pass 策略就被吞掉或重新执行。若把整个切面都包进宽泛的异常处理，可能混淆“Redis 坏了”和“业务执行失败”，甚至意外重复触发业务。

正常超限仍然拒绝请求。pass 处理的是依赖发生异常时的选择，不意味着阈值已经达到时也继续放行。

## 拒绝结果不直接绑定 HTTP

超限或 deny 策略下的依赖异常会抛出 `RateLimitException`。Starter 保持方法级组件职责，不直接写 Web 响应。

接入应用可以在统一异常处理层映射 HTTP 429 和提示内容。这个映射需要由业务方完成，不能把组件抛出异常直接等同于任何接入系统都会返回 429。

## Lua 初始化与 Redis 缓存分开理解

启动时，自动配置读取两份 Lua 资源，保存脚本文本并计算 SHA1。资源缺失或读取失败会使组件初始化失败，避免运行后才发现缺少限流脚本。

这一步是本地资源加载，不能表述为已在所有 Redis 节点执行 SCRIPT LOAD。实际调用由 Spring Data Redis 优先尝试 EVALSHA，服务端脚本缓存未命中时回退到 EVAL。

服务端缓存丢失不等于本地 Lua 文件缺失。前者有执行回退路径；后者在启动阶段就没有可执行的脚本文本，属于部署问题。

## 故障恢复不能只用 Mock 说明

Mock Redis 抛异常能够验证切面分支，但不能完整覆盖客户端连接断开后的行为。项目另有真实 Redis 容器测试：先完成一次正常调用，再停止容器，分别检查 pass 是否继续执行业务、deny 是否抛出异常。

业务异常传播和脚本资源缺失则用对应测试单独验证。环境未满足导致容器无法启动，与组件逻辑断言失败是不同原因，两者都需要在测试报告中保留。

本次文章编写核对了源码和既有报告，没有重新启动 Redis 容器。当前本地留存报告中有 Docker 环境初始化错误，不能据此宣称真实故障用例在本轮已经通过。

## 源码与后续阅读

在 [限流 Starter 仓库](https://github.com/sheeta2005/rate-limiter-starter) 核对：

- `RateLimiterAspect.java` 中的脚本执行与业务调用范围
- `RateLimiterAutoConfiguration.java` 中的 Lua 资源加载
- `RateLimiterRedisFailureTest.java` 与 `RateLimiterAutoConfigurationTest.java`

上述文件位于 `rate-limiter-parent/rate-limiter-spring-boot-autoconfigure` 模块。

[阅读测试设计与结果口径](./rate-limiter-testing) · [阅读声明式接入](./rate-limiter-integration) · [返回项目介绍](/projects/rate-limiter)
