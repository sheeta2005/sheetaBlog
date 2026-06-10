---
title: mvcc
date: 2026-06-07
tags: [数据库, MySQL, 事务并发]
categories: [后端技术]
description: 多版本并发控制（MVCC）的核心概念与实现原理
layout: doc
outline: deep
---

# mvcc

## 一、定义
多版本并发控制（MVCC），通过维护数据的多个版本，实现读写不阻塞，提升并发性能。

---

## 二、核心依赖
### 1. 隐藏字段
- `trx_id`：记录修改该数据的事务ID
- `roll_pointer`：指向前一个版本的undo log地址

### 2. undo log
- 存储数据修改前的版本
- 多个版本通过`roll_pointer`形成版本链

### 3. ReadView
快照读的访问规则，包含：
- `m_ids`：当前活跃事务集合
- `min_trx_id`：最小活跃事务ID
- `max_trx_id`：预分配事务ID（当前最大ID+1）
- `creator_trx_id`：创建ReadView的事务ID

---

## 三、访问规则
1.  `trx_id == creator_trx_id`：可访问（当前事务修改）
2.  `trx_id < min_trx_id`：可访问（数据已提交）
3.  `trx_id > max_trx_id`：不可访问（ReadView创建后开启的事务）
4.  `min_trx_id <= trx_id <= max_trx_id`：若`trx_id`不在`m_ids`中则可访问

---

## 四、隔离级别差异
- **Read Committed（RC）**：每次快照读生成新ReadView
- **Repeatable Read（RR）**：事务中首次快照读生成ReadView，后续复用

---

## 五、面试要点
- MVCC核心：版本链+ReadView，实现读写不阻塞
- RC与RR的区别：ReadView生成时机不同
- 作用：解决并发读一致性问题，避免加锁阻塞