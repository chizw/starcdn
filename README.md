# StarCDN

StarCDN 是一个基于 Astro 构建的静态展示站，面向开源项目、公共前端库、头像资源与轻量静态资源提供免费 CDN 镜像加速入口说明。项目主要用于展示 StarCDN 的服务能力、接入方式、常见问题、错误页与安全拦截页。

## 项目特点

- 静态优先：使用 Astro 生成静态 HTML，适合部署到任意静态托管平台或 CDN。
- 访问友好：面向国内访问场景，展示公共前端资源与开源项目资源的加速使用方式。
- 轻量依赖：未引入复杂 UI 框架或客户端运行时框架，页面结构清晰、加载负担低。
- SEO 友好：全局布局内配置基础元信息，构建后生成完整 HTML。
- 响应式设计：页面使用 CSS 变量、响应式网格和卡片布局，适配桌面端与移动端。

## 技术栈

- Astro
- TypeScript
- Astro 组件
- 原生 CSS

## 主要功能

- 首页展示 StarCDN 品牌介绍、核心指标、功能亮点与服务入口。
- 提供 jsDelivr、Gravatar、Google 静态库和静态资源托管等镜像入口说明。
- 展示 CDN 接入示例，包括域名替换、版本锁定与生产环境引用方式。
- 提供自定义 404 页面。
- 提供安全拦截提示页面。

## 目录结构

```text
.
├── public/                 # 静态资源目录，构建时会原样复制
│   ├── img/                # 图片与 favicon 资源
│   ├── star/images/        # StarCDN 品牌与服务图标资源
│   ├── favicon.ico         # 站点图标
│   └── robots.txt          # 搜索引擎抓取规则
├── src/
│   ├── components/         # 公共组件
│   │   ├── SiteFooter.astro
│   │   └── SiteHeader.astro
│   ├── layouts/            # 页面布局
│   │   └── BaseLayout.astro
│   └── pages/              # 页面路由
│       ├── 404.astro
│       ├── index.astro
│       └── waf.astro
├── astro.config.mjs        # Astro 配置
├── package.json            # 项目脚本与依赖
└── tsconfig.json           # TypeScript 配置
```

## 页面路由

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | StarCDN 首页 |
| `/404` | `src/pages/404.astro` | 自定义 404 页面 |
| `/waf` | `src/pages/waf.astro` | 安全拦截提示页面 |

## 快速开始

### 环境要求

- Node.js
- npm

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

启动后按照终端输出的本地地址访问站点。

### 构建生产版本

```bash
npm run build
```

构建产物默认输出到 `dist/` 目录。

### 本地预览构建结果

```bash
npm run preview
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Astro 本地开发服务 |
| `npm run build` | 构建生产环境静态文件 |
| `npm run preview` | 本地预览生产构建结果 |

## 接入示例

将原始 jsDelivr 地址：

```text
https://cdn.jsdelivr.net/npm/package@version/file
```

替换为 StarCDN 镜像地址：

```text
https://jscdn.wuxit.cn/npm/package@version/file
```

生产环境建议锁定依赖版本，避免使用浮动版本导致资源内容变化不可控。

## 部署说明

本项目为 Astro 静态站点，执行构建后可将 `dist/` 目录部署到任意支持静态文件托管的平台，例如：

- Nginx
- Apache
- Cloudflare Pages
- Vercel
- Netlify
- 对象存储静态网站托管
- 自有 CDN 静态源站

## 重要文件

- `src/pages/index.astro`：首页内容、服务数据、接入示例与页面样式。
- `src/layouts/BaseLayout.astro`：全局 HTML 结构、SEO 元信息和基础样式变量。
- `src/components/SiteHeader.astro`：站点头部导航。
- `src/components/SiteFooter.astro`：站点底部信息与外链入口。
- `src/pages/404.astro`：自定义 404 页面。
- `src/pages/waf.astro`：安全拦截提示页面。
- `astro.config.mjs`：Astro 静态输出配置。
- `package.json`：项目脚本与依赖定义。

## 开发建议

- 新增页面时，将 `.astro` 文件放入 `src/pages/`，Astro 会自动生成对应路由。
- 新增复用 UI 时，优先放入 `src/components/`，并在页面中引入。
- 修改全局结构、SEO 信息或基础样式时，优先调整 `src/layouts/BaseLayout.astro`。
- 静态资源建议放入 `public/`，并通过根路径引用。

## 许可证

当前仓库未声明许可证。如需开源分发，请根据实际需求补充 LICENSE 文件。
