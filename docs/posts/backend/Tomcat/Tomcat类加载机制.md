---
title: Tomcat类加载机制
date: 2026-09-30
tags: [Tomcat, 类加载器, 双亲委派, 应用隔离]
categories: [Tomcat]
description: Common 与 Webapp 加载器、应用优先的例外、重复依赖和热部署泄漏
layout: doc
outline: deep
---

# Tomcat 类加载机制

## 一、为什么每个应用需要自己的加载器

同一 Tomcat 可以运行多个 Web 应用，各自可能使用不同版本的依赖。每个应用的加载器让其 `WEB-INF/classes` 与 `WEB-INF/lib` 相互隔离，避免所有类放进一份共享路径。

Java 的类身份由二进制类名和定义它的加载器共同确定。同名类由不同加载器定义，不一定是可互相转换的同一种类型。

## 二、常见层次

| 加载器 | 可见范围 |
| --- | --- |
| Bootstrap | Java 核心运行时类 |
| System | Tomcat 启动所需的系统类路径 |
| Common | Tomcat 与各 Web 应用可见的公共类 |
| Webapp | 某一个应用自己的类与依赖 |

具体共享路径由配置决定。将业务库放到公共 lib 会影响多个应用，也可能使应用私有版本与公共版本发生冲突。

## 三、应用优先，但有例外

Tomcat 的 Web 应用加载器默认对应用类采用本地优先的策略，与普通 ClassLoader 常见父优先流程不同。但 Java 核心类以及 Tomcat 实现的相关 Jakarta API 等仍有必须优先委派的例外。

设置 `delegate="true"` 可以改变相应应用加载器的委派顺序。不能概括为“Tomcat 完全不遵守双亲委派”或“Web 应用可以覆盖任意核心类”。

JDK 9 之后核心类来自模块化运行时，不应继续把现代环境说成从 `rt.jar` 加载全部 Java 核心类。

## 四、依赖冲突如何排查

出现 `ClassCastException`，且类名看起来完全一样时，打印相关类的加载器和来源，检查是否被两个加载器分别定义。

```java
// 查看当前类型由哪个加载器定义；引导加载的类可能返回 null。
System.out.println(MyType.class.getClassLoader());
// 查看保护域提供的来源信息；某些类型可能没有 CodeSource。
System.out.println(MyType.class.getProtectionDomain().getCodeSource());
```

还应检查重复 JAR、公共 lib 与应用 lib、Servlet API 是否错误打包。父加载器一般看不到子加载器私有类，跨边界传对象时要使用双方都能看到的共享接口。

## 五、热部署、面试简答与追问

卸载后旧加载器若被后台线程或公共缓存保留，可能持续占用元空间。详见 [类卸载与类加载器泄漏](../Java基础相关/JVM虚拟机/执行机制/类卸载与类加载器泄漏)。

**简答：** Tomcat 以 Webapp 加载器隔离应用依赖，默认应用优先但保留核心与规范 API 例外；类身份和加载器边界决定了依赖可见性。

**追问：为什么同名对象不能强转？** 定义加载器不同会形成不同运行时类型，名字相同不代表类身份相同。

## 参考资料

- [Tomcat 10.1 Class Loader How-To](https://tomcat.apache.org/tomcat-10.1-doc/class-loader-howto.html)
- [ClassLoader API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/ClassLoader.html)
