---
title: wait与sleep区别
date: 2026-06-15
tags: [Java, 多线程, wait, sleep]
categories: [后端技术]
description: wait与sleep共同点、核心差异及面试问答
layout: doc
outline: deep
---

# wait与sleep区别

## 一、共同点
wait()、wait(long)、sleep(long)都会让当前线程让出CPU执行权，进入阻塞等待状态，且都能被interrupt()打断抛出异常。

## 二、核心不同点
1.  **方法归属**
    sleep(long)是Thread类静态方法；wait()/wait(long)是Object实例方法，所有对象都拥有。
2.  **唤醒条件**
    sleep(long)只能等待指定时长后自动唤醒；
    wait(long)可超时自动唤醒，也能被notify/notifyAll提前唤醒；无参wait()若无唤醒则永久阻塞。
3.  **锁行为（重点）**
    wait必须写在synchronized同步代码内，调用后**释放当前对象锁**，其他线程可竞争该锁；
    sleep无同步锁强制要求，若处于同步块中睡眠，**不会释放持有的对象锁**。

## 三、面试高频问题解析
1.  **问：wait和sleep有哪些区别？**

    **答：** 第一，归属不同，sleep是Thread静态方法，wait是Object成员方法；第二，唤醒方式不同，sleep只能等时间结束，wait可被notify唤醒；第三，锁机制不同，wait必须持有锁且执行后释放锁，sleep不要求锁，持有锁时睡眠不会释放锁。

2.  **问：为什么wait方法要放在synchronized里面？**

    **答：** wait执行时会释放当前对象监视器锁，只有提前获取该对象锁才能执行释放操作，否则会直接抛出IllegalMonitorStateException。

3.  **问：同步代码块内调用sleep，其他线程能拿到锁吗？**

    **答：** 不能。sleep不会释放同步锁，线程睡眠期间锁持续被占用，其他线程无法进入该同步代码块。

4.  **问：sleep(0)和wait(0)效果一样吗？**

    **答：** 不一样。sleep(0)仅让出当前CPU时间片，不释放锁；wait(0)等价无参wait，会释放锁并无限等待，必须等待notify唤醒。