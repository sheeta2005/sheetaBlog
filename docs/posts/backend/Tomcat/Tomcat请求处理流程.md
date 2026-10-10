---
title: Tomcat请求处理流程
date: 2026-08-18
tags: [Tomcat, NIO, Connector, Filter, Servlet]
categories: [Tomcat]
description: 从接收连接、HTTP 解析、应用映射到 Filter 与 Servlet 的服务端请求链路
layout: doc
outline: deep
---

# Tomcat 请求处理流程

## 一、连接事件与业务执行

以常见 HTTP/1.1 NIO 连接器为例，接收连接的组件、等待 socket 就绪的组件和实际处理请求的工作线程分工协作。具体类名随版本变化，可结合对应源码定位 Acceptor、Poller 与处理任务。

NIO 让空闲连接不必长期独占业务工作线程，但 Servlet 执行业务时仍可能占用线程。调用慢数据库不会因为连接器叫 NIO 就自动变成异步完成。

## 二、请求逐层进入应用

1. Connector 接收与读取网络数据，协议处理器解析 HTTP。
2. 适配层把协议请求转为容器能够处理的请求和响应对象。
3. 映射器根据主机名、应用路径和 Servlet 映射确定 Host、Context、Wrapper。
4. 请求经过相关容器 Pipeline 与 Valve。
5. 应用 Filter 链运行，最终进入 Servlet 的 `service`。
6. 响应经容器和协议层编码写回，连接按协议与配置保留或关闭。

这是标准路径的概要，异步派发、错误处理与转发会增加分支。实际并不是每个 HTTP 报文都创建一个全新的 TCP 连接。

## 三、Spring MVC 在哪里接入

Spring MVC 的 DispatcherServlet 是一个 Servlet。Tomcat 完成协议和应用路由后才进入它；之后才是框架的 HandlerMapping、拦截器、参数绑定与控制器执行。

| 层次 | 常见关注点 |
| --- | --- |
| Connector | 连接限制、协议解析、超时 |
| Valve | 容器访问日志、认证等 |
| Filter | 应用过滤、包装、编码等 |
| DispatcherServlet | 框架路由、控制器、结果处理 |

Filter 与 Spring MVC 拦截器的顺序和覆盖范围不同。没有进入控制器的请求，也可能已经经历了网络读取与 Filter 工作。

## 四、同步与 Servlet 异步

同步请求通常在处理线程上执行应用，结束后返回线程池。Servlet 异步允许释放初始请求线程，后续由其他执行路径完成或再次派发。

异步不表示没有线程和等待：后续任务、数据库访问与响应写出仍需要资源，并要处理超时、错误和完成通知。业务工作移到无界线程池，只会换一个拥塞位置。

## 五、面试简答与追问

**简答：** Tomcat 先处理连接与 HTTP，再映射到容器和应用，经过 Valve、Filter 后执行 Servlet；Spring MVC 接管的是 Servlet 内部的框架处理。

**追问：请求慢一定是 Tomcat 线程池小吗？** 不是。要定位等待在哪一层，连接池、SQL、外部服务和锁竞争都可能导致工作线程占满。

## 参考资料

- [Tomcat HTTP 连接器](https://tomcat.apache.org/tomcat-10.1-doc/config/http.html)
- [Tomcat 容器管线配置](https://tomcat.apache.org/tomcat-10.1-doc/config/valve.html)
- [Jakarta Servlet 6.0 规范](https://jakarta.ee/specifications/servlet/6.0/)
