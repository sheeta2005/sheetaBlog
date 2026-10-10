import DefaultTheme from 'vitepress/theme'
import ThemeLayout from './ThemeLayout.vue'
import ArticleMeta from './ArticleMeta.vue'
import './custom.css'
import './style.css'
import './summer.css'
import './reading.css'
import './games/games.css'
import parallax from './parallax.js'
import client from './client.js'

export default {
  ...DefaultTheme,
  // 自定义布局承接原有插槽，并为默认主题切换入口提供动画。
  Layout: ThemeLayout,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    ctx.app.component('ArticleMeta', ArticleMeta)
    parallax.enhanceApp(ctx)
    client.enhanceApp(ctx)
  }
}
