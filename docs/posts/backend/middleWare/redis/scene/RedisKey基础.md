# Redis Key 基础（补充进Redis笔记）
## 1、定义
Redis是**KV键值数据库**，`key`就是索引名称，`value`是存的数据。
格式：`key = value`，靠key去查找对应数据。

示例：
`article:123 = {"id":123,"title":"热门文章"}`
- `article:123` → **key**
- 后面JSON内容 → value

## 2、热点Key含义延伸
被高频查询的key就是**热点key**，比如`goods:666`爆款商品，每秒大量查询。

## 3、和缓存击穿关联
热点key过期 → Redis查不到这个key的数据 → 大批请求去查DB → **缓存击穿**。

## 4、项目命名规范
一般用`业务:id`格式：
- 商品：`goods:1001`
- 用户：`user:520`
- 文章：`article:123`
