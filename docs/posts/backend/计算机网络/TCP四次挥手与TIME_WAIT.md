---
title: TCP四次挥手与TIME_WAIT
date: 2026-09-05
tags: [计算机网络, TCP, 四次挥手, TIME_WAIT, CLOSE_WAIT]
categories: [计算机网络]
description: TCP 半关闭、FIN 序号、TIME_WAIT 与 CLOSE_WAIT 的区别和排查
layout: doc
outline: deep
---

# TCP 四次挥手与 TIME_WAIT

## 一、为什么要分别关闭两个方向

TCP 支持全双工传输。发送 FIN 表示这一方不再发送新数据，另一方仍可以继续发送剩余数据，因此关闭一个方向不等于整条连接立即消失。

FIN 和 SYN 一样占用一个序号；纯 ACK 不占用。以下用 A 主动关闭、B 被动关闭的常规流程说明。

## 二、关闭过程与状态

| 步骤 | 动作 | A 的常见状态 | B 的常见状态 |
| --- | --- | --- | --- |
| 1 | A 发送 FIN | FIN-WAIT-1 | 收到后进入 CLOSE-WAIT |
| 2 | B 确认 FIN | FIN-WAIT-2 | CLOSE-WAIT |
| 3 | B 完成发送后发 FIN | 收到后准备最终确认 | LAST-ACK |
| 4 | A 确认 B 的 FIN | TIME-WAIT | 收到确认后 CLOSED |

“四次挥手”是典型示意，不保证恰好四个网络包。如果 B 已准备好关闭，ACK 和 FIN 可以合并；重传或同时关闭也会改变实际包数。

## 三、TIME_WAIT 的两个作用

一是保留状态以便再次确认对方重传的 FIN：如果最终 ACK 丢失，B 可能还会重发 FIN。二是等待旧连接的延迟报文在网络中消失，减少相同连接标识被快速复用时的混淆。

协议通常描述等待 **2MSL**；MSL 是最大报文生存时间，具体超时实现不能写成所有系统都固定为同一个数值。

通常主动关闭方进入 TIME_WAIT，但同时关闭等场景不能套用“客户端一定 TIME_WAIT”。谁先执行关闭取决于具体应用和连接策略。

## 四、TIME_WAIT 与 CLOSE_WAIT 排查

TIME_WAIT 很多可能来自短连接或服务端主动关闭，不必直接当作泄漏。先确认连接创建速度、关闭方、长连接复用与临时端口压力。

CLOSE_WAIT 表示已收到对方 FIN，应用还未完成本端关闭。持续增长时检查未释放连接、异常路径和卡住的业务线程。直接调低内核超时无法修复应用没有关闭资源的问题。

## 五、面试简答与追问

**简答：** TCP 两个方向独立关闭，所以确认 FIN 与发送自己的 FIN 可以分开。TIME_WAIT 帮助可靠结束和隔离旧报文，CLOSE_WAIT 则常指向应用关闭动作尚未完成。

**追问：连接池有什么作用？** 复用连接可减少握手和频繁关闭开销，但仍需检查空闲连接、失效检测与连接池容量。

## 参考资料

- [RFC 9293：关闭连接](https://www.rfc-editor.org/rfc/rfc9293.html#section-3.6)
