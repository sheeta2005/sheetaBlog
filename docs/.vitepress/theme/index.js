import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import ReadingSettings from './ReadingSettings.vue'
import './custom.css'
import './style.css'
import parallax from './parallax.js'
import client from './client.js'

export default {
  ...DefaultTheme,
  // 借用默认主题的导航插槽，全站共享同一个阅读设置入口。
  Layout: () => h(DefaultTheme.Layout, null, {
    'nav-bar-content-after': () => h(ReadingSettings),
    // 项目区块复用默认卡片，只补充统一的标题与总览入口。
    'home-features-before': () => h('div', { class: 'home-section-heading' }, [
      h('h2', '项目实践'),
      h('a', { href: '/projects/' }, '全部项目 →')
    ])
  }),
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    parallax.enhanceApp(ctx)
    client.enhanceApp(ctx)
  }
}
