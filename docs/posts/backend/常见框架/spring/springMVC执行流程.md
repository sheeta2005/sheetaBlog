---
title: 执行流程
date: 2026-06-08
tags: [Java, SpringMVC, 执行流程, Web框架]
categories: [后端技术]
description: SpringMVC的定义、作用、执行流程及相关基础常识
layout: doc
outline: deep
---

# 执行流程

## 一、核心基础概念补充
### 1. 什么是SpringMVC？
SpringMVC是Spring框架提供的**基于MVC（Model-View-Controller）模式**的Web层框架，用于构建Java Web应用程序，它通过DispatcherServlet作为前端控制器，将请求分发到对应的处理器（Controller），并完成视图渲染或JSON响应。

### 2. SpringMVC干嘛的？
- 接收并处理用户的HTTP请求；
- 分发请求到对应的Controller处理器；
- 处理请求参数、调用业务逻辑；
- 封装处理结果，返回视图或JSON响应；
- 提供拦截器、异常处理、数据绑定等Web层通用功能。

### 3. JSP是什么？（JavaServer Pages）
JSP（JavaServer Pages）是一种服务器端动态网页技术，用于在HTML页面中嵌入Java代码，生成动态内容。
- 原理：JSP文件会被服务器编译为Servlet，处理请求后生成HTML返回给客户端；
- 作用：早期Web开发中，用于实现页面与数据的动态渲染（如结合ModelAndView填充数据并生成页面）；
- 现状：前后端分离开发模式下，JSP使用较少，通常由前端框架（如Vue、React）承担页面渲染工作。

---

## 二、SpringMVC核心组件
- **DispatcherServlet（前端控制器）**：整个流程的入口，负责接收请求、分发处理、协调各组件工作。
- **HandlerMapping（处理器映射器）**：根据请求URL找到对应的处理器（Controller），返回处理器执行链（含拦截器）。
- **HandlerAdapter（处理器适配器）**：适配不同类型的处理器，调用Controller的方法，处理参数绑定和返回值。
- **Handler（处理器/Controller）**：业务逻辑处理单元，接收请求并返回处理结果。
- **ViewResolver（视图解析器）**：将逻辑视图名解析为具体的视图对象（如JSP文件）。
- **View（视图）**：负责将Model数据渲染为客户端响应（如HTML页面、JSON数据）。

---

## 三、两种执行流程详解
### 1. 视图阶段（JSP版本）
1.  用户发送请求到DispatcherServlet；
2.  DispatcherServlet调用HandlerMapping，根据URL找到对应的处理器，返回处理器执行链；
3.  DispatcherServlet调用HandlerAdapter，适配并调用Controller方法；
4.  Controller执行业务逻辑，返回ModelAndView对象（包含数据和逻辑视图名）；
5.  HandlerAdapter将ModelAndView返回给DispatcherServlet；
6.  DispatcherServlet将ModelAndView传给ViewResolver；
7.  ViewResolver解析逻辑视图名，找到对应的JSP视图；
8.  DispatcherServlet将Model数据填充到JSP中，渲染生成HTML；
9.  DispatcherServlet将最终HTML响应给用户。

### 2. 前后端分离阶段（接口开发版本）
1.  用户发送请求到DispatcherServlet；
2.  DispatcherServlet调用HandlerMapping，根据URL找到对应的处理器，返回处理器执行链；
3.  DispatcherServlet调用HandlerAdapter，适配并调用Controller方法；
4.  Controller方法添加`@ResponseBody`注解，处理请求并返回数据对象；
5.  HandlerAdapter通过`HttpMessageConverter`将数据对象转换为JSON格式；
6.  DispatcherServlet将JSON数据直接响应给用户，无需视图渲染。

---

## 四、面试基础常识
1.  **问：SpringMVC的核心组件有哪些？**
    **答：** 核心组件包括DispatcherServlet、HandlerMapping、HandlerAdapter、Handler、ViewResolver、View，其中DispatcherServlet是前端控制器，负责流程协调。

2.  **问：DispatcherServlet的作用是什么？**
    **答：** 作为SpringMVC的前端控制器，负责接收所有HTTP请求，分发到对应的处理器，协调各组件工作，并最终返回响应结果，是整个请求流程的入口和中枢。

3.  **问：HandlerMapping和HandlerAdapter的区别是什么？**
    **答：** HandlerMapping负责根据请求URL找到对应的处理器，返回处理器执行链；HandlerAdapter负责适配处理器的调用，处理参数绑定、返回值转换，让DispatcherServlet无需关心处理器的具体实现方式。

4.  **问：@ResponseBody的作用是什么？**
    **答：** `@ResponseBody`注解用于将Controller方法的返回值直接转换为JSON格式，通过`HttpMessageConverter`写入HTTP响应体，实现前后端分离的接口响应，无需经过视图解析和渲染流程。

5.  **问：JSP和前后端分离开发的区别是什么？**
    **答：** JSP是服务器端动态页面技术，需要在服务器端渲染生成HTML；前后端分离开发中，后端仅返回JSON数据，由前端框架在客户端渲染页面，职责更清晰，开发和维护更高效。