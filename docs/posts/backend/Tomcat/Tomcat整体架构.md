---
title: Tomcat整体架构
date: 2026-08-06
tags: [Tomcat, Catalina, Coyote, Servlet容器]
categories: [Tomcat]
description: Server、Service、Connector 与容器层次，以及 Coyote、Catalina 和 Jasper 的职责
layout: doc
outline: deep
---

# Tomcat 整体架构

## 一、Tomcat 的定位

Tomcat 实现 Servlet 等 Web 技术，为应用管理 HTTP 连接、请求分发和组件生命周期。它可以提供静态资源，但不是完整实现所有 Jakarta EE 功能的应用服务器。

这里以 Tomcat 10.1 为基线，它实现 Jakarta Servlet 6.0，最低要求 Java 11。项目若使用旧 `javax.servlet` API，需要确认迁移策略，不能仅更换服务器目录。

## 二、核心组件层次

```text
Server
└─ Service
   ├─ Connector：HTTP 等协议入口
   └─ Engine：请求容器入口
      └─ Host：虚拟主机
         └─ Context：一个 Web 应用
            └─ Wrapper：一个 Servlet 的包装与管理
```

Server 表示服务器实例，可包含多个 Service；一个 Service 把一组 Connector 与一个 Engine 关联。Engine 根据请求选择 Host，Host 再选择 Context，最后由相应 Wrapper 管理 Servlet 调用。

## 三、常见名称各自负责什么

| 名称 | 主要职责 |
| --- | --- |
| Coyote | 协议与连接处理，将网络请求适配给容器 |
| Catalina | Servlet 容器，应用部署与请求处理 |
| Jasper | JSP 编译与执行支持 |
| Valve / Pipeline | 容器层的请求处理管线 |

Filter 是应用层 Servlet 规范中的过滤机制；Valve 是 Tomcat 容器管线机制，两者作用范围与配置入口不同。不能把所有拦截处理都称为 Spring 拦截器。

## 四、独立与内嵌部署

独立部署由 Tomcat 启动，再加载应用；内嵌部署常由 Spring Boot 应用启动并创建 Tomcat。核心容器职责相近，但配置入口、打包方式和启动生命周期不同。

独立实例可在 `server.xml` 配置连接器和容器；内嵌实例通常通过框架属性或定制接口管理。修改安装目录的 `server.xml` 不会自动改变应用 JAR 内创建的服务器。

## 五、面试简答与追问

**简答：** Tomcat 用 Connector 处理协议与连接，用 Engine、Host、Context、Wrapper 组织应用与 Servlet，Coyote、Catalina、Jasper 分别覆盖协议、容器和 JSP。

**追问：一个 Connector 对应一个应用吗？** 不一定。它通常经同一 Engine 服务多个 Host 和 Context，路由根据主机名、路径与映射完成。

## 参考资料

- [Tomcat 10.1 架构概览](https://tomcat.apache.org/tomcat-10.1-doc/architecture/overview.html)
- [Tomcat 10.1 配置参考](https://tomcat.apache.org/tomcat-10.1-doc/config/index.html)
- [Tomcat 版本与规范对应](https://tomcat.apache.org/whichversion.html)
