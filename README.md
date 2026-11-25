# SmalLCoat 博客

基于 Astro 5 构建的中文个人技术博客，聚焦编程实践与网络安全实战学习记录。

## 功能特性

- **入口控制台（Hub）**：桌面端锁定一屏的深紫 + 青色控制台入口，支持面板直达切换、`1`–`3` 数字键直达与 `ESC` 返回入口，并在无 JS 环境下完整降级可读。
- **学习记录检索与筛选**：支持按周筛选（Week 01–06）、三级手风琴展开、多关键词空格 AND 检索、结果高亮与热门词条一键查询。
- **沉浸式阅读体验**：自动生成桌面端吸顶目录与移动端折叠目录、顶部阅读进度条、代码块语言头栏与常驻复制按钮、Markdown 图片 `<figure>` 图注、原生 `<dialog>` 大图灯箱预览、同周学习路径与上/下一篇导航。
- **主题标签与完整归档**：独立 `/tags/` 标签索引页、`/tags/[tag]/` 专题归档页、`/archive/` 时间归档页，以及 `/rss.xml` 与 `/sitemap-index.xml`。
- **工程与安全基线**：`astro check` 严格类型检查、`vercel.json` CSP/HSTS/Permissions-Policy 安全响应头、Playwright 端到端回归测试与 GitHub Actions CI。

## 目录结构

```text
src/
  components/   # 交互组件、公共导航/页脚、目录、灯箱与搜索台
  content/posts/# Markdown 学习笔记与文章
  layouts/      # 全站基础布局与 SEO / JSON-LD 元数据
  lib/          # 站点配置（site.ts）与文章/标签聚合工具（posts.ts）
  pages/        # 首页、文章详情、标签索引、归档、404 与 RSS
  styles/       # 全局样式、Hub 布局、电影感项目舞台与组件样式
tests/          # Playwright 端到端测试套件
```

## 本地开发与校验

```sh
npm ci
npm run dev      # 启动本地开发服务器
npm run check    # 运行 Astro / TypeScript 类型检查
npm run build    # 构建静态产物到 dist/
npm run preview  # 本地预览构建产物
npm test         # 运行 Playwright 端到端测试
```

## 添加文章

在 `src/content/posts/` 新建 Markdown 文件（如 `day-036.md` 或通用技术文章 `python-notes.md`）：

```md
---
title: "文章标题"
description: "一句话概括核心内容"
pubDate: "2026-11-16"
tags: ["网络安全", "Week 7", "XSS"]
draft: false
---

文章正文，支持 Markdown、代码块、表格与图片（独立图片段落的 alt 文本会自动渲染为图注）。
```

草稿设置 `draft: true` 可暂不公开；如为周系列学习笔记，在 `tags` 中加入 `Week N` 即可自动归入对应周分组。

## 部署到 Vercel

将仓库导入 Vercel，框架预设选择 **Astro**，构建命令 `npm run build`，输出目录 `dist`，安全响应头由根目录 [vercel.json](./vercel.json) 自动配置。
