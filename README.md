<div align="center">
  <h1>StarCDN</h1>
  <p><strong>稳定、快速、轻量的公共资源 CDN 镜像加速服务</strong></p>

  <p>
    <a href="https://fastjs.qixz.cn">官方网站</a>
    ·
    <a href="https://github.com/chizw/StarCDN/issues">问题反馈</a>
    ·
    <a href="#快速接入">快速接入</a>
    ·
    <a href="#参与贡献">参与贡献</a>
  </p>

  <p>
    <img alt="Build Status" src="https://img.shields.io/github/actions/workflow/status/chizw/StarCDN/ci.yml?branch=main" />
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8+-3178C6?logo=typescript&logoColor=fff" />
    <img alt="Go" src="https://img.shields.io/badge/Go-1.25+-00ADD8?logo=go&logoColor=fff" />
    <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
    <img alt="Docker" src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=fff" />
  </p>
</div>

---

## 📖 目录

- [项目简介](#项目简介)
- [核心能力](#核心能力)
- [快速接入](#快速接入)
- [技术栈](#技术栈)
- [架构说明](#架构说明)
- [本地开发](#本地开发)
- [可用脚本](#可用脚本)
- [项目结构](#项目结构)
- [Go 代理服务](#go-代理服务)
- [部署](#部署)
- [CI/CD](#cicd)
- [反馈与安全](#反馈与安全)
- [参与贡献](#参与贡献)
- [许可证](#许可证)

## 项目简介

StarCDN 是面向开发者和站点维护者的公共资源 CDN 镜像加速项目，提供 Jsdelivr、Gravatar、cdnjs 等常用公开资源的稳定访问入口。项目官网使用 Next.js App Router 构建，重点呈现服务能力、接入方式、常见问题和反馈渠道。

**为什么选择 StarCDN？**

- ✅ **零配置接入**：无需注册控制台，只需替换资源域名即可开始使用
- ✅ **稳定分发路径**：通过缓存、回源、刷新和访问侧路径优化提升国内访问体验
- ✅ **现代 Web 协议**：默认面向 HTTPS、HTTP/2、HTTP/3 等现代访问环境设计
- ✅ **开源透明**：基于 MIT License 开源，欢迎社区参与和贡献

## 核心能力

- **公共库镜像**：覆盖 NPM、GitHub、Gravatar、cdnjs 等常见公开资源使用场景
- **零配置接入**：无需注册控制台，只需替换资源域名即可开始使用
- **稳定分发路径**：通过缓存、回源、刷新和访问侧路径优化提升国内访问体验
- **现代 Web 协议**：默认面向 HTTPS、HTTP/2、HTTP/3 等现代访问环境设计
- **反馈闭环**：资源异常、缓存过期、安全风险和滥用内容可通过邮件或 Issues 反馈

## 快速接入

将上游公共资源地址替换为 StarCDN 加速地址。

| 资源类型 | 原始地址 | StarCDN 地址 |
| --- | --- | --- |
| Jsdelivr | `//cdn.jsdelivr.net` | `//fastjs.qixz.cn` |
| Gravatar | `//www.gravatar.com/avatar` | `//fastjs.qixz.cn/avatar` |
| cdnjs | `//cdnjs.cloudflare.com/ajax` | `//fastjs.qixz.cn/ajax` |

### 基础示例

**HTML 引用：**

```html
<script src="//fastjs.qixz.cn/npm/jquery@3.6.0/dist/jquery.min.js"></script>
```

**CSS 引用：**

```html
<link rel="stylesheet" href="//fastjs.qixz.cn/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
```

**Gravatar 头像：**

```html
<img src="//fastjs.qixz.cn/avatar/HASH?s=80&d=mm" alt="Avatar" />
```

### 高级用法

**缓存策略：**

本地缓存默认保留 **10 分钟**，用于吸收短时流量峰值，同时给上游 CDN 留出缓存窗口；过期后由后台清理任务自动删除磁盘文件。可通过 `STARCDN_CACHE_TTL` 调整保留时长。

**带版本号的资源：**

```html
<!-- 指定版本 -->
<script src="//fastjs.qixz.cn/npm/vue@3.3.4/dist/vue.global.prod.js"></script>

<!-- 最新版本 -->
<script src="//fastjs.qixz.cn/npm/vue/dist/vue.global.prod.js"></script>
```

## 技术栈

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Next.js | 16 | App Router 静态导出模式 |
| React | 19 | 用户界面构建 |
| TypeScript | 5.8+ | 类型安全开发 |
| Go | 1.25+ | 代理后端服务 |
| SQLite | modernc.org/sqlite | 纯 Go 实现，无 CGO 依赖 |
| ESLint | 9 | Flat Config 代码检查 |

## 架构说明

本项目采用 **Next.js 静态导出 + Go 统一服务** 架构：

```
用户请求 → Go(:2606)
              ├── 静态文件（out/）← Next.js 构建产物
              ├── 代理路由（/npm/, /gh/, /wp/, 等）
              └── 管理 API（/admin/api/*）← JWT + Passkey 认证
```

**管理后台架构策略：**

- **开发阶段**：使用 Next.js App Router 客户端渲染（`app/admin/`）
- **生产阶段**：管理 API 由 Go 后端提供，前端界面可选择：
  - 静态导出模式：通过 Next.js CSR 实现动态数据获取
  - 服务端模板模式：使用 Go 的 HTML 模板（`templates/admin/`）提供备用界面

## 本地开发

### 环境要求

- Node.js 18+
- Go 1.25+
- npm 9+ 或 yarn 1.22+

### 安装步骤

1. **克隆仓库**

   ```bash
   git clone https://github.com/chizw/StarCDN.git
   cd StarCDN
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **配置环境变量**

   ```bash
   cp .env.example .env
   # 编辑 .env 文件配置相关参数
   ```

4. **启动开发服务器**

   **仅前端（Next.js）：**

   ```bash
   npm run dev
   ```

   **同时启动前端和后端（推荐）：**

   ```bash
   npm run dev:all
   ```

5. **访问应用**

   ```text
   http://localhost:2607
   ```

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Next.js 前端开发服务器 |
| `npm run dev:backend` | 启动 Go 后端服务 |
| `npm run dev:all` | 同时启动前端和后端（并发） |
| `npm run build` | 生成生产构建 |
| `npm run start` | 启动生产服务 |
| `npm run lint` | 运行 ESLint 代码检查 |
| `npm run typecheck` | 运行 TypeScript 类型检查 |

## 项目结构

```text
.
├── app/                          # Next.js 前端（App Router）
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页
│   ├── not-found.tsx            # 404 页面
│   ├── admin/                   # 管理后台（客户端渲染）
│   ├── waf/                     # WAF 页面
│   └── styles/                  # 按路由划分的样式
├── cmd/starcdn/                 # Go 入口点
│   └── main.go
├── internal/                    # Go 业务逻辑
│   ├── server/                  # HTTP 服务、代理、缓存
│   ├── admin/                   # 管理 API 处理器
│   ├── auth/                    # JWT + WebAuthn 认证
│   └── db/                      # SQLite 数据库操作
├── public/                      # 静态资源
│   ├── img/
│   ├── scripts/
│   └── star/images/
├── templates/admin/             # Go HTML 模板（备用管理界面）
├── .env.example                 # 环境变量示例
├── Dockerfile                   # 多阶段构建配置
├── docker-compose.yml           # Docker Compose 编排
├── nginx.conf                   # Nginx 反向代理配置（可选）
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Go 代理服务

Go 后端会同时托管 `out/` 静态官网和公共资源代理路径。

| 代理目录 | 主用 | 备用 |
| --- | --- | --- |
| `/gh/` | `https://cdn.jsdelivr.net/gh/` | — |
| `/npm/` | `https://unpkg.com/` | `https://cdn.jsdelivr.net/npm/` |
| `/ajax/libs/` | `https://cdnjs.cloudflare.com/ajax/libs/` | — |
| `/avatar/` | 智能分发（见下） | — |

### `/avatar/` 智能分发

`/avatar/` 严格要求单段 param（即 `/avatar/[参数]`），多段路径直接 400。

**Param 分发**（按优先级）：

| Param 形态 | 例子 | 主用上游 | 备用上游 |
| --- | --- | --- | --- |
| 纯数字（4–12 位 QQ 号） | `1234567` | `https://q1.qlogo.cn/g?b=qq&nk=...&s=...` | — |
| `数字@qq.com` | `1234567@qq.com` | 同上（提取 QQ 号） | — |
| 32 位 MD5 hex（原生） | `abcdef0123456789...` | `https://weavatar.com/avatar/<hash>` | `https://secure.gravatar.com/avatar/<hash>` |
| 其他 email | `user@gmail.com` | 内部 MD5(lowercase) → WeAvatar | Gravatar |
| 其他字符串 | `somerandom` | 兜底当 hash → WeAvatar | Gravatar |

WeAvatar 内置 Gravatar fallback（拿不到会自动查 Gravatar），绝大多数情况都一次命中；只有 WeAvatar 自身 5xx/网络错误时才会触发 Gravatar 备用。

**尺寸参数**：`?s=640` 与 `?size=640` 都支持（`s` 优先）。**快速档**（`s=1`~`5`）映射到 40 / 80 / 160 / 320 / 640。完整范围 1–2048，缺省 80，非法值回落 80。

### 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `STARCDN_ADDR` | `:2606` | Go 服务监听地址 |
| `STARCDN_STATIC_DIR` | `out` | 静态官网目录 |
| `STARCDN_CACHE_DIR` | `.cache/starcdn` | 代理文件缓存目录 |
| `STARCDN_CACHE_TTL` | `10m` | 本地代理缓存保留时长，过期后由后台任务自动清理 |
| `STARCDN_DB_PATH` | 空 | SQLite 数据库路径（留空禁用管理后台） |
| `STARCDN_ADMIN_USER` | 空 | 管理员用户名 |
| `STARCDN_ADMIN_PASS` | 空 | 管理员密码 |
| `STARCDN_JWT_SECRET` | 自动生成 | JWT 签名密钥 |
| `STARCDN_RP_ID` | `localhost` | WebAuthn 依赖方 ID |
| `STARCDN_RP_ORIGIN` | `http://localhost:2606` | WebAuthn 依赖方 Origin |

完整的环境变量示例请参考 [.env.example](.env.example) 文件。

## 部署

### 生产构建

项目当前配置为 Next.js static export 输出，生产构建产物位于 `out/`，容器镜像会使用 Go 后端托管静态官网并提供代理能力。

```bash
npm run build
```

### Docker Compose 部署

```bash
docker compose up -d --build
```

### 使用 GHCR 镜像部署

```bash
docker pull ghcr.io/chizw/starcdn:latest
docker compose up -d
```

默认容器端口映射为 `2607:2607`，启动后访问：

```text
http://localhost:2607
```

## CI/CD

仓库包含完整 GitHub Actions 工作流：

- **代码审查**：Push 到 `main` 或 `master` 时自动运行（安装依赖、ESLint、TypeScript 类型检查和预构建）
- **版本发布**：通过 GitHub Actions 手动触发（workflow_dispatch），支持选择是否发布 Docker 镜像、是否创建 Release 以及指定版本号

### 发布新版本

通过 GitHub Actions 页面手动运行 "CI/CD" 工作流，勾选发布选项并填写版本号。

## 反馈与安全

- **资源异常**：访问慢、证书问题或缓存问题 → [提交 GitHub Issue](https://github.com/chizw/StarCDN/issues)
- **安全风险**：滥用内容或紧急问题 → 发送邮件至 `help@wuxit.cn`
- **注意事项**：请不要在公开 Issue 中提交密钥、Token、私有链接或其他敏感信息

## 参与贡献

欢迎提交问题反馈、文档改进和站点体验优化！

### 贡献步骤

1. **Fork 本项目**
2. **创建特性分支**：`git checkout -b feature/AmazingFeature`
3. **提交更改**：`git commit -m 'Add some AmazingFeature'`
4. **推送到分支**：`git push origin feature/AmazingFeature`
5. **开启 Pull Request**

### 开发规范

提交 Pull Request 前建议先运行：

```bash
npm run lint
npm run typecheck
npm run build
```

## 许可证

本项目基于 [MIT License](LICENSE) 开源。请在使用和二次分发时保留原始版权信息。

## 鸣谢

- [JsdMirror](https://cnb.cool/jsdmirror/home)

---

<div align="center">
  <p>如果这个项目对你有帮助，请给一个 ⭐️ 支持一下！</p>
  <p>Made with ❤️ by <a href="https://github.com/chizw">筱序二十</a></p>
</div>
