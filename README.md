# CaraFloa

CaraFloa 是一个以“周期性内容”和“空间化导航”为核心的个人内容与文章展示站点。项目使用 Markdown 管理文章，以周期为单位组织和循环展示文章，同时将首页、归档、关于、友链和文章详情等页面铺设在 2D 网格中，通过网格平移切换页面。

## 特性

- 基于 Astro 的静态站点生成
- 使用 Markdown 编写和管理文章
- 以周期为单位组织文章，并循环展示各栏目中的周期内容
- 支持文章栏目、周期、摘要、封面、发布时间和多个 tags
- 使用 2D 网格平铺页面，通过空间位置组织首页、归档、关于、友链和文章详情
- 支持在网格页面之间平移导航，并根据当前位置展示对应内容
- 归档页支持：
  - 关键词搜索文章标题和摘要
  - 按栏目筛选
  - 按周期筛选
  - 同时选择多个 tags 过滤文章
- 支持 Markdown 表格、列表、任务列表、图片和代码块样式
- 支持数学公式和 KaTeX 渲染
- 响应式布局，适配桌面端和窄屏设备
- 提供深色主题
- 集成 Font Awesome 图标
- 支持 RSS 输出
- 提供命令行工具快速创建文章

## 技术栈

- [Astro](https://astro.build/)
- TypeScript
- Markdown
- `@astrojs/markdown-remark`
- `remark-math`
- `rehype-katex`
- [Font Awesome](https://fontawesome.com/)
- Prettier

## 开始使用

### 环境要求

- Node.js `>= 22.12.0`
- npm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器启动后，访问终端输出的本地地址。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 创建文章

项目提供 `new:article` 命令，可以快速生成文章文件：

```bash
npm run new:article -- \
  --section tech-news \
  --title "文章标题" \
  --summary "文章摘要" \
  --tags "Astro,前端,静态站点" \
  --published-at "2026-10-18T12:00:00+08:00"
```

可用参数：

| 参数 | 说明 |
| --- | --- |
| `--section` | 文章栏目，必填 |
| `--title` | 文章标题，必填 |
| `--id` | 文章 ID 和文件名，默认根据英文标题生成 |
| `--summary` | 文章摘要 |
| `--period` | 文章所属周期，例如 `p1` |
| `--cover` | 封面图片路径 |
| `--tags` | 使用逗号分隔的多个标签 |
| `--published-at` | 发布时间，默认当前时间 |
| `--content` | 文章正文 |
| `--help` | 查看命令帮助 |

文章默认生成到：

```text
src/content/<section>/<id>.md
```

## 文章 Frontmatter

文章使用 YAML frontmatter，示例：

```yaml
---
id: example-article
section: tech-news
period: p1
title: 一篇示例文章
summary: 这是一篇示例文章的摘要。
cover: /images/example-cover.jpg
tags:
  - Astro
  - 前端
  - 静态站点
publishedAt: 2026-10-18T12:00:00+08:00
---

## 正文标题

这里开始编写文章正文。
```

### 支持的字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 文章唯一 ID |
| `section` | string | 文章所属栏目 |
| `period` | string，可选 | 文章所属周期 |
| `title` | string | 文章标题 |
| `summary` | string，可选 | 文章摘要 |
| `cover` | string，可选 | 封面图片路径 |
| `tags` | string[]，可选 | 一个或多个文章标签 |
| `publishedAt` | date | 发布时间，未来时间的文章不会公开显示 |

## 目录结构

```text
.
├── public/                  # 静态资源
│   └── images/              # 图片和站点图标
├── scripts/
│   └── new-article.mjs      # 文章生成脚本
├── src/
│   ├── components/          # Astro 页面和通用组件
│   ├── config/              # 站点、栏目和页面配置
│   ├── content/             # Markdown 文章内容
│   ├── lib/                 # 文章查询和业务逻辑
│   ├── pages/               # Astro 路由
│   └── styles/              # 全局和页面样式
├── astro.config.mjs         # Astro 和 Markdown 配置
└── package.json
```

## 配置

站点 URL 可以通过环境变量 `PUBLIC_SITE_URL` 配置：

```bash
PUBLIC_SITE_URL=https://example.com npm run build
```

该配置用于 Astro 站点信息和 RSS 等需要绝对地址的场景。

## 格式化代码

```bash
npm run beautify
```

## 内容栏目

当前栏目配置位于 [`src/config/home.ts`](./src/config/home.ts)：

- 开源项目
- 每周议题
- 每周隐写
- 技术新闻
- 周汇小结

如需新增栏目，需要同步更新栏目配置和对应的文章目录。

## License

本项目采用 [GNU General Public License v3.0](./LICENSE)（GPL-3.0）授权。
