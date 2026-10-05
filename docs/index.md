---
layout: home

hero:
  name: sheeta1998
  text: 寻找 Java 后端实习
  tagline: 大三在读 · Java / Spring Boot / MySQL / Redis<br>从业务需求到代码实现，记录技术取舍、问题排查与测试验证。
  image:
    src: /avatar.jpg
    alt: sheeta1998 的二次元头像
  actions:
    - theme: brand
      text: 查看项目实践
      link: /projects/
    - theme: alt
      text: 关于我与联系
      link: /about
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/sheeta2005

features:
  - icon: 🏡
    title: 项目一 · takeMe 社区助老平台
    details: 围绕老人、志愿者、管理员的服务流程，实践幂等建单、订单状态约束、Outbox 通知与 SQL 优化。
    link: /projects/takeme
    linkText: 了解业务设计与验证
  - icon: 🚦
    title: 项目二 · Redis 限流 Starter
    details: 基于 Redis + Lua 的固定窗口限流组件，探索 Spring Boot 自动配置、AOP 与 SpEL 动态限流维度。
    link: /projects/rate-limiter
    linkText: 了解组件实现与边界
---

## 精选工程复盘

- **[一次突发压测失败后的排查](/articles/loadtest)**：从延迟、错误、GC 与通知积压分析问题，区分目标负载和实际容量。
- **[从 N+1 查询到批量装配](/articles/sql-optimization)**：对比查询次数、索引与冷缓存回源，记录优化后的短测结果。
- **[订单通知为什么使用 Outbox](/articles/outbox)**：梳理数据库提交、消息重试与消费去重的关系。

每篇文章都标明项目版本、证据来源和验证范围，保留失败结果与尚未完成的验证。

## 我的学习笔记

这里也保留算法题解、后端基础、前端学习与大学课程记录。项目实践之外的知识整理，可以从 **[学习笔记导航](/notes/)** 继续阅读。

## 联系我

正在寻找 Java 后端开发实习，欢迎围绕项目实现与技术取舍交流。

- GitHub：[sheeta2005](https://github.com/sheeta2005)
- 邮箱：[2169298883@qq.com](mailto:2169298883@qq.com)
- 微信：sheeta1998

---

> 学习记录会持续修订，如有错误欢迎指正。
