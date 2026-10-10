---
title: Tomcat
description: Tomcat 架构、请求处理、Servlet、线程池、类加载与故障排查
layout: doc
outline: deep
---

# Tomcat

这一组笔记以 **Tomcat 10.1、Jakarta Servlet 6.0** 为基线。Tomcat 9 使用 `javax.servlet`，Tomcat 10.1 使用 `jakarta.servlet`，迁移时不能只替换服务器版本。

## 一、容器运行原理

1. [Tomcat 整体架构](./Tomcat整体架构)
2. [Tomcat 请求处理流程](./Tomcat请求处理流程)
3. [Servlet 生命周期与线程安全](./Servlet生命周期与线程安全)

## 二、运行配置与排障

4. [连接器与线程池](./连接器与线程池)
5. [Tomcat 类加载机制](./Tomcat类加载机制)
6. [性能参数与故障排查](./性能参数与故障排查)

## 三、阅读提示

独立 Tomcat 的 `server.xml` 与 Spring Boot 内嵌 Tomcat 的配置入口不同。本文中的 XML 针对独立部署；内嵌部署需查对应 Spring Boot 版本的属性或定制接口。
