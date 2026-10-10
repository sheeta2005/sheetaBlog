---
title: springboot自动配置原理
date: 2026-06-08
revised: 2026-10-10
tags: [Java, SpringBoot, 自动配置, 原理]
categories: [后端技术]
description: Spring Boot 自动配置候选、条件判断、用户 Bean 回退与 2.7/3.x 的注册方式差异
layout: doc
outline: deep
---

# springboot自动配置原理

## 一、启动注解的职责

`@SpringBootApplication` 组合了 `@SpringBootConfiguration`、`@EnableAutoConfiguration` 与 `@ComponentScan`。

配置类声明、自动配置导入与业务组件扫描是不同机制。自动配置不等于扫描所有依赖 JAR 中任意带 `@Configuration` 的类。

## 二、候选配置从哪里发现

| 版本 | 自动配置类注册方式 |
| --- | --- |
| Spring Boot 2.6 及更早的相关版本 | 常见方式是在 spring.factories 中注册 EnableAutoConfiguration 候选 |
| Spring Boot 2.7 | 引入 AutoConfiguration.imports，仍兼容旧自动配置注册方式 |
| Spring Boot 3.x | 自动配置候选使用 AutoConfiguration.imports，不再通过旧 factories 键注册 |

现代文件路径为：

```text
META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

每行列出候选类的全限定名。`spring.factories` 仍可能被其他框架扩展使用，不能因自动配置注册方式改变就声称该文件完全废弃。

## 三、导入到生效的过程

1. `@EnableAutoConfiguration` 经导入选择器发现候选类。
2. 按显式排除、条件与相关元信息筛选，并处理自动配置顺序。
3. 条件满足的配置参与容器构建。
4. 配置类中的 Bean 定义还需满足各自条件，才会注册并按生命周期创建。

自动配置顺序主要影响定义与条件处理，不等于严格规定所有 Bean 的实例化顺序。实例化还取决于依赖关系和是否延迟加载。

## 四、常见条件与回退

| 条件 | 判断内容 |
| --- | --- |
| `@ConditionalOnClass` | 指定类是否可见 |
| `@ConditionalOnMissingBean` | 相应 Bean 是否缺失 |
| `@ConditionalOnProperty` | 属性是否符合约定值 |
| `@ConditionalOnWebApplication` | 是否为相应 Web 应用类型 |

```java
// Spring Boot 3.x 示意：用户已提供类型时，默认 Bean 退让。
@AutoConfiguration
public class BlogAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    BlogService blogService() {
        return new BlogService();
    }
}
```

BlogService 由业务提供，该示意还需将配置类注册进 imports 文件。添加依赖只是提供候选与类型，不保证其每个 Bean 一定生效。

用户 Bean 回退是自动配置的重要约定，但具体名称、类型与检查时机以相应条件为准，不能概括为“用户随便写任何同名 Bean 都无条件覆盖”。

## 五、配置没有生效怎么查

先确认候选注册路径和版本，再查类路径、属性、已存在 Bean 与显式排除。启动时启用 `--debug` 可查看条件评估报告，区分命中与未命中的配置。

Starter 通常帮助组合依赖，真正的自动配置仍需注册与条件判断。不要只凭 starter 名称推断运行时实际组件。

## 六、面试简答与追问

**简答：** Spring Boot 发现预先注册的候选配置，结合条件与排除项按需注册默认组件，并允许用户配置使默认 Bean 回退。注册文件要按版本说明。

**追问：ComponentScan 与自动配置有什么区别？** 前者扫描业务组件，后者导入依赖预先声明的候选配置，两者不是同一个发现过程。

## 参考资料

- [Spring Boot：创建自动配置](https://docs.spring.io/spring-boot/reference/features/developing-auto-configuration.html)
- [Spring Boot 2.7 发布说明：注册方式迁移](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-2.7-Release-Notes#new-autoconfiguration-annotation)
- [Spring Boot 3.0 迁移指南](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide#auto-configuration-files)
