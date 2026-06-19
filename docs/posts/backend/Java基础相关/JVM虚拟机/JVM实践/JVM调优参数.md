---
title: JVM调优参数
date: 2026-06-19
tags: [JVM, JVM调优, JVM参数, Xms, Xmx, Xss, G1, ParallelGC]
categories: [JVM调优实践]
description: JVM参数配置位置（Windows/Linux-Tomcat/War、Jar包）、堆内存、栈、新生代比例、晋升阈值、垃圾回收器常用调优参数详解
layout: doc
outline: deep
---
# JVM调优参数
## 一、JVM参数配置位置
### 1. War包 Tomcat部署
#### Linux环境
修改 `TOMCAT_HOME/bin/catalina.sh`，新增 `JAVA_OPTS` 配置堆、回收器等参数。
```shell
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
```

#### Windows环境
修改 `TOMCAT_HOME/bin/catalina.bat`，添加JAVA_OPTS配置：
```bat
set JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC
```

### 2. Jar包 SpringBoot项目
#### Linux环境
nohup后台启动，参数写在java与-jar中间。
```shell
nohup java -Xms512m -Xmx1024m -XX:+UseG1GC -jar app.jar --spring.profiles.active=prod &
```
- `nohup`：后台持续运行，关闭终端不停止程序
- `&`：命令后台执行

#### Windows环境
1. 前台启动（cmd窗口关闭程序停止）
```cmd
java -Xms512m -Xmx1024m -XX:+UseG1GC -jar app.jar
```
2. 后台无窗口运行（创建bat脚本）
   新建`start.bat`：
```bat
@echo off
start javaw -Xms512m -Xmx1024m -XX:+UseG1GC -jar app.jar
```

## 二、常用核心调优参数分类
### 1. 堆内存大小设置
- `-Xms`：堆初始内存大小
- `-Xmx`：堆最大内存大小
  单位支持 k/m/g，无单位默认字节。
  规范调优：`-Xms` 与 `-Xmx` 设置相同，避免堆扩容收缩带来额外GC开销。
```
-Xms1024m
-Xmx2048m
```
默认规则：
- Xmx：物理内存 1/4
- Xms：物理内存 1/64
  调优风险：
- 堆过小：频繁MinorGC、FullGC，长时间STW；
- 堆过大：FullGC扫描全堆，停顿时间大幅拉长。

### 2. 线程栈大小 -Xss
每个线程栈默认1M，存储栈帧、局部变量、方法调用信息。
```
-Xss128k
```
调优逻辑：减小栈内存可支持更多并发线程，受操作系统限制。

### 3. 新生代Eden/Survivor比例
`-XX:SurvivorRatio=8`
代表 Eden : Survivor = 8:2，两个Survivor均分2份，默认8:1:1。
调优权衡：增大Eden减少YGC次数，但单次GC存活对象多，STW变长。

### 4. 对象晋升老年代阈值
`-XX:MaxTenuringThreshold=15`
对象在Survivor每熬过一次MinorGC年龄+1，到达阈值晋升老年代；取值范围0~15。

### 5. 指定垃圾回收器
1. Parallel并行收集器（JDK8默认）
```
-XX:+UseParallelGC
-XX:+UseParallelOldGC
```
2. G1收集器（JDK9默认）
```
-XX:+UseG1GC
```

## 三、面试简答
问：JVM调优常用参数有哪些，Windows和Linux分别在哪里配置参数？

答：
1. 配置位置：
- War包Tomcat部署：
  Linux改bin/catalina.sh配置JAVA_OPTS；
  Windows改bin/catalina.bat配置set JAVA_OPTS。
- Jar包SpringBoot：
  Linux用nohup java命令添加参数后台运行；
  Windows cmd直接java前台启动，或bat脚本javaw后台无窗口启动。

2. 常用调优参数：
- 堆内存：-Xms初始堆、-Xmx最大堆，生产环境两者设相同；
- 线程栈：-Xss调整单线程栈内存；
- 新生代比例：-XX:SurvivorRatio设置Eden与Survivor占比；
- 晋升阈值：-XX:MaxTenuringThreshold，对象存活年龄上限，默认15；
- 回收器：-XX:+UseParallelGC并行收集、-XX:+UseG1GC启用G1。