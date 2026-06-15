---
title: 单例bean是否线程安全
date: 2026-06-08
tags: [Java, Spring, Bean, 线程安全]
categories: [后端技术]
description: Spring单例Bean的线程安全问题及相关概念
layout: doc
outline: deep
---

# 单例bean是否线程安全

## 一、核心基础
在Spring中，Bean是由Spring IoC容器管理的对象实例。
Bean的作用域：
- singleton：bean在每个Spring IOC容器中只有一个实例（默认）
- prototype：一个bean的定义可以有多个实例

示例代码：
```java
@Service
@Scope("singleton")
public class UserServiceImpl implements UserService {
}
```

---

## 二、核心问题结论
Spring框架中的单例bean**不是线程安全的**。
- Spring框架中有一个`@Scope`注解，默认的值就是singleton，即单例。
- 一般在Spring的bean中都是注入无状态的对象，没有线程安全问题；如果在bean中定义了可修改的成员变量，就需要考虑线程安全问题。
- 形参没有线程安全问题，因为形参是方法局部变量，线程间相互隔离。

---

## 三、解决思路
- 保持Bean无状态，避免定义可修改的成员变量
- 使用prototype多例作用域
- 对共享成员变量加锁或使用线程安全容器

---

## 面试相关问题
1.  **问：Spring框架中的单例bean是线程安全的吗？**
    **答：** 不是线程安全的。Spring的单例bean本身不具备线程安全特性，是否安全取决于bean是否包含可修改的成员变量。如果bean是无状态的（仅使用形参和局部变量），则不存在线程安全问题；如果存在可修改的成员变量，多线程并发访问时会出现线程安全问题。

2.  **问：什么是无状态？为什么无状态的bean是线程安全的？**
    **答：** 无状态指bean中没有可被多个线程共享修改的成员变量，所有数据都存储在方法的局部变量或形参中。因为每个线程调用方法时，局部变量和形参都会在各自的栈帧中创建，线程间相互隔离，不存在共享数据的竞争，所以无状态的bean是线程安全的。

3.  **问：单例bean线程安全问题如何解决？**
    **答：** 可以通过三种方式解决：
    1.  保持bean无状态，不定义可修改的成员变量；
    2.  将bean的作用域改为prototype，每次请求创建新的实例；
    3.  对共享的成员变量使用锁机制或线程安全容器（如ConcurrentHashMap）。