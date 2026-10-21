---
layout: home

hero:
  name: sheeta1998
  text: 寻找 Java 后端实习
  tagline: <span class="hero-identity">大三在读 · Java 后端开发</span><span class="hero-stack"><span>Java</span><span>Spring Boot</span><span>MySQL</span><span>Redis</span><span>RabbitMQ</span><span>MyBatis</span></span><span class="hero-intro">从业务需求到代码实现，记录技术取舍、问题排查与测试验证。</span>
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
    details: 基于 Redis + Lua 的双窗口限流组件，实践条件自动配置、AOP 与 SpEL 业务维度，以及放行和拒绝的故障策略。
    link: /projects/rate-limiter
    linkText: 了解组件实现与边界
---

<script setup>
import FeaturedArticles from './.vitepress/theme/FeaturedArticles.vue'
</script>

<!-- 首页精选与总览共用分类入口，数量随文章标精状态更新。 -->
<section class="home-panel home-recaps" aria-labelledby="home-recaps-title">
  <div class="home-panel-heading">
    <h2 id="home-recaps-title">精选文章</h2>
    <a href="/articles/">浏览全部分类 →</a>
  </div>
  <p class="home-section-description">按分类阅读项目复盘、技术笔记与随笔中的精选内容。</p>
  <FeaturedArticles />
</section>

<!-- 桌面并排展示辅助入口，窄屏自动变为上下排列。 -->
<div class="home-bottom-grid">
  <section class="home-panel home-notes" aria-labelledby="home-notes-title">
    <h2 id="home-notes-title">后端专栏</h2>
    <p>后端基础的知识整理。</p>
    <a class="home-panel-link" href="/posts/backend/">浏览后端专栏 →</a>
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
