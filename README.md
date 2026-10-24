# sheetaBlog

我的个人博客，用 VitePress 搭建，记录平时的学习笔记、项目里遇到的问题，也放一些随笔和小游戏。

在线访问：[bblog.sheeta1998.com](https://bblog.sheeta1998.com)

## 这里有什么

- 项目实践：takeMe 社区助老平台、Redis 限流 Starter 等项目的介绍和复盘。
- 学习笔记：以 Java 后端为主，也有算法题解、Vue、TypeScript 和学校课程笔记。
- 精选文章：从各个分类里挑出的一些文章，方便从这里开始读。
- 杂项：随笔，以及贪吃蛇、俄罗斯方块、2048 等小游戏。

页面在 VitePress 默认主题上做了一些调整，加了昼夜背景、阅读设置和阅读进度，也保留了站内搜索。

## 本地运行

准备好 Node.js 和 npm，在项目根目录依次运行 `npm install`、`npm run dev`，然后打开终端提示的地址。

构建静态页面用 `npm run build`，构建完成后可以用 `npm run preview` 预览。生成的文件在 `docs/.vitepress/dist/`。

## 内容放在哪

- `docs/posts/`：按后端、算法、前端和学校课程分类的学习笔记。
- `docs/projects/`：项目介绍。
- `docs/articles/`：项目相关文章和精选分类页。
- `docs/misc/`：随笔、小游戏入口。
- `docs/public/`：头像、背景等静态资源。
- `docs/.vitepress/`：站点配置、自定义主题和组件。

写笔记主要改 Markdown 文件；导航和站点信息在 `docs/.vitepress/config.js`，页面样式和组件在 `docs/.vitepress/theme/`。

笔记会随着学习慢慢补充和修订，有写错的地方欢迎提 Issue 指正。
