---
title: spring框架下常见常用注解
date: 2026-06-08
tags: [Java, Spring, 注解, SpringMVC, SpringBoot]
categories: [后端技术]
description: Spring、SpringMVC、SpringBoot框架中常见注解及作用说明
layout: doc
outline: deep
---

# spring框架下常见常用注解

## 一、Spring核心注解
| 注解 | 说明 |
|------|------|
| `@Component`/`@Controller`/`@Service`/`@Repository` | 类上注解，用于实例化Bean，分别对应通用组件、控制器、业务层、数据访问层 |
| `@Autowired` | 字段上注解，根据类型进行依赖注入 |
| `@Qualifier` | 结合`@Autowired`使用，根据名称进行依赖注入 |
| `@Scope` | 标注Bean的作用范围（如singleton、prototype） |
| `@Configuration` | 指定当前类为Spring配置类，容器启动时加载该类注解 |
| `@ComponentScan` | 指定Spring初始化时扫描的包路径 |
| `@Bean` | 方法上注解，将方法返回值存入Spring容器 |
| `@Import` | 导入的类会被Spring加载到IOC容器中 |
| `@Aspect`/`@Before`/`@After`/`@Around`/`@Pointcut` | 用于AOP切面编程，定义切面、通知类型和切点表达式 |

---

## 二、SpringMVC常用注解
| 注解 | 说明 |
|------|------|
| `@RequestMapping` | 映射请求路径，可定义在类和方法上，类上定义则方法路径为父路径+方法路径 |
| `@RequestBody` | 接收HTTP请求的JSON数据，转换为Java对象 |
| `@RequestParam` | 指定请求参数的名称，绑定请求参数到方法形参 |
| `@PathVariable` | 从请求路径中获取参数（如`/user/{id}`），传递给方法形参 |
| `@ResponseBody` | 将Controller方法返回的对象转换为JSON响应给客户端 |
| `@RequestHeader` | 获取指定的请求头数据 |
| `@RestController` | `@Controller` + `@ResponseBody` 的组合注解，用于前后端分离接口开发 |

---

## 三、SpringBoot核心注解
| 注解 | 说明 |
|------|------|
| `@SpringBootApplication` | SpringBoot启动类核心注解，组合了以下三个注解 |
| `@SpringBootConfiguration` | 组合`@Configuration`，声明当前类为配置类 |
| `@EnableAutoConfiguration` | 开启自动配置功能，可排除指定自动配置类 |
| `@ComponentScan` | Spring组件扫描，默认扫描当前引导类所在包及其子包 |

---

## 面试相关问题
1.  **问：Spring中@Component、@Controller、@Service、@Repository的区别是什么？**
    **答：** 它们本质上都是@Component的衍生注解，作用都是实例化Bean，区别在于语义上的区分：`@Component`是通用组件，`@Controller`用于控制器层，`@Service`用于业务层，`@Repository`用于数据访问层，便于Spring进行组件扫描和分层管理。

2.  **问：@Autowired和@Qualifier的作用和区别是什么？**
    **答：** `@Autowired`默认根据类型进行依赖注入，当容器中存在多个同类型Bean时，需要结合`@Qualifier`注解，通过Bean名称指定注入目标，解决歧义问题。

3.  **问：@RequestMapping和@GetMapping、@PostMapping的关系是什么？**
    **答：** `@GetMapping`、`@PostMapping`是`@RequestMapping`的衍生注解，分别指定请求方式为GET和POST，简化了请求映射的写法，本质上都是通过`@RequestMapping`实现请求路径和方法的映射。

4.  **问：@SpringBootApplication注解由哪几个注解组成？各自的作用是什么？**
    **答：** 由三个核心注解组成：`@SpringBootConfiguration`声明配置类，`@EnableAutoConfiguration`开启自动配置，`@ComponentScan`进行组件扫描，共同实现SpringBoot项目的启动和自动配置。