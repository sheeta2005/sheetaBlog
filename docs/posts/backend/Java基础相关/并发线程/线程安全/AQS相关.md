---
title: AQS相关
date: 2026-06-15
tags: [JUC, AQS, ReentrantLock, 公平锁, 非公平锁, CAS]
categories: [后端技术]
description: AQS定义、核心结构、底层机制、公平锁与非公平锁实现逻辑、AQS与synchronized对比、常见实现类
layout: doc
outline: deep
---

# AQS相关
## 一、AQS基础定义
AQS全称 AbstractQueuedSynchronizer，抽象队列同步器，是JUC中所有锁、同步工具的底层基础框架，Java语言实现，底层依靠CAS操作保证状态修改原子性。

## 二、AQS两大核心组件
1. volatile int state
   同步状态资源，默认0代表无锁；
- 独占锁（ReentrantLock）：state=1代表持有锁，可重入则state累加；释放时递减至0；
- 共享锁（Semaphore/CountDownLatch）：state代表剩余许可数量。

2. FIFO双向阻塞队列
   存放抢锁失败的线程节点Node，包含head头节点、tail尾节点；未抢到锁的线程封装为Node入队阻塞，释放锁后唤醒队首线程。

## 三、AQS与synchronized核心区别
1. 实现层面
   synchronized是关键字，底层C++ Monitor实现；AQS纯Java代码实现，基于CAS自旋。
2. 锁释放
   synchronized自动释放，出同步块/异常都会释放；AQS配套Lock需要手动lock()、unlock()，必须finally释放。
3. 竞争性能
   synchronized竞争激烈直接膨胀重量级锁，内核切换开销大；AQS提供公平/非公平两种策略，自旋优化，并发场景更灵活。
4. 功能拓展
   synchronized功能单一；AQS支持可中断锁、限时等待、公平/非公平、共享/独占模式。

## 四、基于AQS的常用工具类
1. ReentrantLock：独占可重入锁，支持公平/非公平
2. Semaphore：共享信号量，控制并发线程数量
3. CountDownLatch：倒计数同步器，等待多线程完成任务

## 五、公平锁与非公平锁实现原理
### 1. 非公平锁（ReentrantLock默认）
抢锁逻辑：线程上来直接CAS尝试修改state
1. 若state=0，CAS成功直接持有锁，不检查等待队列；
2. 若CAS失败，当前线程封装Node加入阻塞队列尾部；
   特点：新线程可以插队抢占锁，队列线程可能长期得不到执行，存在线程饥饿，吞吐量更高。

### 2. 公平锁
抢锁逻辑：获取锁前先判断阻塞队列是否存在等待线程
1. 先判断队列head之后是否有排队线程；
2. 有等待线程则当前线程直接入队，不尝试CAS抢锁；
3. 队首线程唤醒后才能竞争state；
   特点：严格遵循FIFO顺序，无线程饥饿，上下文切换多，吞吐量低于非公平锁。

### 核心区分点
- 非公平：state空闲时新线程直接抢占，无视等待队列；
- 公平：只要队列有等待线程，新线程一律排队，不插队。

## 六、AQS整体执行流程
1. 线程执行acquire获取同步资源；
2. CAS尝试修改state：
    - 修改成功：线程持有资源；
    - 修改失败：封装Node加入双向阻塞队列，线程阻塞；
3. 持有锁线程release释放资源，state恢复；
4. 唤醒队列head后的第一个等待线程，再次竞争state。

## 七、面试高频问题解析
1.  **问：什么是AQS？**
    **答：** AQS是抽象队列同步器，JUC同步组件底层框架，内部包含volatile同步状态state、FIFO双向阻塞队列，依靠CAS修改state保证原子性；ReentrantLock、Semaphore、CountDownLatch均基于AQS实现。

2.  **问：AQS公平锁和非公平锁怎么实现，区别是什么？**
    **答：** 非公平锁抢锁时直接CAS修改state，空闲就直接抢占，无视等待队列，吞吐量高但会饥饿；公平锁获取前先检查阻塞队列，有等待线程则直接入队，严格FIFO，无饥饿但性能更低。ReentrantLock默认非公平锁。

3.  **问：AQS的state修改如何保证原子性？**
    **答：** 底层调用Unsafe类CAS硬件原语，CompareAndSwap比较交换，硬件层面保证修改不可分割，多线程并发修改不会出现数据错乱。

4.  **问：AQS和synchronized对比？**
    **答：** synchronized是C++底层关键字，自动释放锁，竞争直接重量级锁；AQS纯Java实现，手动解锁，支持公平/非公平、限时、中断等拓展功能，并发场景性能可调。

5.  **问：AQS阻塞队列作用？**
    **答：** 存放抢锁失败的线程，双向链表FIFO结构；线程抢锁失败入队阻塞，锁释放时唤醒队首节点，避免无限自旋消耗CPU。