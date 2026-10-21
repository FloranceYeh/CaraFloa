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
- 支持将站点代码与公开内容仓库解耦，在 GitHub Actions 构建时注入文章、配置和图片

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

### 内容仓库

站点支持将数据存放在独立的公开仓库中。内容仓库建议使用以下结构：

```text
CaraFloa-content/
├── articles/                 # Markdown 文章，对应站点的 src/content/
├── config/                   # 站点内容配置，对应站点的 src/config/
└── images/                   # 图片资源，对应站点的 public/images/
```

站点仓库会保留 `src/content/`、`src/config/` 和 `public/images/` 作为默认展示模板。
GitHub Actions 构建时，外部内容仓库的对应目录会覆盖这些模板目录；本地未同步外部
内容时，项目仍然可以直接运行。`src/content.config.ts` 始终保留在站点仓库中，因为它
是站点的内容 schema，而不是文章数据。

本地同步内容仓库：

```powershell
$env:CONTENT_REPOSITORY = "FloranceYeh/CaraFloa-content"
npm run sync:content
```

也可以指定已经 checkout 到本地的内容仓库目录：

```powershell
$env:CONTENT_SOURCE_DIR = ".content-repository"
npm run sync:content
```

同步脚本会将以下目录复制到站点：

```text
articles/ -> src/content/
config/   -> src/config/
images/   -> public/images/
```

### GitHub Actions 构建

站点仓库包含 [`.github/workflows/build.yml`](./.github/workflows/build.yml)。
它会 checkout 站点和内容仓库，执行内容同步后再运行 Astro build。

在站点仓库的 **Settings → Secrets and variables → Actions → Variables** 中配置：

| 变量 | 示例 | 说明 |
| --- | --- | --- |
| `CONTENT_REPOSITORY` | `FloranceYeh/CaraFloa-content` | 公开内容仓库 |
| `CONTENT_REF` | `main` | 内容仓库分支或 tag，可选 |
| `PUBLIC_SITE_URL` | `https://example.com` | 站点 URL，可选 |

内容仓库更新后，可以通过 `repository_dispatch` 触发站点重新构建：

```yaml
name: Notify site

on:
  push:
    branches:
      - main

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: peter-evans/repository-dispatch@v3
        with:
          token: ${{ secrets.SITE_REPOSITORY_TOKEN }}
          repository: FloranceYeh/CaraFloa
          event-type: content-updated
```

由于内容仓库是公开仓库，Actions checkout 不需要额外的内容读取 token。
触发站点 workflow 的 `SITE_REPOSITORY_TOKEN` 只需要配置在内容仓库中。

### 使用 Netlify 等构建平台

项目包含 [`netlify.toml`](./netlify.toml)，Netlify 会使用以下构建流程：

```text
npm run sync:content && npm run build
```

在 Netlify 项目的 **Site configuration → Environment variables** 中添加：

| 变量 | 示例 | 说明 |
| --- | --- | --- |
| `CONTENT_REPOSITORY` | `FloranceYeh/CaraFloa-content` | 公开内容仓库 |
| `CONTENT_REF` | `main` | 内容仓库分支或 tag，可选 |
| `PUBLIC_SITE_URL` | `https://example.netlify.app` | 站点 URL，可选 |

Netlify 默认会：

1. checkout 站点仓库；
2. 安装 `package.json` 中的依赖；
3. 使用 `CONTENT_REPOSITORY` 拉取内容仓库；
4. 用内容仓库的 `articles/`、`config/` 和 `images/` 覆盖模板目录；
5. 执行 `npm run build`；
6. 发布 `dist/` 目录。

内容仓库更新后，Netlify 不一定会自动感知外部仓库的提交。可以使用以下任一方式
触发重新部署：

- 在 Netlify 控制台手动点击 **Deploys → Trigger deploy**
- 创建 Netlify Build Hook，并在内容仓库的 GitHub Actions 中调用它

内容仓库调用 Netlify Build Hook 的示例：

```yaml
name: Trigger Netlify deploy

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Netlify build hook
        run: curl -X POST -d '{}' "${{ secrets.NETLIFY_BUILD_HOOK_URL }}"
```

`NETLIFY_BUILD_HOOK_URL` 应配置在内容仓库的 GitHub Actions Secrets 中，不要直接写入
公开仓库文件。

### 使用 Vercel 构建

项目包含 [`vercel.json`](./vercel.json)，导入项目后 Vercel 会使用以下配置：

```text
安装命令：npm ci
构建命令：npm run sync:content && npm run build
输出目录：dist
框架预设：Astro
Node.js：22.x
```

在 Vercel 项目的 **Settings → Environment Variables** 中添加以下变量，并选择
需要部署的环境（通常选择 Production 和 Preview）：

| 变量 | 示例 | 说明 |
| --- | --- | --- |
| `CONTENT_REPOSITORY` | `FloranceYeh/CaraFloa-content` | 公开内容仓库 |
| `CONTENT_REF` | `main` | 内容仓库分支或 tag，可选 |
| `PUBLIC_SITE_URL` | `https://carafloa.vercel.app` | 站点 URL，可选 |

Vercel 的构建流程是：

1. checkout 站点仓库；
2. 安装 npm 依赖；
3. 拉取内容仓库；
4. 用 `articles/`、`config/` 和 `images/` 覆盖站点模板目录；
5. 执行 Astro build；
6. 发布 `dist/` 目录。

内容仓库更新后，在 Vercel 项目的 **Settings → Git → Deploy Hooks** 中创建
Deploy Hook，复制 URL 并配置到内容仓库的 GitHub Actions Secret：

```text
VERCEL_DEPLOY_HOOK_URL=<Vercel Deploy Hook URL>
```

内容仓库推送到 `main` 后，Actions 会调用该 URL 触发 Vercel 重新构建。
Deploy Hook URL 只应保存为 Secret，不要写入公开文件。

### 使用 Cloudflare Pages 等平台

只需要将构建命令设置为：

```bash
npm run sync:content && npm run build
```

并配置同样的 `CONTENT_REPOSITORY`、`CONTENT_REF` 和 `PUBLIC_SITE_URL` 环境变量即可。

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

本地开发时引用外部内容仓库，可以设置 `CONTENT_SOURCE_DIR` 后启动：

```powershell
$env:CONTENT_SOURCE_DIR = "E:\Code\CaraFloa-content"
npm run dev
```

也可以在项目根目录的 `.env` 文件中配置（可从 `.env.example` 复制）：

```dotenv
CONTENT_SOURCE_DIR=../CaraFloa-content
```

支持绝对路径和相对于站点项目根目录的路径。dev 启动时会将外部
`articles/`、`config/`、`images/` 路由为开发数据源；运行期间新增、修改、删除文件也会
自动触发 Astro 刷新，无需复制文件或重复执行 `sync:content`。外部仓库必须包含
这三个目录。未设置此变量时，直接使用项目内的内容。

开发服务器不会覆盖项目内的模板目录，停止 dev 后项目文件也不会发生变化。生产
构建仍使用现有的 `npm run sync:content && npm run build` 流程。

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
