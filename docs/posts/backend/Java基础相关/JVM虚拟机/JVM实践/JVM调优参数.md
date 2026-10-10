---
title: JVM调优参数
date: 2026-06-19
revised: 2026-10-10
tags: [JVM, JVM调优, JVM参数, Xms, Xmx, Xss, G1, ParallelGC]
categories: [JVM调优实践]
description: JDK 21 JVM 参数、Tomcat 配置入口、堆与本地内存预算、统一日志及版本差异
layout: doc
outline: deep
---

# JVM调优参数

## 一、先确认版本与配置入口

本文以 **JDK 21 HotSpot** 为基线。先确认实际运行的 JDK、内存限制和回收器，再讨论参数；旧版本的参数名、默认值和支持范围不能直接复用。

### 1. 独立 Tomcat 部署

推荐在 `CATALINA_BASE/bin/setenv.sh` 或 `setenv.bat` 配置，避免直接修改发行包的 catalina 启动脚本。

```shell
# Linux：用于服务器启动的参数；目录由实际实例确定。
CATALINA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
```

```bat
rem Windows：setenv.bat 示例，使用引号避免意外引入末尾空格。
set "CATALINA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC"
```

`CATALINA_OPTS` 与 `JAVA_OPTS` 的作用范围不同，后者还可能作用于停止等其他命令。Windows 服务启动还需检查服务自己的 Java 参数配置，不能默认一定读取这两个脚本。

### 2. Spring Boot JAR

```shell
# JVM 参数放在 -jar 前；应用参数放在 JAR 路径后。
java -Xms512m -Xmx1024m -XX:+UseG1GC -jar app.jar --spring.profiles.active=prod
```

## 二、内存参数的真实含义

| 参数 | 作用 | 注意点 |
| --- | --- | --- |
| `-Xms` / `-Xmx` | 初始堆 / 最大堆 | 最大堆不是整个进程内存上限 |
| `-Xss` | 平台线程栈大小配置 | 默认值与最小可用值依平台、JDK 而异 |
| `-XX:MetaspaceSize` | 影响首次元数据相关 GC 的初始阈值 | 不是预先分配等量元空间 |
| `-XX:MaxMetaspaceSize` | 类元数据内存上限 | 太小可能频繁 GC 或元空间 OOM |
| `-XX:MaxDirectMemorySize` | NIO 直接缓冲区分配的相关上限 | 不控制所有本地内存 |
| `-XX:MaxRAMPercentage` | 按 JVM 所识别内存预算计算最大堆的比例参数 | 显式 Xmx 与容器识别也影响结果 |

不存在适用所有部署的“Xmx 必须占机器 70%”。容器预算还要给元空间、栈、代码缓存、本地库、直接内存等留空间；进程超限可能由系统直接终止。

Xms 与 Xmx 相同有助于减少堆容量调整，但会改变资源占用与弹性，不是所有生产环境都必须这样设置。线程栈太小可能无法满足调用深度，也不能只靠减小 Xss 扩大线程数量。

## 三、分代与回收器参数

`SurvivorRatio=8` 的典型解释是 Eden 与一个 Survivor 的比例为 8:1，即 Eden:S0:S1 约为 8:1:1，且实际布局与自适应行为依收集器而异。

`MaxTenuringThreshold` 是年龄阈值相关参数，实际晋升还受空间和动态判断影响。G1 通常不应先固定年轻代大小，以免限制它根据暂停目标调整工作量。

JDK 21 可用 `-XX:+UseG1GC` 或 `-XX:+UseParallelGC` 选择相应收集器。CMS 已在 JDK 14 移除，不能把 `UseConcMarkSweepGC` 放进现代 JDK 示例。分代 ZGC 的版本差异见 [选型笔记](../垃圾回收/G1与ZGC如何选型)。

`-XX:MaxGCPauseMillis` 是部分回收器使用的暂停目标，不能保证每次暂停都不超过此数值。

## 四、日志与诊断参数

```shell
# JDK 21 示例：logs 目录应已存在且可写，容量按实际资源预算调整。
java -Xms512m -Xmx1024m -XX:+UseG1GC \
  -Xlog:gc*:file=logs/gc.log:time,uptime,level,tags:filecount=5,filesize=20M \
  -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=logs \
  -jar app.jar
```

堆转储需要足够磁盘空间，并可能带来采集开销。该开关不能保证捕获系统直接杀进程等所有内存故障。JDK 8 的 GC 日志使用旧参数体系，需要单独查对应文档。

## 五、确认参数生效

用 `jcmd <pid> VM.command_line` 查看实际命令，必要时用 `VM.flags` 核对有效参数。启动脚本写对了，但进程由另一个服务管理器启动，也可能没有生效。

调优顺序应是：建立负载基线、定位瓶颈、一次调整一个因素，再比较吞吐、P99、错误率和资源消耗。

## 六、面试简答与追问

**简答：** JVM 参数围绕堆、非堆、线程、回收器和诊断展开。先确认版本与进程总预算，再调整并验证实际生效。

**追问：MetaspaceSize 与 MaxMetaspaceSize 有什么不同？** 前者影响初始 GC 阈值，后者限制元数据内存；不能解释成元空间的 Xms 与 Xmx。

## 参考资料

- [JDK 21 java 命令与参数](https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html)
- [Tomcat 10.1 部署与启动](https://tomcat.apache.org/tomcat-10.1-doc/RUNNING.txt)
- [Oracle：G1 调优](https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector-tuning.html)
- [犬小哈：JVM 启动参数指南（选题参考）](https://www.quanxiaoha.com/java-interview/jvm-startup-parameters-guide)
