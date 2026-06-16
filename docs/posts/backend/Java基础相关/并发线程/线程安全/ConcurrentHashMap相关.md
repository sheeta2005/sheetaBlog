---
title: ConcurrentHashMap相关
date: 2026-06-16
tags: [JUC, ConcurrentHashMap, 分段锁, CAS, synchronized, JDK1.7, JDK1.8]
categories: [后端技术]
description: ConcurrentHashMap线程安全原理，JDK1.7分段锁、JDK1.8数组+链表/红黑树+CAS+synchronized对比，底层结构与锁粒度差异
layout: doc
outline: deep
---

# ConcurrentHashMap相关
## 一、基础概述
ConcurrentHashMap 是**线程安全、高性能**的并发Map集合，用于多线程读写场景，解决HashMap并发死链、HashTable全局锁性能差的问题。
JDK1.7与JDK1.8底层数据结构、加锁机制完全不同。

## 二、JDK1.7 实现方案
### 1. 底层数据结构
分段数组 `Segment[]` + 内部HashEntry链表数组。
默认16个Segment分段，每一段独立持有一组链表，本质是**分段锁思想**。

### 2. 加锁机制
1. 底层每个Segment继承ReentrantLock，每一段对应一把独立可重入锁；
2. put流程：key哈希定位到对应Segment，CAS尝试抢占锁，加锁成功后操作该分段内链表；
3. 锁粒度：按Segment分段锁定，不同分段可并发读写，相比HashTable全局锁并发性能大幅提升。

### 3. 缺陷
分段数量固定为16，扩容无法增加分段；锁粒度依旧偏大，同一分段下所有hash冲突节点串行等待。

## 三、JDK1.8 实现方案
### 1. 底层数据结构
废弃Segment分段设计，底层结构与HashMap 1.8完全一致：**数组 + 链表 + 红黑树**。
链表长度≥8转为红黑树，节点数≤6退回链表，优化查询效率。

### 2. 并发安全保障：CAS + synchronized
1. **CAS**：数组为空桶时，使用CAS无锁插入首个Node，不阻塞其他线程；
2. **synchronized**：仅锁定当前桶位链表/红黑树**头节点**；
    - 不同桶位hash不冲突，可完全并发读写，互不阻塞；
    - 锁粒度细化到单个桶，并发吞吐量远高于1.7分段锁。

### 3. 性能优势
锁粒度更细，并发冲突范围极小；synchronized经JVM锁优化（偏向/轻量级锁），开销低于ReentrantLock分段锁。

## 四、1.7与1.8核心对比总结
|维度|JDK1.7 ConcurrentHashMap|JDK1.8 ConcurrentHashMap|
|----|----|----|
|底层结构|Segment分段数组 + HashEntry链表|数组 + 链表 / 红黑树|
|锁实现|Segment分段锁，底层ReentrantLock|CAS无锁插入 + synchronized锁桶头节点|
|锁粒度|分段锁定，一段一把锁|桶位级锁定，只锁当前冲突链表|
|并发性能|中等，同分段串行阻塞|更高，无冲突桶完全并发|
|扩容能力|分段固定16，无法动态扩容分段|数组动态扩容，桶数量翻倍|

## 五、面试高频问题解析
1.  **问：ConcurrentHashMap为什么线程安全？1.7和1.8锁机制区别？**
    **答：** JDK1.7采用Segment分段ReentrantLock，不同分段可并发；JDK1.8取消分段，采用CAS插入空桶，synchronized锁定单个桶头节点，锁粒度更细，并发性能更好。

2.  **问：JDK1.8为什么放弃Segment分段锁？**
    **答：** 分段锁粒度大，同一分段所有hash冲突都要排队；1.8细化到单个桶加锁，无冲突桶可并行操作，配合synchronized锁优化，整体吞吐更高。

3.  **问：ConcurrentHashMap和HashTable区别？**
    **答：** HashTable所有方法加synchronized全局锁，多线程串行执行，性能极差；ConcurrentHashMap分段/桶级锁，支持并发读写，效率更高。

4.  **问：JDK1.8 ConcurrentHashMap CAS和synchronized分别作用？**
    **答：** 数组对应下标为空时，用CAS无锁插入首节点；下标已有节点时，对链表/红黑树头节点加synchronized，保证同一桶并发修改安全。