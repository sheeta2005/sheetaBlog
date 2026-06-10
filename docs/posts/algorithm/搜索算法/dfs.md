---
title: DFS 深度优先搜索
date: 2026-06-09
tags: [Java, 算法, DFS, 深度优先搜索]
categories: [算法]
description: DFS 原理、模板、递归实现、回溯、常见题型
layout: doc
outline: deep
---

# DFS 深度优先搜索

## 一、什么是 DFS？
**DFS（Depth-First Search）**：**深度优先搜索**
- **一条路走到黑，走不通再回头**
- 先往深处走，走到底再回溯
- 用 **递归** 实现最方便

## 二、DFS 核心思想
1. **递归**：自己调用自己
2. **回溯**：走不通就回退一步
3. **剪枝**：提前排除不可能的情况
4. 适合：**遍历所有可能、找路径、组合、排列**

---

## 三、DFS 万能模板
```java
// DFS 通用模板
public void dfs(参数) {
    // 1. 递归终止条件（出口）
    if (满足结束条件) {
        记录结果 / 返回
        return;
    }

    // 2. 遍历所有可能的下一步
    for (所有可能选项) {
        if (选项合法 且 没访问过) {
            // 3. 做选择
            标记已访问 / 加入路径
            
            // 4. 递归往下走
            dfs(下一层参数);
            
            // 5. 撤销选择（回溯）
            取消标记 / 移出路径
        }
    }
}
```

---

## 四、最常考 3 类 DFS

### 1. 二叉树 DFS（前/中/后序遍历）
```java
// 二叉树前序遍历：根 → 左 → 右
public void dfs(TreeNode root) {
    if (root == null) return;
    
    // 处理根节点
    System.out.println(root.val);
    
    // 递归左子树
    dfs(root.left);
    
    // 递归右子树
    dfs(root.right);
}
```

---

### 2. 全排列（回溯 + DFS）
**题目**：给数组，输出所有排列
```java
List<List<Integer>> res = new ArrayList<>();
public List<List<Integer>> permute(int[] nums) {
    boolean[] used = new boolean[nums.length];
    dfs(nums, new ArrayList<>(), used);
    return res;
}

void dfs(int[] nums, List<Integer> path, boolean[] used) {
    // 终止：路径满了
    if (path.size() == nums.length) {
        res.add(new ArrayList<>(path));
        return;
    }

    for (int i = 0; i < nums.length; i++) {
        if (used[i]) continue;
        
        used[i] = true;
        path.add(nums[i]);
        
        dfs(nums, path, used); // 递归
        
        path.remove(path.size() - 1); // 回溯
        used[i] = false;
    }
}
```

---

### 3. 岛屿数量（网格 DFS）
**题目**：二维数组，1是陆地，0是水，求岛屿数量
```java
public int numIslands(char[][] grid) {
    int count = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == '1') {
                count++;
                dfs(grid, i, j); // 淹没整个岛屿
            }
        }
    }
    return count;
}

// DFS 淹没陆地
void dfs(char[][] grid, int i, int j) {
    // 越界 / 不是陆地 → 返回
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] == '0') {
        return;
    }

    grid[i][j] = '0'; // 标记已访问

    // 上下左右
    dfs(grid, i - 1, j);
    dfs(grid, i + 1, j);
    dfs(grid, i, j - 1);
    dfs(grid, i, j + 1);
}
```

---

## 五、DFS 要点
1. **递归 + 回溯**
2. 必须有**终止条件**
3. 必须**标记/取消标记**（防重复）
4. 适合：**遍历所有可能、路径、组合、排列、连通块**
5. 可以解决 BFS 能解决的大部分问题，但**不保证最短路径**

---

## 六、DFS vs BFS
| DFS 深度优先 | BFS 广度优先 |
|-------------|-------------|
| 递归/栈实现 | 队列实现 |
| 一条路走到底 | 一层一层走 |
| **回溯、组合、排列、连通块** | **最短路径、最少步数** |
| 代码简洁 | 代码稍复杂 |
| 数据大可能栈溢出 | 无栈溢出 |

---

### 总结
- **DFS = 递归 + 回溯 + 一条路走到底**
- 核心：**终止条件 → 选择 → 递归 → 撤销选择**
- 高频场景：**二叉树遍历、全排列、岛屿、连通块、路径搜索**