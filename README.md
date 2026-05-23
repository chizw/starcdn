<div align="center">
  <img src="public/star/images/logo.png" alt="StarCDN" width="180" />

  <h1>StarCDN</h1>
  <p>稳定、快速、轻量的公共资源 CDN 镜像加速服务。</p>

  <p>
    <a href="https://jscdn.wuxit.cn">官方网站</a>
    ·
    <a href="https://github.com/scfcn/StarCDN/issues">问题反馈</a>
    ·
    <a href="#快速接入">快速接入</a>
  </p>

  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=fff" />
    <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
  </p>
</div>

## 项目简介

StarCDN 是面向开发者和站点维护者的公共资源 CDN 镜像加速项目，提供 Jsdelivr、Gravatar、cdnjs 等常用公开资源的稳定访问入口。项目官网使用 Next.js App Router 构建，重点呈现服务能力、接入方式、常见问题和反馈渠道。

## 核心能力

- 公共库镜像：覆盖 NPM、GitHub、Gravatar、cdnjs 等常见公开资源使用场景。
- 零配置接入：无需注册控制台，只需要替换资源域名即可开始使用。
- 稳定分发路径：通过缓存、回源、刷新和访问侧路径优化提升国内访问体验。
- 现代 Web 协议：默认面向 HTTPS、HTTP/2、HTTP/3 等现代访问环境设计。
- 反馈闭环：资源异常、缓存过期、安全风险和滥用内容可通过邮件或 Issues 反馈。

## 快速接入

将上游公共资源地址替换为 StarCDN 加速地址。

| 资源类型 | 原始地址 | StarCDN 地址 |
| --- | --- | --- |
| Jsdelivr | `//cdn.jsdelivr.net` | `//jscdn.wuxit.cn` |
| Gravatar | `//www.gravatar.com/avatar` | `//jscdn.wuxit.cn/avatar` |
| cdnjs | `//cdnjs.cloudflare.com/ajax` | `//jscdn.wuxit.cn/ajax` |

示例：

```html
<script src="//jscdn.wuxit.cn/npm/jquery@3.6.0/dist/jquery.min.js"></script>
```

如果资源疑似缓存过期，可以在链接后追加 `?flush=1` 触发刷新流程。

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- ESLint Flat Config
- CSS Modules-style global styles by route sections

## 本地开发

克隆仓库并安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

默认访问地址为：

```text
http://localhost:3000
```

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 生成生产构建 |
| `npm run start` | 启动生产服务 |
| `npm run lint` | 运行 ESLint 代码检查 |
| `npm exec tsc -- --noEmit` | 运行 TypeScript 类型检查 |

## 项目结构

```text
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── waf/
│   │   └── page.tsx
│   └── styles/
├── public/
│   ├── img/
│   ├── scripts/
│   └── star/images/
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 部署

项目当前配置为 Next.js standalone 输出，适合部署到 Node.js 服务、容器环境或支持 Next.js 的平台。

生产构建：

```bash
npm run build
```

生产启动：

```bash
npm run start
```

## 反馈与安全

- 资源异常、访问慢、证书问题或缓存问题：请提交 GitHub Issue。
- 安全风险、滥用内容或紧急问题：请发送邮件至 `help@wuxit.cn`。
- 请不要在公开 Issue 中提交密钥、Token、私有链接或其他敏感信息。

## 贡献

欢迎提交问题反馈、文档改进和站点体验优化。提交 Pull Request 前建议先运行：

```bash
npm run lint
npm exec tsc -- --noEmit
npm run build
```

## 许可证

本项目基于 MIT License 开源。请在使用和二次分发时保留原始版权信息。
