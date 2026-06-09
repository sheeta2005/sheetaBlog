# Vue 前端核心笔记
## 跨域 + Vite 代理 + Vue 基础 + Axios 全套笔记

---

# 一、跨域
**学科主题：浏览器安全策略 → 同源策略（Same-Origin Policy）**
属于 **前端网络 / HTTP 协议 / 浏览器安全** 范畴。

---

# 二、什么是跨域？（最直白版）
## 1. 同源策略
浏览器规定：
**前端所在的 协议、域名、端口 必须和后端完全一样，才能直接请求数据。**

只要有一个不一样，就是 **跨域**。

## 2. 什么时候跨域？
前端：`http://localhost:5173`（Vue/Vite 启动的）
后端：`http://localhost:8080`（SpringBoot）

**端口不同 → 跨域！**

浏览器就会报错：
```
No Access-Control-Allow-Origin
```
意思：后端不允许你访问。

---

# 三、为什么前端不能直接请求后端接口？
因为 **浏览器的安全限制**，不是后端不让你访问，是浏览器拦截！

目的：
- 防止恶意网站偷用户信息
- 防止 CSRF 攻击
- 保护接口不被随意调用

**不是后端问题，是浏览器安全规则。**

---

# 四、怎么解决跨域？（前端最常用：Vite 配置代理）
## 1. 什么是代理？
前端不直接请求后端
→ **让 Vite 开发服务器帮你转发请求**
→ 浏览器认为是同源，不拦截

## 2. vite.config.js 配置代理（固定写法）
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],

    // 代理配置
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080', // 后端地址
                changeOrigin: true,             // 开启跨域
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})
```

## 3. 作用
前端请求 `/api/xxx`
→ 自动转发到 `http://localhost:8080/xxx`
→ **跨域问题解决**

---

# 五、Vue 最基础使用（必背）
## 1. Vue 组件结构
```vue
<template>
  <!-- 页面结构 -->
  <div> 根元素只能有一个 </div>
</template>

<script>
  export default {
    data() {
      return {
        // 数据
      }
    }
  }
</script>

<style>
  /* 样式 */
</style>
```

---

# 六、Vue 最常用指令（必背）
## 1. 文本插值
```vue
{{ name }}
```

```js
data() {
    return {
        name: "张三"
    }
}
```

---

## 2. 属性绑定（v-bind）
完整写法：
```vue
<img v-bind:src="imgUrl">
<input v-bind:value="msg">
```

简写：
```vue
<img :src="imgUrl">
<input :value="msg">
```

---

## 3. 事件绑定（v-on）
完整写法：
```vue
<button v-on:click="handleClick">按钮</button>
```

简写：
```vue
<button @click="handleClick">按钮</button>
```

```js
methods: {
  handleClick() { }
}
```

---

## 4. 双向绑定（表单 v-model）
```vue
<input v-model="keyword">
```

---

## 5. 条件渲染
```vue
<div v-if="type === 1">显示1</div>
<div v-else-if="type === 2">显示2</div>
<div v-else>显示3</div>
```

---

## 6. 列表渲染
```vue
<div v-for="item in list" :key="item.id">
  {{ item.name }}
</div>
```

---

# 七、Axios 网络请求（Vue 最常用）
## 1. 是什么？
**基于 Promise 的网络请求库**
前端专门用来调用后端接口。

---

## 2. 常用方法
```js
axios.get(url)
axios.post(url, data)
axios.put(url, data)
axios.delete(url)
```

---

## 3. 统一写法（最通用）
```js
axios({
  method: 'post',
  url: '/api/user/login',
  data: {
    username: '',
    password: ''
  }
})
.then(res => {})
.catch(err => {})
```

---

# 八、Axios 最常用完整示例
```js
axios.get("/api/order/list")
.then(res => {
  console.log(res.data)
})
.catch(err => {
  console.log(err)
})
```

---

# 九、今天所有知识总结
1. **跨域**：浏览器同源策略导致，前端不能直接访问不同端口/域名的后端
2. **解决方式**：Vite 配置 `proxy` 代理
3. **Vue 组件**：`<template>` + `<script>` + `<style>`
4. **常用指令**：`{{}}` `v-bind/:属性` `v-on/@事件` `v-model` `v-if` `v-for`
5. **Axios**：前端请求后端接口工具