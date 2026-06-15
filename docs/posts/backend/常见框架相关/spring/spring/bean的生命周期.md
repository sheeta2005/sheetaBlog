---
title: bean的生命周期
date: 2026-06-08
tags: [Java, Spring, Bean, 生命周期]
categories: [后端技术]
description: Spring Bean的完整生命周期流程、关键组件及相关概念解释
layout: doc
outline: deep
---

# bean的生命周期

## 一、核心基础概念补充
### 1. 什么是BeanDefinition？
Spring容器会将XML/注解配置的`<bean>`信息封装为`BeanDefinition`对象，作为创建Bean实例的元数据模板，包含：
- `beanClassName`：Bean的类名
- `initMethodName`：自定义初始化方法名
- `propertyValues`：Bean的属性值
- `scope`：作用域（singleton/prototype）
- `lazyInit`：是否延迟初始化

### 2. 什么是依赖注入？
依赖注入（DI）是Spring控制反转（IOC）的实现方式，指容器自动将Bean所需的依赖对象（如其他Service、DAO）注入到目标Bean中，而非由业务代码手动创建依赖对象，实现组件间解耦。

### 3. Aware接口干嘛用的？
Aware接口用于让Bean感知Spring容器的内部对象，常见实现：
- `BeanNameAware`：获取当前Bean在容器中的名称
- `BeanFactoryAware`：获取BeanFactory对象
- `ApplicationContextAware`：获取ApplicationContext对象
作用：让Bean能访问容器资源，实现特定的容器交互逻辑。

### 4. 什么是后置处理器（BeanPostProcessor）？
`BeanPostProcessor`是Spring提供的扩展接口，在Bean初始化前后执行自定义逻辑：
- `postProcessBeforeInitialization`：在初始化方法（如`@PostConstruct`、`InitializingBean`）执行前调用
- `postProcessAfterInitialization`：在初始化方法执行后调用
作用：对Bean进行增强处理，例如AOP代理生成、属性修改、日志记录等。

### 5. CGLIB干嘛用的？
CGLIB是一种动态代理技术，用于为没有实现接口的类生成代理对象：
- 原理：通过生成目标类的子类并重写方法实现增强
- 作用：与JDK动态代理（仅支持接口代理）互补，实现AOP中对非接口类的代理增强，Spring默认优先使用CGLIB代理。

---

## 二、Bean完整生命周期流程
1.  **通过BeanDefinition获取bean的定义信息**：容器解析配置，将Bean信息封装为`BeanDefinition`对象。
2.  **调用构造函数实例化bean**：根据`BeanDefinition`，通过构造函数创建Bean实例。
3.  **bean的依赖注入**：为Bean注入属性值和依赖对象（如`@Autowired`标注的对象）。
4.  **处理Aware接口**：调用`BeanNameAware`、`BeanFactoryAware`、`ApplicationContextAware`等接口方法，让Bean感知容器对象。
5.  **BeanPostProcessor-前置处理**：调用`postProcessBeforeInitialization`，对Bean进行前置增强。
6.  **初始化方法执行**：执行`InitializingBean#afterPropertiesSet`或自定义`init-method`方法。
7.  **BeanPostProcessor-后置处理**：调用`postProcessAfterInitialization`，对Bean进行后置增强（如生成AOP代理对象）。
8.  **销毁bean**：容器关闭时，执行`DisposableBean#destroy`或自定义`destroy-method`方法，释放资源。

---

## 三、关键环节说明
- **创建与初始化分离**：Bean的实例化（构造函数）和依赖注入、初始化是分开的步骤，实例化仅创建对象，后续步骤完成属性赋值和初始化。
- **AOP代理生成**：在`BeanPostProcessor#after`阶段，Spring通过动态代理（JDK/CGLIB）生成目标Bean的代理对象，实现切面逻辑增强。
- **销毁回调**：`@PreDestroy`标注的方法会在销毁阶段执行，用于释放资源（如关闭数据库连接）。

---

## 面试相关问题
1.  **问：请说一下Spring Bean的完整生命周期？**
    **答：** Spring Bean的生命周期分为以下阶段：
    1.  通过BeanDefinition获取bean的定义信息；
    2.  调用构造函数实例化bean；
    3.  为bean进行依赖注入；
    4.  处理Aware接口（BeanNameAware、BeanFactoryAware、ApplicationContextAware）；
    5.  执行BeanPostProcessor的前置处理方法；
    6.  执行初始化方法（InitializingBean或自定义init-method）；
    7.  执行BeanPostProcessor的后置处理方法，生成AOP代理对象；
    8.  容器关闭时，执行销毁方法（DisposableBean或自定义destroy-method）。

2.  **问：BeanPostProcessor的作用是什么？举个应用场景。**
    **答：** BeanPostProcessor是Spring的扩展接口，用于在Bean初始化前后执行自定义增强逻辑。典型场景是AOP代理生成：Spring通过`AnnotationAwareAspectJAutoProxyCreator`（BeanPostProcessor的实现类），在`postProcessAfterInitialization`方法中为目标Bean生成代理对象，实现切面逻辑的增强。

3.  **问：Aware接口和BeanPostProcessor有什么区别？**
    **答：** Aware接口是Bean自身实现的接口，用于让Bean主动感知容器对象；BeanPostProcessor是容器级别的扩展，用于对所有Bean进行通用增强处理，不依赖Bean自身实现接口。

4.  **问：JDK动态代理和CGLIB代理的区别是什么？**
    **答：** 两者都是Spring AOP的代理实现方式，区别在于：
    - JDK动态代理：基于接口实现，仅能为实现了接口的类生成代理，性能较高；
    - CGLIB代理：基于类继承实现，能为没有实现接口的类生成代理，通过生成目标类的子类增强方法，性能略低于JDK代理；
    - Spring中，目标类实现接口时默认使用JDK代理，否则使用CGLIB代理，也可通过配置强制使用CGLIB。