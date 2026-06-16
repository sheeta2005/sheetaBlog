---
title: ReentrantLock相关
date: 2026-06-16
tags: [JUC, ReentrantLock, AQS, 公平锁, 非公平锁, 可重入锁]
categories: [后端技术]
description: ReentrantLock特性、代码规范、底层AQS+CAS实现、公平/非公平锁源码与执行流程、总结及面试问答
layout: doc
outline: deep
---

# ReentrantLock相关
## 一、基础介绍与核心特性
ReentrantLock 即可重入锁，基于AQS抽象队列同步器实现，对比`synchronized`拓展能力更强：
1. **可中断**：获取锁时支持`lockInterruptibly()`，阻塞过程可响应线程中断
2. **支持超时获取**：`tryLock(long time, TimeUnit)`，超时未拿到锁直接返回，不会永久阻塞
3. **可选公平/非公平模式**：构造参数控制，默认非公平锁
4. **多条件变量**：可通过`newCondition()`创建多个等待队列，精准线程唤醒
5. **支持可重入**：同线程多次加锁不会阻塞，和synchronized特性一致

### 标准编码规范
锁必须在`finally`中释放，防止异常死锁
```java
// 创建锁对象
ReentrantLock lock = new ReentrantLock();
try {
    // 获取锁
    lock.lock();
    // 业务逻辑
} finally {
    // 释放锁
    lock.unlock();
}
```

## 二、底层实现基础
### 1. 核心依赖
底层依靠 **CAS + AQS双向阻塞队列** 实现锁逻辑。
内部静态内部类`Sync`继承`AbstractQueuedSynchronizer`，分为两个实现子类：
- `NonfairSync`：非公平锁（无参构造默认）
- `FairSync`：公平锁（构造传`true`开启）

### 2. 构造方法源码
```java
// 默认非公平锁
public ReentrantLock() {
    sync = new NonfairSync();
}
// 传入布尔值切换公平/非公平
public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

## 三、AQS底层执行机制
AQS核心成员：
1. `volatile int state`：同步状态，0=无锁，≥1=持有锁（可重入计数）
2. `exclusiveOwnerThread`：记录当前持有锁的线程，用于可重入校验
3. head/tail：双向阻塞队列首尾指针，存储抢锁失败的线程Node节点

### 抢锁完整流程
1. 线程尝试CAS修改`state`从0→1，CAS成功则将`exclusiveOwnerThread`绑定当前线程，获取锁成功；
2. CAS修改state失败，线程封装为Node进入双向阻塞队列尾部挂起等待；
3. 持有锁线程执行完毕unlock，state递减至0后，唤醒队列head后的第一个等待线程；
4. 公平/非公平核心区分：
    - 非公平锁：新线程不检查队列，直接CAS抢锁，可插队
    - 公平锁：新线程先判断队列是否有等待线程，有则直接入队，禁止插队

## 四、公平锁 vs 非公平锁
1. **非公平锁（默认）**
   新线程上来直接CAS抢占state，无视等待队列，吞吐量更高，但会出现线程饥饿；并发场景生产默认使用。
2. **公平锁（new ReentrantLock(true)）**
   抢锁前先校验阻塞队列，有排队线程则直接入队，严格遵循FIFO顺序，无线程饥饿；频繁上下文切换，吞吐量更低。

## 五、核心总结
1. ReentrantLock是可重入独占锁，同一线程多次lock不会阻塞，对应unlock次数需匹配；
2. 底层依托AQS+CAS实现同步，内部Sync子类区分公平、非公平模式；
3. 无参构造默认非公平锁，可通过布尔构造参数开启公平锁；
4. 拓展能力远强于synchronized：中断、超时、多条件、公平策略等。

## 六、面试高频问题解析
1.  **问：ReentrantLock相比synchronized有哪些优势？**
    **答：** 支持可中断获取锁、超时获取、公平/非公平切换、多个Condition条件变量；手动锁粒度更灵活，功能拓展性更强，二者都支持可重入。

2.  **问：ReentrantLock底层靠什么实现？公平锁和非公平锁区别在哪？**
    **答：** 底层基于AQS+CAS实现，内部Sync分FairSync、NonfairSync。非公平锁新线程可直接插队抢锁，吞吐高；公平锁必须排队，严格FIFO，无饥饿但性能差。

3.  **问：什么是可重入，ReentrantLock如何实现可重入？**
    **答：** 同一线程多次加锁不会阻塞。通过`exclusiveOwnerThread`判断当前持有线程，是自身则state计数+1；解锁时计数递减，归0才释放锁。

4.  **问：为什么unlock必须写在finally代码块？**
    **答：** 业务代码抛出异常时，finally一定会执行，保证锁必然释放，避免线程死锁。

5.  **问：默认为什么选用非公平锁？**
    **答：** 非公平锁允许新线程直接抢占，减少线程阻塞与上下文切换，系统吞吐量更高，绝大多数业务不需要严格公平顺序。