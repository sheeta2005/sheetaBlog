---
title: JVM调优工具
date: 2026-06-19
tags: [JVM, JVM调优, jps, jstack, jmap, jhat, jstat, jconsole, VisualVM]
categories: [JVM调优实践]
description: JVM自带命令行监控工具、可视化GUI工具功能、常用命令与使用场景详解
layout: doc
outline: deep
---
# JVM调优工具
整体分为两大类：命令行工具（服务器无图形界面排查）、可视化GUI工具（本地直观监控分析）。

## 一、命令行工具
### 1. jps
作用：列出本机所有Java进程PID、进程名称，是所有JVM命令的前置工具。
```shell
jps
```
输出示例：进程PID + 启动类名/Jar标识。

### 2. jstack
作用：打印指定Java进程全部线程堆栈信息，定位死锁、死循环、线程阻塞、CPU飙高问题。
```shell
jstack <pid>
```
输出包含线程状态（RUNNABLE/WAITING/BLOCKED）、方法调用栈、锁持有信息。

### 3. jmap
作用：查看堆内存概况、生成堆dump快照文件，用于事后内存泄漏分析。
常用命令：
```shell
# 查看堆整体内存分区使用
jmap -heap <pid>

# 导出二进制堆快照dump文件
jmap -dump:format=b,file=heap.hprof <pid>
```
dump文件是进程内存快照，包含对象、线程、栈、异常数据，用于离线分析内存溢出。

### 4. jhat
作用：离线解析jmap导出的hprof堆快照，内置简易web服务查看对象占用、引用链。
```shell
jhat heap.hprof
```

### 5. jstat
作用：实时持续采集JVM运行统计数据，重点监控GC、类加载、内存占用。
1. `jstat -gcutil <pid>`：汇总GC统计，展示各代内存占比、YGC/FGC次数与总耗时
2. `jstat -gc <pid>`：打印新生代/老年代/元空间实时内存容量、已使用大小

## 二、可视化GUI工具
### 1. jconsole
基于JMX的轻量图形监控工具，JDK bin目录下`jconsole.exe`直接启动。
监控维度：堆内存曲线、线程列表、类加载数量、CPU使用率，适合简单线上本地监控。

### 2. VisualVM（jvisualvm）
功能更强的官方可视化工具，bin目录`jvisualvm.exe`启动。
核心能力：
1. 实时监控内存、线程、CPU；
2. 手动生成堆dump快照，在线分析对象占用、引用链；
3. 性能抽样Profiler，定位消耗CPU/内存的方法；
4. 支持远程Java进程连接监控。

## 三、面试简答
问：JVM有哪些自带调优监控工具，分别用途是什么？

答：
1. 命令行工具（服务器环境）
- jps：查询Java进程PID；
- jstack：打印线程栈，排查死锁、高CPU、线程阻塞；
- jmap：查看堆内存，导出hprof堆转储文件；
- jhat：解析dump堆快照，离线分析内存泄漏；
- jstat：实时监控GC、各代内存使用统计。

2. 可视化GUI工具（本地Windows/开发机）
- jconsole：简易JMX图形监控，查看内存、线程、类加载；
- VisualVM：功能完善，支持实时监控、dump分析、性能抽样Profiler，JDK自带推荐使用。