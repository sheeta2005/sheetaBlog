---
title: BFS 广度优先搜索
date: 2026-06-09
tags: [Java, 算法, BFS, 广度优先搜索]
categories: [算法]
description: BFS 原理、模板、二叉树/图/迷宫最短路径实现
layout: doc
outline: deep
---

# BFS 广度优先搜索

## 一、什么是 BFS？
**BFS（Breadth-First Search）**：**广度优先搜索**
- 一层一层往外扩散
- **先访问离起点最近的节点**
- 天然适合求：**最短路径、最少步数**

## 二、BFS 核心特点
1. **用队列（Queue）实现**：先进先出
2. **一层一层遍历**
3. **能保证最短路径**（DFS 不能保证）
4. 不会递归爆栈

## 三、BFS 万能模板
```java
// BFS 标准模板
public void bfs(Node start) {
    // 1. 队列：存下一步要走的节点
    Queue<Node> queue = new LinkedList<>();
    // 2. 标记访问过（防重复/死循环）
    Set<Node> visited = new HashSet<>();
    
    queue.offer(start);
    visited.add(start);
    
    while (!queue.isEmpty()) {
        // 取出当前层节点
        Node curr = queue.poll();
        
        // 处理当前节点 curr
        
        // 把相邻节点加入队列
        for (Node next : curr.neighbors) {
            if (!visited.contains(next)) {
                queue.offer(next);
                visited.add(next);
            }
        }
    }
}
```

---

## 四、最常考 3 类 BFS

### 1. 二叉树层序遍历（最基础 BFS）
```java
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;

    Queue<TreeNode> q = new LinkedList<>();
    q.offer(root);

    while (!q.isEmpty()) {
        int size = q.size(); // 当前层节点数
        List<Integer> level = new ArrayList<>();

        for (int i = 0; i < size; i++) {
            TreeNode node = q.poll();
            level.add(node.val);

            if (node.left != null) q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        res.add(level);
    }
    return res;
}
```

---

### 2. 迷宫/网格最短路径
```java
public int shortestPath(int[][] grid) {
    int[] dx = {-1, 1, 0, 0};
    int[] dy = {0, 0, -1, 1};
    
    int m = grid.length, n = grid[0].length;
    boolean[][] visited = new boolean[m][n];
    Queue<int[]> q = new LinkedList<>();
    
    q.offer(new int[]{0, 0});
    visited[0][0] = true;
    int step = 0;
    
    while (!q.isEmpty()) {
        int size = q.size();
        
        for (int i = 0; i < size; i++) {
            int[] curr = q.poll();
            int x = curr[0], y = curr[1];
            
            // 到达终点
            if (x == m-1 && y == n-1) return step;
            
            // 四个方向
            for (int d = 0; d < 4; d++) {
                int nx = x + dx[d];
                int ny = y + dy[d];
                if (nx >=0 && nx<m && ny>=0 && ny<n && !visited[nx][ny] && grid[nx][ny]==0) {
                    q.offer(new int[]{nx, ny});
                    visited[nx][ny] = true;
                }
            }
        }
        step++; // 一层走完，步数+1
    }
    return -1; // 无法到达
}
```

---

### 3. 图的 BFS
```java
public void bfsGraph(int start, List<List<Integer>> graph) {
    Queue<Integer> q = new LinkedList<>();
    boolean[] visited = new boolean[graph.size()];
    
    q.offer(start);
    visited[start] = true;
    
    while (!q.isEmpty()) {
        int curr = q.poll();
        System.out.println(curr);
        
        for (int next : graph.get(curr)) {
            if (!visited[next]) {
                visited[next] = true;
                q.offer(next);
            }
        }
    }
}
```

---

## 五、BFS 关键词
- **队列**
- **一层一层**
- **最短路径 / 最少步数**
- **标记 visited 防重复**
- **时间 O(n)**，空间 O(n)

---

## 六、BFS vs DFS
|BFS|DFS|
|----|----|
|队列实现|栈/递归实现|
|一层一层|一条路走到底|
|**求最短路径**|**搜索所有情况**|
|不会爆栈|数据大可能爆栈|

---

### 总结
- **BFS = 队列 + 层序遍历 + 最短路径**
- **一层走一步**
- 适合：**最短路径、层序遍历、扩散类问题**
- 模板通用：队列 + 访问标记 + 遍历邻居