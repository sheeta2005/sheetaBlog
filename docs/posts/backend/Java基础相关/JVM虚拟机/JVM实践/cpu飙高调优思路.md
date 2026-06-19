---
title: Java进程CPU飙高完整排查思路
date: 2026-06-19
tags: [Linux, JVM, CPU飙高, top, ps, jstack]
categories: [JVM调优实践]
description: 线上Java服务CPU占用100%分步排查流程，命令、进制转换、线程栈定位代码完整流程
layout: doc
outline: deep
---
# Java进程CPU飙高完整排查思路
## 整体四步流程
1. top 定位占用CPU最高的Java进程PID
2. ps 查看该进程下所有线程，找到高CPU线程TID（十进制）
3. 将十进制TID转为十六进制
4. jstack 打印进程线程栈，匹配十六进制nid，定位耗CPU代码行

## 1、top 查看整机进程CPU占用
```shell
top
```
观察`%CPU`列，找到java进程对应的PID，示例PID=40940。

## 2、查询进程内各线程CPU占用
```shell
ps -H -eo pid,tid,%cpu | grep 40940
```
- `-H`：显示线程
- pid：进程ID，tid：系统线程ID（十进制）
  找到CPU占用极高的线程tid，示例tid=40950。

## 3、十进制线程tid转为十六进制
jstack输出里nid是十六进制，需要转换：
```shell
printf "%x\n" 40950
# 输出 9ff6
```

## 4、jstack打印线程栈，匹配十六进制nid
```shell
jstack 40940
```
在输出中搜索`nid=0x9ff6`，对应线程栈，栈内会展示具体类、方法、行号，直接定位耗CPU业务代码。

## 常见CPU飙高原因
1. 死循环while(true)无休眠，持续占用CPU；
2. 复杂循环、大量计算、密集字符串处理；
3. 频繁FullGC，GC线程疯狂工作；
4. 正则回溯、大量IO同步阻塞重试；
5. 锁自旋、死锁大量竞争。

## 面试简答
问：线上Java服务CPU持续100%，完整排查步骤？

答：
1. 执行top命令，找到CPU最高的Java进程PID；
2. 使用`ps -H -eo pid,tid,%cpu | grep 进程PID`，找出占用CPU最高的十进制线程tid；
3. 通过printf将十进制tid转十六进制；
4. jstack 进程PID打印全部线程栈，搜索转换后的十六进制nid，查看该线程堆栈，定位消耗CPU的代码；
5. 根据栈信息分析死循环、密集计算、频繁FullGC等根源并修复。