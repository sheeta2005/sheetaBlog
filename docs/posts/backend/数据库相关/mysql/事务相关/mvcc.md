---
title: mvcc
date: 2026-06-07
revised: 2026-10-10
tags: [数据库, MySQL, 事务并发]
categories: [后端技术]
description: MySQL 8.0 InnoDB 的版本链、Read View 可见性、RC/RR 快照读与当前读边界
layout: doc
outline: deep
---

# mvcc

## 一、MVCC 解决什么

MVCC 是多版本并发控制。本文以 **MySQL 8.0 InnoDB** 为基线，重点讨论 RC 与 RR 下的普通一致性非锁定读取。

它让读操作按快照访问可见版本，减少读写之间的互斥需求，但不代表所有读写都永不阻塞。写操作、锁定读取与元数据操作仍可能涉及锁。

## 二、版本链与隐藏字段

InnoDB 聚簇记录包含事务标识 `DB_TRX_ID` 和回滚指针 `DB_ROLL_PTR`。更新会生成必要的 undo 信息，支持回滚和访问旧版本。

`DB_ROW_ID` 是在需要隐藏聚簇索引时使用的行标识，不是每张有显式主键的表都必须用它作为主键。

读操作从当前记录开始，若当前版本不可见，则沿 undo 支持的历史信息寻找可见版本。undo 不是 redo：redo 主要支持崩溃恢复，不能把两个日志的职责混为一谈。

## 三、Read View 可见性规则

可用以下概念化字段理解视图；具体内部名称以对应版本实现为准：

- creator：创建视图的事务。
- active：创建视图时尚活跃的相关读写事务集合。
- min：集合中最小活跃事务标识。
- upper：创建视图时下一个可分配的事务标识边界。

| 某版本的事务标识 trx | 是否可见 |
| --- | --- |
| 等于 creator | 自己的修改可见 |
| 小于 min | 视图创建前已完成的相关事务版本可见 |
| 大于或等于 upper | 视图之后的事务版本不可见 |
| 在两者之间且位于 active | 当时未提交，不可见 |
| 在两者之间且不在 active | 当时已完成，可见 |

upper 不是简单把 active 最大值加一；边界判断是 **大于或等于**，不能漏掉等号。这个模型还需理解空活跃集合等实现细节，适合解释可见性而不是直接替代数据库源码。

## 四、RC 与 RR 的例子

A 第一次查询余额为 100；B 将余额更新为 120 并提交；A 再执行普通一致性读取。

RC 通常为每次一致性读取取得新的视图，第二次可看到 120。RR 通常复用首次一致性读取建立的视图，第二次仍看到相应旧版本 100。

RR 不是一执行 BEGIN 就一定立即建立快照；`WITH CONSISTENT SNAPSHOT` 等显式行为需另行区分。同一事务自己的修改也能被自己看到，因此不能说它永远只能读取开始时的原始值。

## 五、快照读与当前读

普通 SELECT 常属于快照读取；SELECT ... FOR UPDATE、UPDATE、DELETE 等使用相应的锁定或当前版本处理规则，不能无条件套用旧快照。

RR 下范围锁定读取的幻读防护涉及 next-key 等锁机制；一致性读取的稳定视图又是另一条路径。不能简单说“MVCC 单独解决所有类型的幻读”。

长事务可能保留旧视图，使历史版本不能及时 purge，导致 undo 与存储压力增长。应同时查看事务寿命与业务必要性。

## 六、面试简答与追问

**简答：** InnoDB 借助版本信息、undo 与 Read View 选择可见记录，RC 与 RR 的视图复用方式不同；锁定读和写操作有自己的锁规则。

**追问：RR 里更新后查询一定还读旧值吗？** 不是，自己的更新可见，当前读也不能简单按第一次快照判断。

## 参考资料

- [MySQL：多版本机制](https://dev.mysql.com/doc/refman/8.0/en/innodb-multi-versioning.html)
- [MySQL：一致性非锁定读取](https://dev.mysql.com/doc/refman/8.0/en/innodb-consistent-read.html)
- [MySQL：锁定读取](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html)
