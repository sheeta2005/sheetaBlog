# Vue 笔记：Vuex 状态管理（完整极简版）
## 0. 前言
- 核心：Vuex 是 Vue **全局状态管理库**
- 作用：**多组件共享数据、统一管理数据**
- 适用：用户信息、购物车、全局配置、订单状态等

---

# 一、安装命令
```bash
npm install vuex@next --save
```

---

# 二、Vuex 核心概念（必背）
1. **state**
   定义**共享数据**
2. **mutations**
   定义**同步修改数据**的方法
3. **actions**
   定义**异步操作**，调用 mutations
4. **getters**
   对 state 数据加工（类似计算属性）

---

# 三、Vuex 固定结构（store/index.js）
```js
import Vuex from 'vuex'

export default Vuex.createStore({
  // 1. 共享数据
  state: {
    count: 0,
    username: ""
  },

  // 2. 同步修改 state
  mutations: {
    SET_COUNT(state, num) {
      state.count = num
    },
    SET_USER(state, name) {
      state.username = name
    }
  },

  // 3. 异步操作
  actions: {
    asyncSetCount({ commit }, num) {
      setTimeout(() => {
        commit('SET_COUNT', num)
      }, 1000)
    }
  },

  // 4. 加工数据
  getters: {
    doubleCount(state) {
      return state.count * 2
    }
  }
})
```

---

# 四、使用共享数据（组件中）
## 1. 获取数据
```js
this.$store.state.count
this.$store.state.username
```

## 2. 调用 mutations（同步修改）
```js
this.$store.commit('SET_COUNT', 100)
```

## 3. 调用 actions（异步修改）
```js
this.$store.dispatch('asyncSetCount', 200)
```

## 4. 使用 getters
```js
this.$store.getters.doubleCount
```

---

# 五、Vuex 流程（必背）
1. 组件 **dispatch** 调用 actions
2. actions **commit** 调用 mutations
3. mutations **修改 state**
4. state 改变 → 所有使用数据的组件**自动更新**

---

# 六、Vuex 核心规则（面试必问）
- **state 只读，不能直接改**
- **修改必须走 mutations**
- **mutations 必须同步**
- **异步操作必须放在 actions**
- **数据共享、响应式、所有组件可访问**

---

# 七、一句话总结
- **state：存数据**
- **mutations：改数据（同步）**
- **actions：异步处理，调用 mutations**
- **commit → 调用 mutations**
- **dispatch → 调用 actions**