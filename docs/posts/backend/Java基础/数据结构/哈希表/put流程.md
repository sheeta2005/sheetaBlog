---
title: put流程
date: 2026-06-11
tags: [Java, HashMap, 源码分析, put流程]
categories: [后端技术]
description: HashMap的put方法完整流程、源码属性与扩容机制详解
layout: doc
outline: deep
---

# put流程

## 一、核心属性与初始化
### 1. 基础属性
```java
// 默认初始容量：16（2的幂）
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4;
// 默认加载因子：0.75
static final float DEFAULT_LOAD_FACTOR = 0.75f;
// 存储数据的数组
transient HashMap.Node<K,V>[] table;
// 元素数量
transient int size;
// 扩容阈值：数组容量 × 加载因子
int threshold;
```

### 2. 节点结构
```java
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    V value;
    HashMap.Node<K,V> next;
}
```

### 3. 初始化机制
HashMap采用**懒加载**，创建对象时不初始化数组，仅设置默认加载因子0.75，第一次调用`put()`时才初始化数组（容量16）。

---

## 二、put方法完整流程
1.  **初始化/扩容数组**：判断`table`是否为空或`null`，若是则调用`resize()`初始化数组（默认容量16）
2.  **计算数组下标**：通过`key.hashCode()`和`hash()`扰动函数计算哈希值，再通过`(n - 1) & hash`确定数组索引
3.  **直接插入节点**：若`table[i] == null`，直接创建新节点插入该位置
4.  **处理下标位置冲突**：
    - 若`table[i]`的首节点key与当前key相同，直接覆盖value
    - 若`table[i]`是红黑树节点，直接在红黑树中插入键值对
    - 若`table[i]`是链表，遍历链表：
        - 找到相同key则覆盖value
        - 未找到则在链表尾部插入新节点，插入后判断链表长度是否≥8，若是则转换为红黑树（需数组长度≥64）
5.  **判断扩容**：插入成功后，若`size > threshold`（数组容量×0.75），触发`resize()`扩容（容量翻倍）

---

## 三、关键细节说明
### 1. 哈希扰动函数
```java
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
```
将key的hashCode高16位与低16位异或，减少哈希冲突概率，使哈希值分布更均匀。

### 2. 红黑树转换条件
- 链表长度≥8
- 数组长度≥64（若数组长度<64，优先扩容而非树化）

### 3. 扩容机制
- 扩容阈值：`threshold = capacity * loadFactor`（默认16×0.75=12）
- 扩容后数组容量翻倍，元素需重新计算下标位置，红黑树会根据节点数判断是否退化为链表

---

## 四、面试高频问题解析
1.  **问：HashMap的put方法流程是什么？**
    **答：** 先判断数组是否为空并初始化，计算key的哈希值确定数组下标；若下标位置为空则直接插入；若有元素，key相同则覆盖value，key不同则判断是红黑树还是链表，链表尾部插入后若长度≥8且数组容量≥64则转为红黑树；最后判断元素数量是否超过扩容阈值，超过则扩容。

2.  **问：为什么HashMap要使用懒加载？**
    **答：** 懒加载可以避免创建对象时就分配内存，节省空间，只有第一次put元素时才初始化数组，提升内存利用率。

3.  **问：加载因子为什么是0.75？**
    **答：** 加载因子决定了扩容时机，0.75是时间和空间的折中：因子过小则频繁扩容浪费空间，因子过大则哈希冲突概率增加，查询效率下降。

4.  **问：链表什么时候转为红黑树？什么时候退化为链表？**
    **答：** 当链表长度≥8且数组长度≥64时，链表转为红黑树；当扩容后红黑树节点数≤6时，红黑树退化为链表，减少维护开销。