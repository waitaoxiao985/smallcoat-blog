# SmalLCoat 博客

基于 Astro 的中文个人技术博客，使用 Markdown 编写文章。

## 本地开发

```sh
npm install
npm run dev
```

打开终端显示的本地地址（通常是 http://localhost:4321）。

## 添加文章

在 `src/content/posts/` 新建 Markdown 文件，例如 `python-notes.md`：

```md
---
title: "文章标题"
description: "文章摘要"
pubDate: 2026-11-09
tags: ["Python", "编程"]
---

文章正文，支持 Markdown 和代码块。
```

草稿设置 `draft: true` 可暂不公开。

## 构建

```sh
npm run build
npm run preview
```

## 部署到 Vercel

将仓库导入 Vercel，框架预设选 Astro，构建命令 `npm run build`，输出目录 `dist`。也可在项目根目录运行 `npx vercel`。
