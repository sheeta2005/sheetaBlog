---
title: Lock相关
date: 2026-06-16
tags: [JUC, Lock, ReentrantLock, Condition, 可中断锁, 超时锁]
categories: [后端技术]
description: Lock与synchronized区别、可打断锁、可超时锁、多Condition条件变量、signal/signalAll与notify/notifyAll对比
layout: doc
outline: deep
---

# Lock相关
## 一、synchronized 和 Lock 三层核心区别
### 1. 语法与底层实现
1. synchronized
   是Java关键字，由JVM底层C++实现；同步代码块/方法执行完毕、抛出异常时**自动释放锁**，无需手动解锁。
2. Lock
   是JDK提供的Java接口，代表锁规范，代表实现类为ReentrantLock，纯Java基于AQS+CAS实现；必须手动调用unlock()释放锁，规范写法放在finally中，防止死锁。

### 2. 功能层面
相同点：二者都是悲观独占锁，都支持互斥同步、锁可重入。
Lock独有拓展功能：
1. 支持公平锁、非公平锁自由切换；
2. 可中断获取锁（lockInterruptibly）；
3. 带超时时间获取锁（tryLock）；
4. 支持多Condition条件变量，精准唤醒指定线程；
5. 多场景实现类：ReentrantLock独占锁、ReentrantReadWriteLock读写锁。

### 3. 性能层面
1. 无竞争低并发：synchronized经过偏向锁、轻量级锁优化，性能表现优秀；
2. 高并发激烈竞争：Lock基于AQS自旋机制，性能优于膨胀为重量级锁的synchronized。

## 二、可打断锁 lockInterruptibly
### 1. 核心特点
synchronized阻塞等待锁时，无法响应线程中断，会一直死等；
lockInterruptibly()在线程阻塞抢锁期间，若收到interrupt()中断信号，直接抛出InterruptedException，终止等待流程。

### 2. 代码示例
```java
ReentrantLock lock = new ReentrantLock();
Thread t1 = new Thread(() -> {
    try {
        // 可中断加锁
        lock.lockInterruptibly();
    } catch (InterruptedException e) {
        System.out.println("等待锁过程被中断，直接退出");
        return;
    }
    try {
        System.out.println("线程获取锁执行业务");
    } finally {
        lock.unlock();
    }
}, "t1");
t1.start();
// 主线程中断线程，线程会跳出阻塞
t1.interrupt();
```

### 3. 适用场景
需要主动终止长期阻塞的线程，避免无限等待卡死。

## 三、可超时锁 tryLock
### 1. 两种重载
1. 无参 tryLock()：立即尝试抢锁，抢到返回true，未抢到直接返回false，全程不阻塞；
2. 带参 tryLock(long time, TimeUnit unit)：在指定时长内循环尝试获取锁，超时仍未拿到锁直接返回false，不会永久阻塞。

### 2. 优势
可以设置兜底业务逻辑，规避线程无限阻塞占用资源。

## 四、多条件变量 Condition（signal / signalAll）
### 1. synchronized原生等待缺陷
synchronized仅内置唯一等待队列，notify随机唤醒一个线程，notifyAll唤醒全部等待线程，无法按业务分组精准唤醒。

### 2. Lock多Condition优势
同一把Lock可以创建多个独立Condition条件队列，不同业务线程绑定不同条件，实现分组精准唤醒：
- condition.await()：释放当前锁，进入对应条件队列阻塞等待；
- condition.signal()：唤醒该条件队列中单个等待线程；
- condition.signalAll()：唤醒该条件队列全部等待线程。

### 3. signal / signalAll 与 notify / notifyAll 对照
1. signal() 对应 notify()：唤醒单个等待线程；
2. signalAll() 对应 notifyAll()：唤醒全部等待线程；
3. 关键区别：Condition是多队列隔离唤醒，synchronized只有单队列，唤醒范围不可控。

## 五、面试高频问题解析
1.  **问：synchronized和Lock有哪些区别？**
    **答：** 底层实现上synchronized是关键字、JVM C++实现，自动释放锁；Lock是Java接口，AQS实现，需手动unlock。功能上Lock支持公平锁、可中断、超时、多条件变量；性能上无竞争synchronized优化更好，高并发竞争Lock性能更优。

2.  **问：lock()和lockInterruptibly()区别？**
    **答：** lock()阻塞时无视中断信号，只会拿到锁后才处理中断；lockInterruptibly()阻塞等待阶段就能响应中断，直接抛出异常退出等待。

3.  **问：tryLock有什么作用？**
    **答：** 支持无阻塞瞬时抢锁、带超时限时抢锁，避免线程无限阻塞，可自定义超时兜底逻辑。

4.  **问：Condition相比synchronized等待机制好在哪？signal和signalAll区别？**
    **答：** 一把锁可创建多个独立Condition队列，能按业务分组精准唤醒线程；signal唤醒单个等待线程，signalAll唤醒该条件下所有等待线程，粒度更细。