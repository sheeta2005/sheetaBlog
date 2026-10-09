---
layout: home

hero:
  name: sheeta1998
  text: 寻找 Java 后端实习
  tagline: <span class="hero-identity">大三在读 · Java 后端开发</span><span class="hero-stack"><span>Java</span><span>Spring Boot</span><span>MySQL</span><span>Redis</span></span><span class="hero-intro">从业务需求到代码实现，记录技术取舍、问题排查与测试验证。</span>
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

<!-- 首页按阅读顺序分区，文章标题与摘要分行，方便快速浏览。 -->
<section class="home-panel home-recaps" aria-labelledby="home-recaps-title">
  <div class="home-panel-heading">
    <h2 id="home-recaps-title">精选工程复盘</h2>
    <a href="/articles/">全部文章 →</a>
  </div>
  <p class="home-section-description">记录实现过程、技术取舍与验证边界，保留失败结果和待验证的问题。</p>
  <ul class="home-article-list">
    <li>
      <a href="/articles/loadtest">
        <strong>一次突发压测失败后的排查</strong>
        <span>从延迟、错误、GC 与通知积压分析问题，区分目标负载和实际容量。</span>
      </a>
    </li>
    <li>
      <a href="/articles/sql-optimization">
        <strong>从 N+1 查询到批量装配</strong>
        <span>对比查询次数、索引与冷缓存回源，记录优化后的短测结果。</span>
      </a>
    </li>
    <li>
      <a href="/articles/outbox">
        <strong>订单通知为什么使用 Outbox</strong>
        <span>梳理数据库提交、消息重试与消费去重的关系。</span>
      </a>
    </li>
  </ul>
</section>

<!-- 桌面并排展示辅助入口，窄屏自动变为上下排列。 -->
<div class="home-bottom-grid">
  <section class="home-panel home-notes" aria-labelledby="home-notes-title">
    <h2 id="home-notes-title">我的学习笔记</h2>
    <p>保留算法题解、后端基础、前端学习与大学课程记录，也记录项目实践之外的知识整理。</p>
    <a class="home-panel-link" href="/notes/">浏览学习笔记 →</a>
  </section>
  <section class="home-panel home-contact" aria-labelledby="home-contact-title">
    <h2 id="home-contact-title">联系我</h2>
    <p>正在寻找 Java 后端开发实习，欢迎围绕项目实现与技术取舍交流。</p>
    <dl>
      <div><dt>GitHub</dt><dd><a href="https://github.com/sheeta2005">sheeta2005</a></dd></div>
      <div><dt>邮箱</dt><dd><a href="mailto:2169298883@qq.com">2169298883@qq.com</a></dd></div>
      <div><dt>微信</dt><dd>sheeta1998</dd></div>
    </dl>
  </section>
</div>

<p class="home-closing-note">学习记录会持续修订，如有错误欢迎指正。</p>
