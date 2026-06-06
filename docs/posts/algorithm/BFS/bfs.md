# 跳跃游戏 III（BFS解法 + BFS算法讲解 + 模板）

## 一、BFS 算法讲解（以本题为例）
### 1. 什么是 BFS？
BFS（广度优先搜索），是一种**按层遍历**的搜索算法，就像水波一样从起点一圈一圈向外扩散，直到找到目标或者遍历完所有节点。

在本题中，每个下标就是一个节点，从 `start` 开始，每一步能跳的两个位置就是它的邻居节点。

### 2. BFS 核心要素
- **队列（Queue）**：用来存“待处理的节点”，先进先出，保证按层处理
- **访问标记（visited）**：防止走回头路、死循环
- **出队处理**：取出队首节点，判断是否找到目标
- **入队扩展**：把当前节点的合法邻居节点加入队列

### 3. 本题的 BFS 流程
1.  把 `start` 加入队列，标记为已访问
2.  循环从队列里取出下标：
    - 若当前 `arr[index] == 0`，直接返回 `true`
    - 计算两个可跳位置 `index + arr[index]` 和 `index - arr[index]`
    - 位置合法且未访问过，标记访问并加入队列
3.  队列为空仍未找到 0，返回 `false`

---

## 二、BFS 最常见的代码模板（Java）
BFS 通用模板（以图/矩阵遍历为例）：
```java
import java.util.LinkedList;
import java.util.Queue;

public class BfsTemplate {
    public void bfsExample(int[][] grid, int startX, int startY) {
        int rows = grid.length;
        int cols = grid[0].length;
        boolean[][] visited = new boolean[rows][cols];
        Queue<int[]> queue = new LinkedList<>();

        // 起点入队
        queue.offer(new int[]{startX, startY});
        visited[startX][startY] = true;

        // 方向数组（上下左右）
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};

        while (!queue.isEmpty()) {
            int[] curr = queue.poll();
            int x = curr[0];
            int y = curr[1];

            // 处理当前节点（如判断是否是目标）
            // if (grid[x][y] == target) return;

            // 扩展邻居
            for (int[] dir : dirs) {
                int nx = x + dir[0];
                int ny = y + dir[1];
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && !visited[nx][ny]) {
                    visited[nx][ny] = true;
                    queue.offer(new int[]{nx, ny});
                }
            }
        }
    }
}
```

---

## 三、BFS 常见应用场景
1.  **图/矩阵的最短路径**（如迷宫、网格问题）
2.  **层序遍历**（二叉树的层次遍历）
3.  **状态转移问题**（如本题的跳跃游戏、单词接龙）
4.  **多源 BFS**（如腐烂的橘子、岛屿问题）

---

## 四、复杂度分析（本题）
- **时间复杂度**：$O(n)$，每个下标最多入队一次
- **空间复杂度**：$O(n)$，队列和访问数组最多占用数组长度的空间

---

## 五、核心要点总结
- BFS 用**队列**实现，按层遍历，适合找最短路径/目标
- 必须用 `visited` 标记访问，避免死循环
- 本题中，每个节点只有两个邻居，BFS 天然适合这种状态转移问题
- BFS 模板固定，掌握后可以套用到几乎所有图/矩阵/状态转移题目中