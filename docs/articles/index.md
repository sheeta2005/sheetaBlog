---
title: 精选工程复盘
description: 从真实项目中的失败、诊断、设计取舍与验证结果展开的工程复盘。
---

# 精选工程复盘

这里收录与求职项目直接相关的实践记录。每篇文章从具体问题出发，说明采用什么方案、有什么证据，以及结论适用于哪些条件。

## 性能与问题排查

<!-- 整行文章入口统一展示标题与摘要，键盘聚焦时也能清楚识别目标。 -->
<div class="article-reading-list">
  <a href="./loadtest.html"><span class="article-list-title">一次突发压测失败后的排查</span><span class="article-list-description">建立负载模型，结合延迟、错误、GC、数据库与消息积压识别问题。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
  <a href="./sql-optimization.html"><span class="article-list-title">从 N+1 查询到批量装配</span><span class="article-list-description">查询次数、索引、聚合与并发冷回源的优化和短测复盘。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
</div>

## 业务正确性与技术取舍

<div class="article-reading-list">
  <a href="./outbox.html"><span class="article-list-title">订单通知为什么使用 Outbox</span><span class="article-list-description">事务提交、发送确认、重试和消费去重之间的边界。</span><span class="article-list-arrow" aria-hidden="true">→</span></a>
</div>

## 阅读约定

文章整理自截至 2026 年 10 月 5 日的 takeMe 本地代码与既有文档。引用数据来自项目保存的测试记录；单次诊断耗时、短测结果、持续测试结果分别说明，不合并成未经验证的线上结论。

更多基础知识和练习见 [学习笔记](/notes/)，项目全貌见 [项目实践](/projects/)。
