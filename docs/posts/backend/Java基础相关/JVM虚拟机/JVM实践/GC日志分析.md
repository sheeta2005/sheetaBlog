---
title: GC日志分析
date: 2026-10-01
tags: [JVM, GC日志, G1, 调优, 延迟]
categories: [JVM调优实践]
description: JDK 21 统一日志、GC 事件与堆变化，如何区分高分配、泄漏和停顿问题
layout: doc
outline: deep
---

# GC 日志分析

## 一、先保留能够关联时间的日志

JDK 9 及以后使用统一日志框架；这里以 JDK 21 为例。JDK 8 的旧日志开关应单独查对应版本，不能直接混进同一启动命令。

```shell
# logs 目录需已存在且可写；同时输出时间和运行时长，设置有限轮转。
java -Xlog:gc*,safepoint:file=logs/gc.log:time,uptime,level,tags:filecount=5,filesize=20M -jar app.jar
```

日志要与服务实例、JDK 版本、回收器、堆配置和负载时间对应。只截取一条最长停顿，很难判断问题是偶发还是持续。

## 二、阅读一条记录

以下为教学示意，不是本项目实测结果：

```text
[12.340s][info][gc] GC(7) Pause Young (Normal) (G1 Evacuation Pause) 256M->80M(512M) 12.000ms
```

| 信息 | 含义 |
| --- | --- |
| `12.340s` | JVM 启动后的时间 |
| `GC(7)` | 本次相关事件的标识，便于关联其他日志行 |
| `Pause Young` | 年轻代回收相关暂停，需继续看原因 |
| `256M->80M(512M)` | 回收前后堆使用量与当前容量，不能直接视为 Xmx |
| `12.000ms` | 此记录中的暂停持续时间，不是整个请求耗时 |

G1 一次并发周期会有多条事件与不同暂停，不能把整个并发周期时长直接算成应用全程停顿。

## 三、结合曲线判断原因

回收频繁但回收后使用量稳定，可能是分配速率高；回收后基线持续抬升，可能是业务存活数据增长或错误保留，需要对象证据确认。

停顿变长时，查看对象复制量、根扫描、引用处理、Region 构成及 CPU 资源。长请求也可能来自锁、数据库或网络，只有与 GC 暂停时间重叠才有进一步关联依据。

## 四、建议的排查顺序

1. 对齐慢请求时间与 GC、safepoint 和 CPU 指标。
2. 比较相同负载下的分配率、回收频率和回收后存活量。
3. 对异常增长采集对象分布与引用链；堆转储可能有额外成本，先安排采集窗口。
4. 一次只改变一个关键因素，用相同负载验证吞吐与延迟。

平均停顿低不代表尾延迟好；应关注停顿分布与业务 P95/P99。`MaxGCPauseMillis` 是目标，不是最大停顿的硬性保证。

## 五、面试简答与追问

**简答：** 先看事件、堆变化和暂停，再结合负载判断分配与存活。GC 日志提供线索，泄漏要用保留链确认，调优必须比较业务指标。

**追问：一次 Full GC 就代表内存泄漏吗？** 不代表。需要看触发原因和回收效果，外部显式请求、空间压力等也可能触发相关行为。

## 参考资料

- [JDK 21 java：统一日志](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
- [Oracle：G1 调优](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector-tuning.html)
