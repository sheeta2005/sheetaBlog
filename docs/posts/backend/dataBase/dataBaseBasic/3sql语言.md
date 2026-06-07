# SQL基础笔记

---

## 一、字符匹配与空值查询
### 1. 字符匹配（`LIKE`）
- 通配符：
    - `%`：代表任意长度（包括0个字符）的字符串
    - `_`：代表任意单个字符
- 示例：查询名字中第2个字为“阳”的学生姓名和学号
```sql
SELECT Sname, Sno 
FROM Student 
WHERE Sname LIKE '_阳%';
```

### 2. 空值查询（`IS NULL` / `IS NOT NULL`）
- 注意：**空值必须用 `IS NULL` 或 `IS NOT NULL` 查询，不能用 `=` 代替**
- 示例：查询缺少成绩的学生的学号和课程号
```sql
SELECT Sno, Cno 
FROM SC 
WHERE Grade IS NULL;
```

---

## 二、多重条件查询与排序（`AND/OR` / `ORDER BY`）
### 1. 多重条件查询
- 逻辑运算符：`AND`（优先级高于`OR`）、`OR`、`NOT`
- 示例1：查询计算机系年龄在20岁以下的学生姓名
```sql
SELECT Sname 
FROM Student 
WHERE Sdept='CS' AND Sage<20;
```
- 示例2：查询计算机系（CS）、数学系（MA）、信息系（IS）学生的姓名和性别
```sql
SELECT Sname, Ssex 
FROM Student 
WHERE Sdept='CS' OR Sdept='MA' OR Sdept='IS';
```

### 2. 排序（`ORDER BY`）
- 语法：`ORDER BY 列名 [ASC|DESC]`，默认`ASC`（升序）
- 可按多个属性列排序，优先级从左到右

---

## 三、聚集函数与分组（`GROUP BY`）
### 1. 常用聚集函数
| 函数 | 说明 |
| :--- | :--- |
| `COUNT(*)` | 统计元组个数 |
| `SUM(列名)` | 计算列值的总和 |
| `AVG(列名)` | 计算列值的平均值 |
| `MAX(列名)` | 求列值的最大值 |
| `MIN(列名)` | 求列值的最小值 |

- 示例：查询学生总人数
```sql
SELECT COUNT(*) FROM Student;
```

### 2. `GROUP BY` 分组
- 作用：按指定列对数据进行分组，聚集函数将作用于每个组
- 注意：`SELECT`后的列名，要么是`GROUP BY`的分组列，要么是聚集函数

---

## 四、多表连接查询
- 作用：从多个表中关联查询数据
- 核心：通过公共列建立连接条件，否则会产生笛卡尔积
- 示例：查询选修2号课程且成绩在90分以上的学生学号和姓名
```sql
SELECT Student.Sno, Sname 
FROM Student, SC 
WHERE Student.Sno=SC.Sno AND SC.Cno='2' AND SC.Grade>90;
```

---

## 五、集合运算
- 并运算：`UNION`（合并两个查询结果，自动去重）
- 交运算：`INTERSECT`（取两个查询结果的交集）
- 差运算：`EXCEPT`（取第一个查询结果中，不在第二个查询结果中的记录）
- 示例：查询计算机系的学生及年龄不大于19岁的学生
```sql
SELECT * FROM Student WHERE Sdept='CS'
UNION
SELECT * FROM Student WHERE Sage<=19;
```

---

## 课程小结与避坑要点
1.  **建表约束**：`NOT NULL`、`UNIQUE`、`CHECK`是列级约束高频考点。
2.  **增删改查**：`INSERT`、`UPDATE`、`DELETE`、`SELECT`语法必须记牢，`WHERE`条件是关键。
3.  **索引**：创建索引的语法，以及聚簇索引和唯一索引的区别。
4.  **查询语法**：`SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ...`的执行顺序和各子句作用。
5.  **连接查询避坑**：必须正确指定连接条件，否则会产生笛卡尔积，导致结果错误。