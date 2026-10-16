---
title: Redis 限流 Starter
description: Redis Lua 双窗口限流组件的条件自动配置、三级规则合并、SpEL 维度、故障策略与真实 Redis 测试设计。
---

# Redis 限流 Starter

项目将 Redis + Lua 限流封装为 Spring Boot Starter，支持 HASH 固定窗口与 ZSET 滑动窗口。业务方法声明限流注解，切面合并规则、生成业务键并执行脚本，再决定执行原方法还是抛出限流异常。

[项目仓库](https://github.com/sheeta2005/rate-limiter-starter)

## 项目概览

| 维度 | 当前实现 |
| --- | --- |
| 构建基线 | Java 21、Spring Boot 3.2.5 |
| 模块划分 | parent、autoconfigure、starter |
| 算法 | HASH 固定窗口、ZSET 滑动窗口 |
| 入口 | 方法上的限流注解与 AOP 切面 |
| 限流维度 | SpEL 方法参数、组合值；未指定时回退为类名与方法名 |
| 时间基准 | Redis 服务端时间 |
| 执行 | Redis Lua 脚本，原子执行清理、计数与阈值判断 |
| 配置 | 注解显式规则、全局配置、内置默认值三级继承 |
| 故障策略 | Redis 操作异常时可选 pass 放行或 deny 拒绝 |
| 功能验证 | JUnit 5、Testcontainers、单节点 Redis 7.4.9 |

## 核心调用链

1. Spring Boot 根据 `AutoConfiguration.imports` 加载组件配置。
2. 满足 Redis 模板、启用开关等条件时，配置类读取两份 Lua，绑定全局规则并创建切面。
3. 切面按注解显式配置、全局配置、内置默认值合并规则，用 SpEL 从方法参数计算业务键。
4. 构造包含业务前缀、算法、窗口秒数与业务键的 Redis Key。
5. Lua 使用 Redis 时间，执行对应窗口的清理、计数和阈值判断。
6. 返回允许时执行原方法，超限时抛出异常，由接入应用映射响应。

这条链路将业务方法、限流维度和计数操作分开，是理解自动配置与横切逻辑的具体实践。

**[展开阅读：一个限流注解如何接入 Spring Boot](/articles/rate-limiter-integration)**

## 为什么用 Lua

若应用分别执行查询计数、比较阈值和递增，多个并发请求可能同时读到未超限的值。Lua 在 Redis 内完成相关操作，避免这几个命令之间被其他请求穿插。

固定窗口在 HASH 中保存窗口编号与计数，拒绝请求也计入计数；滑动窗口在 ZSET 中保存通过请求，拒绝时不新增成员。两种实现的统计口径不同，不能把固定窗口计数直接当作业务成功次数。

## 双窗口算法的取舍

固定窗口实现简单，每个窗口独立计数，但窗口交界处可能集中通过接近两倍阈值的请求。它限制的是各固定窗口内的计数，不保证任意连续时间段内都平滑。

滑动窗口清除连续窗口之外的记录，达到阈值就拒绝，未超限时写入带 UUID 的成员。它限制连续窗口通过次数，但状态量与通过请求数相关，清理也有开销。

两种算法均使用 Redis TIME，避免由不同应用实例的本地时间分别划窗。Key 按算法和窗口区分，同一规则的业务键共享额度；不希望共享的接口需要独立命名空间。

**[展开阅读：固定窗口与滑动窗口的取舍](/articles/rate-limiter-windows)**

## 接入与故障处理

| 关注点 | 当前实现与边界 |
| --- | --- |
| 配置继承 | 注解阈值与窗口默认 -1，算法默认 DEFAULT，未显式指定时继承全局配置。 |
| 条件装配 | 关闭组件、缺少 Redis 模板等条件下退出；自定义切面存在时默认配置退出。启停属于启动配置。 |
| Redis 故障 | 可选 pass 或 deny；正常超限仍拒绝，业务方法自身异常正常传播。 |
| SpEL 失败 | 回退为类全限定名与方法名，原先用户维度可能合并为方法维度，默认键不区分同名重载。 |
| 脚本加载 | 初始化读取本地资源并计算 SHA1，资源缺失导致启动失败；执行由 Spring Data Redis 优先 EVALSHA，未命中回退 EVAL。 |
| 配置校验 | 全局阈值和窗口须为正数，算法、前缀和故障策略须有效；配置错误不作为网络故障降级。 |
| 代理边界 | 注解需经过 Spring AOP 代理，自调用和手工创建对象等情况不能仅凭注解保证生效。 |

本地 Lua 初始化不等于已将脚本预热到所有 Redis 节点。组件抛出限流异常后，HTTP 429 等响应由接入应用的异常处理决定。

**[展开阅读：Redis 不可用时放行还是拒绝](/articles/rate-limiter-failure)**

## 与 takeMe 的关系

takeMe 当前在自己的 `redis-starter` 模块中使用独立的限流注解和切面，尚未接入这个 Starter。两个项目都涉及 Redis Lua 限流，但不能将 takeMe 的压测结果算作此组件的独立性能证明。

## 功能验证与结果口径

当前用例覆盖同键阈值拦截、窗口恢复、用户与算法隔离、SpEL 参数和对象属性、条件装配及配置校验。真实故障用例先连接 Redis 容器，再停止容器观察两种策略。

**[展开阅读：真实 Redis 测试设计与结果口径](/articles/rate-limiter-testing)**


## 源码阅读入口

模块根目录：`rate-limiter-parent/rate-limiter-spring-boot-autoconfigure`。

| 职责 | 模块内路径 |
| --- | --- |
| 注解 | `src/main/java/com/limiter/annotation/RateLimiter.java` |
| 切面与键生成 | `src/main/java/com/limiter/aspect/RateLimiterAspect.java` |
| 自动配置 | `src/main/java/com/limiter/config/RateLimiterAutoConfiguration.java` |
| 配置属性 | `src/main/java/com/limiter/properties/RateLimiterProperties.java` |
| 固定窗口 | `src/main/resources/lua/fixed_window.lua` |
| 滑动窗口 | `src/main/resources/lua/sliding_window.lua` |
| 功能与故障测试 | `src/test/java/com/limiter/` |

