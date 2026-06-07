# Redis主从复制（PSYNC2.0）全量+增量同步笔记
## 一、基础概念
### 1. replid（复制ID）
主节点唯一数据集标识，从节点初次同步继承主节点`replid`；**replid一致=属于同一个主数据集**，用于区分是否同源主库。
### 2. offset（复制偏移量）
主节点每执行一条写命令，`offset`自增；从节点同步完数据记录自身`offset`。
- 从`offset < 主offset`：从库数据滞后，需要补发数据
- `offset相等`：主从数据一致
### 3. repl_backlog（复制积压缓冲区）
主节点环形缓冲区，缓存近期已执行的写命令；**增量同步依赖此缓冲区**，固定大小可配置，缓冲区满会丢弃头部旧数据。

## 二、全量同步（首次建立主从、无法增量时触发）
> 适用：从节点第一次执行`replicaof`挂载主库、replid不一致、从offset超出repl_backlog范围
1. **Slave**：执行`replicaof ip port`，与Master建立TCP长连接
2. **Slave**：发送`PSYNC replid offset`请求同步（首次无记录，replid/offset默认特殊值）
3. **Master**：校验replid，判定为新从机，返回主库真实`replid`+当前`offset`
4. **Slave**：本地保存主库的`replid、offset`版本信息
5. **Master**：后台执行`BGSAVE`，在子进程生成全量`dump.rdb`快照文件
6. **Master**：RDB生成期间，新写入命令全部存入`repl_backlog`缓存
7. **Master**：通过TCP把完整RDB二进制文件发送给Slave
8. **Slave**：清空自身原有所有数据，加载落地的RDB文件，恢复全量数据
9. **Master**：读取`repl_backlog`中RDB生成期间缓存的增量命令，批量下发
10. **Slave**：依次执行收到的增量命令，补齐RDB落盘后新增数据，全量同步完成

## 三、增量同步（从节点重启/短暂离线，优先触发）
> 前置条件：从库`replid和主一致` && `从offset还在repl_backlog缓冲区范围内`
1. **Slave**：重启后自动和Master重建连接
2. **Slave**：携带本地保存的`replid、offset`发送`PSYNC replid offset`
3. **Master**：比对replid：一致，判定同源；再核对offset位置
4. **Master**：返回`+CONTINUE`，代表走增量同步
5. **Master**：从`repl_backlog`中截取**大于从offset**的所有增量写命令
6. **Master**：逐条下发截取的增量命令
7. **Slave**：执行全部下发命令，补齐滞后数据，增量同步结束

## 四、同步失败降级规则
1. replid不一致：**强制走全量同步**
2. replid一致，但从offset < repl_backlog起始偏移（数据已被缓冲区丢弃）：**降级全量同步**

## 五、复杂度&优缺点总结
### 全量同步
- 优点：数据100%完整落地，新从节点必备
- 缺点：`BGSAVE`消耗主CPU、RDB传输占用带宽，大数据量耗时高
### 增量同步
- 优点：只补发缺失命令，无RDB生成传输，性能损耗极低
- 缺点：依赖`repl_backlog`缓冲区，缓冲区配置过小会频繁触发全量同步

## 六、补充：PSYNC2.0优化点
1. 统一`PSYNC`一套命令，兼容全量+增量两种场景（旧版SYNC只能全量）
2. 引入replid+offset机制，实现断线快速增量续同步，大幅减少全量同步频次ss