---
title: Redis 限流 Starter
description: Redis Lua 固定窗口限流组件的自动配置、AOP 调用链、SpEL 维度与实现边界。
---

# Redis 限流 Starter

项目将 Redis + Lua 限流封装为 Spring Boot Starter。业务方法声明限流注解，切面计算限流键并执行脚本，再决定执行原方法还是抛出限流异常。

[项目仓库](https://github.com/sheeta2005/rate-limiter-starter)

## 项目概览

| 维度 | 当前实现 |
| --- | --- |
| 构建基线 | Java 21、Spring Boot 3.2.8 |
| 模块划分 | parent、autoconfigure、starter |
| 算法 | 固定窗口计数 |
| 入口 | 方法上的限流注解与 AOP 切面 |
| 限流维度 | SpEL 方法参数、组合值；未指定时回退为类名与方法名 |
| 执行 | Redis Lua 脚本，原子执行计数判断与过期设置 |

## 核心调用链

1. Spring Boot 根据 `AutoConfiguration.imports` 加载组件配置。
2. 配置类创建 Redis 脚本对象，注入 RedisTemplate 与全局配置属性，注册限流切面。
3. 切面读取注解，用 SpEL 从方法参数计算业务键。
4. 根据应用当前时间计算窗口起点，构造包含业务键和窗口时间戳的 Redis Key。
5. Lua 检查计数，允许请求时递增；首次请求设置过期时间。
6. 返回允许时执行原方法，超限时抛出异常，由接入应用映射响应。

这条链路将业务方法、限流维度和计数操作分开，是理解自动配置与横切逻辑的具体实践。

## 为什么用 Lua

若应用分别执行查询计数、比较阈值和递增，多个并发请求可能同时读到未超限的值。Lua 在 Redis 内完成相关操作，避免这几个命令之间被其他请求穿插。

当前脚本只递增被允许的请求，超限请求返回拦截结果。首次计数设置为 1，TTL 为窗口时长加 1 秒；窗口时间戳用于分隔不同窗口的键。

## 固定窗口的取舍

固定窗口实现简单，每个窗口独立计数，但窗口交界处可能集中通过接近两倍阈值的请求。它限制的是各固定窗口内的计数，不保证任意连续时间段内都平滑。

窗口起点使用应用服务器时间计算，多实例时需要考虑时钟偏差。自定义 SpEL 键也要包含业务命名空间，避免不同接口仅使用同一个用户 ID 时共享配额。

## 当前实现需要明确的地方

| 问题 | 截至 2026 年 10 月 5 日的行为 |
| --- | --- |
| 配置优先级 | 切面在注解值大于 0 时直接使用注解值；注解默认值为 100 / 60，因此省略属性也会遮住全局阈值与窗口。README 中的三级优先级需要修正或补充实现。 |
| Redis 故障 | 脚本执行异常会降级放行，保护可用性，但此时不再保证限流约束。登录、验证码等安全场景需要重新评估。 |
| SpEL 失败 | 表达式失败或返回 null 时回退为类名与方法名，限流维度可能从按用户变为整个方法共享。 |
| 脚本加载 | 配置类构造 classpath 脚本对象，没有显式执行 Redis SCRIPT LOAD，不能将其介绍成已预热所有 Redis 节点的脚本缓存。 |
| 参数校验 | 阈值与窗口应为有效正数，当前需补充边界校验与验证材料。 |
| 容量 | 仓库 README 有 JMeter 场景建议，目前没有足够的实测记录支撑“万级并发”容量结论。 |

以上是当前版本的实现检查，后续修正应补充对应测试并记录版本。

## 与 takeMe 的关系

takeMe 当前在自己的 `redis-starter` 模块中使用独立的限流注解和切面，尚未接入这个 Starter。两个项目都涉及 Redis Lua 限流，但不能将 takeMe 的压测结果算作此组件的独立性能证明。

## 后续验证重点

- 同一键在一个窗口内的通过数与超限行为。
- 不同用户、不同接口及窗口交界的配额隔离。
- 注解与全局配置的实际合并行为。
- SpEL 参数发现、表达式异常、Redis 故障与恢复。
- 以独立测试记录衡量组件带来的耗时，而非直接套用业务系统吞吐。

这些是待补验证项，不表示已经通过测试。

## 源码阅读入口

模块根目录：`rate-limiter-parent/rate-limiter-spring-boot-autoconfigure`。

| 职责 | 模块内路径 |
| --- | --- |
| 注解 | `src/main/java/com/limiter/annotation/RateLimiter.java` |
| 切面与键生成 | `src/main/java/com/limiter/aspect/RateLimiterAspect.java` |
| 自动配置 | `src/main/java/com/limiter/config/RateLimiterAutoConfiguration.java` |
| 配置属性 | `src/main/java/com/limiter/properties/RateLimiterProperties.java` |
| Lua 计数 | `src/main/resources/lua/limit.lua` |
