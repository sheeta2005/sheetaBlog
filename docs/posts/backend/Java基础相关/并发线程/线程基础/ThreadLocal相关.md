---
title: ThreadLocal相关
date: 2026-06-16
tags: [JUC, ThreadLocal, ThreadLocalMap, 弱引用, 内存泄漏]
categories: [后端技术]
description: ThreadLocal作用、API、底层原理、源码流程、内存泄漏成因与解决方案、项目实战场景
layout: doc
outline: deep
---

# ThreadLocal相关
## 一、核心概述
### 1. 核心作用
1. **线程数据隔离**：为每个线程分配独立变量副本，多线程操作互不干扰，从根源解决共享变量并发冲突；
2. **线程内资源共享**：同一线程多处代码可便捷获取同一资源，无需多层传参。
### 2. 典型业务案例
JDBC数据库连接管理：每个线程持有独立Connection存入ThreadLocal，避免多线程共用连接、误关闭其他线程连接。
### 3. 基础三大API
- `set(T value)`：向当前线程存入数据；
- `get()`：读取当前线程绑定的数据；
- `remove()`：清除当前线程绑定的数据，**防止内存泄漏必调用**。

## 二、底层实现原理
### 1. 存储结构
1. 每个`Thread`对象内部持有成员变量 `ThreadLocal.ThreadLocalMap threadLocals`；
2. `ThreadLocalMap` 内部数组 `Entry[] table`，初始容量16；
3. `Entry` 继承 `WeakReference<ThreadLocal<?>>`：
    - key：ThreadLocal实例，**弱引用**；
    - value：业务存储对象，**强引用**。

### 2. set() 源码流程
1. 获取当前线程 `Thread t = Thread.currentThread()`；
2. 获取线程内的ThreadLocalMap；
3. map不为空则 `map.set(this, value)`，以当前ThreadLocal为key存入；
4. map为空则新建ThreadLocalMap并存入键值对。

### 3. get() 源码流程
1. 获取当前线程与对应ThreadLocalMap；
2. 通过ThreadLocal哈希值定位数组下标，取出Entry；
3. 匹配key成功则返回entry.value；无数据返回初始化值。

### 4. remove() 流程
以当前ThreadLocal为key，清除ThreadLocalMap中对应的Entry，释放value强引用。

## 三、内存泄漏问题详解
### 1. 四种引用基础
- 强引用：普通对象引用，GC不会回收，内存不足直接OOM；
- 弱引用：GC扫描到即回收，不考虑内存剩余。

### 2. 泄漏根本原因
1. ThreadLocalMap的key是弱引用，无外部强引用时会被GC回收；
2. value是强引用；
3. 线程池场景线程复用，线程长期存活，key被清空后value无法被GC回收，长期堆积造成内存泄漏。

### 3. 解决方案
使用完ThreadLocal后，**必须在finally块执行remove()**，主动清除key与value，断开强引用。

## 四、完整总结（面试标准回答）
1. 功能：实现线程资源隔离，每个线程拥有独立变量副本，规避并发安全问题，同时在线程内便捷共享资源；
2. 底层：每个Thread持有ThreadLocalMap，以ThreadLocal为key、业务对象为value存储；Entry中key弱引用、value强引用；
3. 操作：set存、get取、remove清；
4. 隐患：线程池长存活线程会导致value无法回收，引发内存泄漏；规范写法使用完毕主动remove释放资源。

## 五、面试简答
问：说说ThreadLocal原理与内存泄漏怎么解决？
答：
ThreadLocal用于线程间数据隔离，每个线程自带ThreadLocalMap，存储结构Entry数组，key是弱引用的ThreadLocal，value是强引用业务对象。调用set/get操作以自身为key读写当前线程数据。
内存泄漏根源：线程池线程长期不销毁，key被GC回收后value强引用无法释放；解决办法是使用完后在finally执行remove()，主动清除Entry。
项目中用于存储数据库连接、登录用户上下文，保证单线程全程共用一份资源，多线程互不干扰。