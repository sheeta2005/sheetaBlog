---
title: synchronized底层原理
date: 2026-06-15
tags: [JUC, synchronized, Monitor, 锁升级, MarkWord]
categories: [后端技术]
description: 对象内存结构、Monitor监视器、偏向锁/轻量级锁/重量级锁完整原理，WaitSet与EntryList优先级解答
layout: doc
outline: deep
---

# synchronized底层原理

## 一、HotSpot对象内存布局
对象分为三部分：
1.  对象头Header
    - MarkWord：存储锁标记、hashcode、分代年龄、偏向线程ID等锁核心信息
    - Klass Word：指向类元数据，标识对象类型
2.  实例数据：类中成员变量
3.  对齐填充：补齐至8字节整数倍，无实际业务作用

## 二、MarkWord锁状态标识（32位）
| 锁类型 | 标识位state | 存储内容 |
| ---- | ---- | ---- |
| 无锁 | 01 | hashcode、分代age |
| 偏向锁 | 01 | 持有锁线程ID、epoch、age、biased_lock=1 |
| 轻量级锁 | 00 | 指向线程栈Lock Record指针 |
| 重量级锁 | 10 | 指向底层Monitor监视器指针 |
| GC标记 | 11 | 等待垃圾回收 |

## 三、Monitor监视器结构（重量级锁底层）
每个Java对象绑定一个Monitor，由C++实现：
1.  Owner：当前持有锁的线程，同一时刻仅一个线程
2.  EntryList：抢锁失败、处于BLOCKED阻塞的线程队列
3.  WaitSet：调用wait()释放锁、进入WAITING无限等待的线程集合

### 字节码层面
同步代码块：`monitorenter`加锁、`monitorexit`解锁（两处，正常执行与异常出口）；
同步方法：方法标记`ACC_SYNCHRONIZED`，隐式进出Monitor。

## 四、三种锁机制与锁升级（JDK1.6优化）
### 1. 偏向锁
适用场景：长期单一线程重复获取锁，无多线程竞争
- 首次加锁CAS写入当前线程ID到MarkWord
- 后续再次获取锁仅判断线程ID，无需重复CAS，开销极低
- 出现其他线程竞争时，撤销偏向，升级为轻量级锁

### 2. 轻量级锁
适用场景：多线程交替持有锁，无同一时刻竞争
加锁流程：
1.  线程栈创建Lock Record，保存对象MarkWord副本
2.  CAS尝试将对象MarkWord指向当前Lock Record，成功则获取轻量锁
3.  锁重入：新增Lock Record，内部标记null作为重入计数
4.  CAS失败代表并发冲突，直接膨胀为重量级锁

解锁流程：
1.  遍历栈内Lock Record，重入记录直接清空
2.  CAS恢复对象MarkWord；CAS失败触发锁膨胀

### 3. 重量级锁（传统Monitor锁）
适用场景：多线程同时竞争锁
- 依赖操作系统内核Monitor，存在用户态/内核态切换，上下文切换开销大
- 抢锁失败线程进入EntryList阻塞；持有锁线程调用wait()，线程移入WaitSet等待唤醒
- notify/notifyAll将WaitSet线程移回EntryList重新竞争锁

### 锁升级顺序（不可逆）
无锁 → 偏向锁 → 轻量级锁 → 重量级锁，锁只能升级，不能降级。

## 五、WaitSet与EntryList优先级问题
WaitSet内线程被notify唤醒后，只会被移动到EntryList尾部，**WaitSet线程没有更高优先级**，所有待竞争锁的线程统一在EntryList排队，遵循先进先出竞争规则；不存在WaitSet线程优先抢到锁的机制。

## 六、面试高频问题解析
1.  **问：synchronized底层是什么，Monitor由哪几部分组成？**

    **答：** synchronized底层依靠对象头MarkWord与Monitor监视器实现。Monitor包含三块：Owner记录当前持有锁线程；EntryList存放抢锁失败、BLOCKED状态线程；WaitSet存放调用wait()、WAITING状态的线程。

2.  **问：偏向锁、轻量级锁、重量级锁分别适用什么场景，升级流程？**

    **答：** 偏向锁适合单线程反复持锁；轻量级锁适合多线程交替持锁、无并发争抢；重量级锁适合多线程同时竞争锁。升级顺序不可逆：无锁→偏向锁→轻量级锁→重量级锁。

3.  **问：轻量级锁加锁与解锁的核心逻辑是什么？**

    **答：** 加锁在线程栈创建Lock Record，通过CAS修改对象MarkWord指向该记录；锁重入新增空标记Lock Record计数；CAS冲突直接膨胀重量级锁。解锁反向CAS恢复MarkWord，失败则膨胀。

4.  **问：WaitSet的线程唤醒后，优先级比EntryList线程高吗？**

    **答：** 不高。调用notify/notifyAll唤醒WaitSet中的线程后，该线程会被移入EntryList队列尾部，和其他阻塞线程公平排队竞争锁，不存在优先级优势。

5.  **问：重量级锁为什么性能差？**

    **答：** 重量级锁依赖操作系统内核Monitor，线程阻塞/唤醒需要切换用户态与内核态，触发线程上下文切换，CPU开销大；偏向锁、轻量级锁全程用户态CAS操作，无内核切换，性能更高。

6.  **问：同步代码块和同步方法字节码区别？**

    **答：** 同步代码块使用monitorenter、monitorexit指令显式加解锁；同步方法通过方法访问标记ACC_SYNCHRONIZED隐式关联Monitor，进入方法自动获取锁，退出自动释放。