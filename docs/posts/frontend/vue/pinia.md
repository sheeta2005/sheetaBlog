# Pinia & Vue3 核心笔记
## 1. Pinia 简介与优势
- 提供更简单的API，去掉了 mutation
- 支持 Vue3 组合式 API 风格，语法统一
- 去掉 modules 概念，每个 store 都是独立模块
- 搭配 TypeScript 使用，提供可靠的类型推断

---

## 2. Vue3 核心基础
### ref() 函数
- 作用：将普通数据（数字、字符串、布尔）转为响应式数据
- 特点：JS 中需通过 `.value` 访问/修改，模板中无需写 `.value`
```js
import { ref } from 'vue'
const count = ref(0)
count.value++
```

### 组合式 API 风格
- 逻辑按功能聚合，而非按选项（data/methods/computed）拆分
- 所有相关数据、方法、计算属性可写在同一位置，便于维护与复用
```js
const count = ref(0)
const add = () => count.value++
const double = computed(() => count.value * 2)
```

### computed 计算属性
- 作用：根据已有数据自动计算新值，自动缓存
- 特点：依赖数据变化时才重新计算，只读不可直接修改
```js
import { computed } from 'vue'
const doubleCount = computed(() => count.value * 2)
```

### async/await 异步语法
- `async`：标记函数为异步函数，默认返回 Promise
- `await`：只能在 async 函数内使用，等待异步操作完成后再继续执行
```js
async function loadData() {
  const res = await fetch('/api/data')
  const data = await res.json()
}
```

### onMounted 生命周期钩子
- 作用：组件挂载完成后自动执行指定逻辑
- 用途：加载初始数据、调用接口、初始化操作
```js
import { onMounted } from 'vue'
onMounted(() => {
  console.log('组件已挂载')
  loadData()
})
```

### HTML 标签基础
- `<ul>`：无序列表标签，包裹列表整体
- `<li>`：列表项标签，代表列表中的每一项
```html
<ul>
  <li>列表项1</li>
  <li>列表项2</li>
</ul>
```

### JS 执行顺序
- 从上到下同步执行，按代码编写顺序依次执行

### 解构赋值
- 从对象/数组中快速提取数据，简化代码
```js
// 对象解构
const obj = { name: '张三', age: 18 }
const { name, age } = obj

// 数组解构
const arr = [10, 20]
const [a, b] = arr
```

---

## 3. Pinia 核心使用
### storeToRefs 响应式解构
- 作用：解构 Pinia Store 数据时，保持响应式结构，避免直接解构丢失响应式
```js
import { storeToRefs } from 'pinia'
const useStore = defineStore('storeId', {
  state: () => ({ count: 0 })
})
const store = useStore()
const { count } = storeToRefs(store)
```

### Pinia 异步操作
- 直接支持异步，无需额外配置，可在 actions 中使用 async/await
```js
const useStore = defineStore('storeId', {
  actions: {
    async fetchData() {
      const res = await fetch('/api/data')
      this.data = await res.json()
    }
  }
})
```

### Pinia 调试方法
- 安装 Vue Devtools 浏览器插件
- 在调试工具中查看所有 Store、实时数据、修改记录，支持时间旅行调试

---

## 4. 面试高频问题
1. **Pinia 是用来做什么的？**
   Pinia 是 Vue 的全局状态管理工具，用于多个组件之间共享和管理数据。

2. **Pinia 中还需要 mutation 吗？**
   不需要，Pinia 去掉了 mutation 概念，可直接修改 state 数据。

3. **Pinia 如何实现 getter？**
   Pinia 中可直接使用 `computed` 实现类似 Vuex 中 getter 的功能，或在 store 中定义 getters 属性。

4. **Pinia 产生的 Store 如何解构赋值数据保持响应式？**
   使用 `storeToRefs()` 对 Store 数据进行解构，可保持响应式结构。

---

## 5. Vuex vs Pinia 对比
| 特性 | Vuex | Pinia |
|------|------|-------|
| API 复杂度 | 高 | 低 |
| mutation | 必须 | 无 |
| 模块化 | 需配置 modules | 天然独立 |
| 组合式 API 支持 | 弱 | 完美支持 |
| TypeScript 支持 | 一般 | 优秀 |
| 调试体验 | 一般 | 友好 |
| 体积 | 较大 | 轻量 |