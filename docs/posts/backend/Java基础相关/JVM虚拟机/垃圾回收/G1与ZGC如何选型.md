---
title: G1与ZGC如何选型
date: 2026-10-03
tags: [JVM, G1, ZGC, JDK21, 低延迟]
categories: [JVM垃圾回收]
description: 基于延迟、吞吐、CPU 与堆余量选择 G1 或分代 ZGC，明确 JDK 版本差异
layout: doc
outline: deep
---

# G1 与 ZGC 如何选型

## 一、先明确版本和目标

本文以 **JDK 21 HotSpot** 为基线。该版本可启用分代 ZGC，不能把后续版本的默认行为反套回来，也不能默认所有 JDK 发行版在所有平台上支持同样的收集器。

选择应围绕业务延迟预算、吞吐、CPU 和内存资源展开，而不是只按“堆超过某个数就必须换 ZGC”。

## 二、机制与取舍

| 维度 | G1 | 分代 ZGC |
| --- | --- | --- |
| 回收组织 | Region，年轻代及 Mixed 回收 | 区分年轻与老年代，更多工作并发执行 |
| 主要倾向 | 兼顾吞吐与暂停控制 | 降低 GC 暂停对延迟的影响 |
| 暂停来源 | 疏散复制等阶段仍会 STW | 仍存在短暂停顿，不能说零 STW |
| 资源考量 | 暂停目标过紧可损失吞吐 | 并发回收需要 CPU 和分配余量 |

两者都有并发与暂停部分。ZGC 不意味着业务请求绝不会卡顿，锁、调度和下游 IO 仍可产生长尾。

## 三、可对照的实验命令

```shell
# JDK 21：保持同样堆预算与业务负载，只切换回收器作为第一轮比较。
java -Xms1g -Xmx1g -XX:+UseG1GC -jar app.jar
# JDK 21 分代 ZGC 需同时指定这两个开关。
java -Xms1g -Xmx1g -XX:+UseZGC -XX:+ZGenerational -jar app.jar
```

1 GB 只是实验示例，不是生产推荐容量。JDK 23 的 ZGC 默认转向分代实现，JDK 24 移除非分代实现；后续版本应再核对对应文档，避免复制过时开关。

## 四、验证哪些结果

同样的请求模型和数据规模下，比较业务 P99、吞吐、错误率、CPU、RSS、分配率和 GC 行为。压测要覆盖预热、峰值与持续负载，而不只跑几秒。

若 CPU 已饱和，更多并发 GC 工作可能竞争业务资源；若堆余量不足，分配速度超过回收速度，也会影响服务。降低暂停只是优化的一项，不应以吞吐严重下降为代价却只报告暂停改进。

## 五、面试简答与追问

**简答：** G1 是常用的平衡起点，ZGC 适合重点验证严格延迟目标的场景。选择依赖版本、业务指标和资源预算，最终以可重复压测决定。

**追问：G1 能保证 100 ms 内完成暂停吗？** 不能。暂停目标用于指导工作量选择，不是实时性承诺。

## 参考资料

- [Oracle：G1 调优](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector-tuning.html)
- [JEP 439：分代 ZGC](https://openjdk.org/jeps/439)
- [JEP 474：默认使用分代 ZGC](https://openjdk.org/jeps/474)
- [JEP 490：移除非分代 ZGC](https://openjdk.org/jeps/490)
