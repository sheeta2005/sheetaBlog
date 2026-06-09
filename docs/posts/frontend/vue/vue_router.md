# vue-router笔记
## 0. 前言
- 核心内容：vue-router 路由、路由懒加载、魔法注释、编程式导航、嵌套路由、Element-Plus 布局
- 难度：基础～中等
- 用途：Vue 项目页面跳转、多页面展示、后台布局管理

---

# 一、vue-router 是什么？
**根据浏览器地址栏路径，动态切换显示不同组件**
- 路径 `/` → 显示首页
- 路径 `/user` → 显示用户页
- 路径 `/order` → 显示订单页

不需要刷新页面，组件自动替换展示。

---

# 二、路由三要素
1. **VueRouter**：路由器，管理所有路由规则
2. **`<router-link>`**：路由链接 → 最终渲染成 `<a>` 标签
3. **`<router-view>`**：路由视图 → 路径匹配的组件在这里显示

---

# 三、路由懒加载（性能优化）
```js
component: () => import('../views/HomeView.vue')
```
- 访问时才加载组件
- 项目启动更快
- 打包体积更小

---

# 四、魔法注释 webpackChunkName
给打包后的文件起名
```js
() => import(/* webpackChunkName: "home" */ '../views/HomeView.vue')
```
打包后：
`home.js`

不加注释：
`132.js`

作用：方便调试、优化打包、可读性更高。

---

# 五、编程式路由跳转（JS 跳转）
```js
// 字符串
this.$router.push('/home')

// 对象
this.$router.push({ path: '/home' })

// 带名字（推荐）
this.$router.push({ name: 'Home' })
```

---

# 六、嵌套路由（最重点）
## 1. 是什么？
**页面里还有子页面，组件里套组件**
- 首页
    - 子页面 /home/p1
    - 子页面 /home/p2
    - 子页面 /home/p3

## 2. 配置 children
```js
const routes = [
  {
    path: '/container',
    component: ContainerView,
    children: [
      { path: 'p1', component: P1View },
      { path: 'p2', component: P2View },
      { path: 'p3', component: P3View }
    ]
  }
]
```

## 3. 父组件里必须写
```html
<router-view></router-view>
```
子页面会显示在这里。

---

# 七、Element-Plus 后台布局
Container 布局容器（最常用）
```html
<el-container>
  <el-aside>侧边栏</el-aside>
  <el-container>
    <el-header>顶部</el-header>
    <el-main>
      <router-view />  <!-- 子页面展示 -->
    </el-main>
  </el-container>
</el-container>
```

---

# 八、Vue3 注意点
- Vue3 **没有全局 Vue 对象**
- 所有东西用 `createApp()`
- 路由用 `createRouter`
- Element-Plus 用 `app.use()` 挂载

---

# 九、嵌套路由完整步骤
1. 创建父布局组件 `ContainerView.vue`
2. 创建子页面 `P1/P2/P3View.vue`
3. router/index.js 配置 `children`
4. 父布局中写 `<router-view>`
5. 侧边栏写 `<router-link>` 跳转

---

# 十、总结
- **vue-router**：路径切换组件
- **`<router-view>`**：组件显示位置
- **`<router-link>`**：跳转链接
- **懒加载**：访问时才加载
- **魔法注释**：给打包文件起名
- **编程式导航**：JS 代码跳转
- **嵌套路由 children**：页面里套页面
- **Element-Plus Container**：后台布局