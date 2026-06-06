import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './style.css'
import parallax from './parallax.js'

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx)
    parallax.enhanceApp(ctx)
  }
}
