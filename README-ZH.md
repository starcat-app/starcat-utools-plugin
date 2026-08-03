# Starcat uTools 插件

<!-- starcat-promo:start -->
<div align="center">
<a href="https://starcat.ink"><img src="https://raw.githubusercontent.com/starcat-app/starcat-pro/main/banner.webp" width="100%" alt="Starcat" /></a>

<p><strong>这是在 uTools 中搜索 Starcat 本地仓库与 GitHub 的官方插件。</strong></p>
<p>Starcat 是一款原生 macOS 应用，可以把 GitHub Stars 变成可搜索、可整理、可用 AI 追问的本地知识库。当前 1.3.0 支持 README 渲染、知识库 RAG、我的项目、全局与仓库洞察、macOS 桌面小组件、标签与私有笔记、Release 追踪、仓库健康度、AI 摘要、语义搜索、浏览器插件，以及 Alfred / uTools / Raycast 外部搜索，并提供多个可自部署 API。</p>

<a href="https://github.com/starcat-app/homebrew-starcat"><img src="https://img.shields.io/badge/Install%20with-Homebrew-FBBF24?style=for-the-badge&logo=homebrew&logoColor=white" width="220" alt="Install with Homebrew"/></a>
<br/>
<sub><a href="./README.md">English</a></sub>
</div>

<div align="center">
<a href="https://starcat.ink"><img src="https://img.shields.io/badge/website-starcat.ink-38BDF8?style=flat&color=blue" alt="website"/></a>
<a href="https://github.com/starcat-app/starcat-pro"><img src="https://img.shields.io/badge/support-starcat--pro-lightgrey.svg?style=flat&color=blue" alt="support"/></a>
<a href="https://github.com/starcat-app/homebrew-starcat"><img src="https://img.shields.io/badge/install-homebrew-lightgrey.svg?style=flat&color=blue" alt="homebrew"/></a>
<a href="https://github.com/starcat-app/starcat-localization"><img src="https://img.shields.io/badge/localization-open-lightgrey.svg?style=flat&color=blue" alt="localization"/></a>
</div>

<div align="center">
<img width="900" src="https://raw.githubusercontent.com/starcat-app/starcat-pro/main/main.webp" alt="Starcat main window"/>
</div>

**首选 Homebrew 安装：**

```bash
brew tap starcat-app/starcat
brew trust starcat-app/starcat
brew install --cask starcat
```

**相关链接：**

- 官网与下载: https://starcat.ink
- 公开支持与发布说明: https://github.com/starcat-app/starcat-pro
- Starcat App Homebrew tap: https://github.com/starcat-app/homebrew-starcat
- CLI / MCP: [starcat-cli](https://github.com/starcat-app/starcat-cli) / [Homebrew tap](https://github.com/starcat-app/homebrew-starcat-cli)
- AI Agent Skill: https://github.com/starcat-app/starcat-skill
- 浏览器插件: [Chrome](https://github.com/starcat-app/starcat-chrome-plugin) / [Safari](https://github.com/starcat-app/starcat-safari-plugin)
- 官方文档: https://github.com/starcat-app/starcat-docs
- 官网源码: https://github.com/starcat-app/starcat-site
- 本地化: https://github.com/starcat-app/starcat-localization

**可自部署支撑 API：**

- [starcat-sharing-api](https://github.com/starcat-app/starcat-sharing-api)
- [starcat-trending-api](https://github.com/starcat-app/starcat-trending-api)
- [starcat-weekly-api](https://github.com/starcat-app/starcat-weekly-api)
- [starcat-wiki-api](https://github.com/starcat-app/starcat-wiki-api)
- [starcat-recommend-api](https://github.com/starcat-app/starcat-recommend-api)
- [starcat-discovery-api](https://github.com/starcat-app/starcat-discovery-api)
<!-- starcat-promo:end -->

在 uTools 中搜索 Starcat 本地仓库与 GitHub 的官方插件。

[English](./README.md)

[![CI](https://github.com/starcat-app/starcat-utools-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/starcat-app/starcat-utools-plugin/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## 功能

在 uTools 中进入 `Starcat` 指令并输入仓库关键词，搜索结果会保持 Starcat 的原始排序，
并展示：

- 仓库 owner/name；
- `Starcat 本地` 或 `GitHub` 来源标识；
- 主要语言、Star 数量和仓库描述；
- owner 或 organization 的公开头像。

按 Return 后，本地结果通过受约束的 Deep Link 在 Starcat 中打开；纯 GitHub 结果在
`github.com` 打开。

## 架构

插件是一个薄 Launcher Adapter：

```text
uTools list
  -> starcat search
  -> starcat.global_search_repos
  -> Starcat Local FTS + GitHub Search
```

插件不读取 Starcat 数据库、Keychain、Local API Key、配对配置或 GitHub Token。
搜索、排序、去重、鉴权和 Starcat Pro 权限判断仍由 Starcat 与 CLI 负责。

## 使用要求

- macOS；
- 支持模板 list 插件的 uTools；
- Starcat 已开启 MCP Service；
- 有效的 Starcat Pro 权益；
- Starcat CLI v1.1.0 或更高版本，并且已经与 Starcat 配对。

通过 Homebrew 安装 CLI：

```bash
brew install starcat-app/starcat-cli/starcat
starcat pair
starcat doctor
```

插件会依次从 `PATH`、`/opt/homebrew/bin`、`/usr/local/bin` 和
`~/.local/bin` 查找 `starcat`。开发者也可以设置绝对路径
`STARCAT_CLI_PATH`。

## 本地开发

运行时代码只使用清晰可读的 CommonJS 和 Node 内置模块，没有 runtime npm 依赖。

```bash
npm ci
npm run verify
```

在 uTools 中接入：

1. 安装 uTools 与「开发者工具」插件。
2. 选择本仓库的 `plugin.json`。
3. 进入 `Starcat` 指令。
4. 输入仓库关键词。

首版固定同时搜索本地与 GitHub。未来可以增加来源选择，但不会把搜索逻辑移入插件。

## 测试

自动化覆盖 CLI 路径、argv 安全、契约解析、稳定错误码、URL allowlist、列表映射、
取消、超时、debounce 和旧结果保护。

测试 fixture 来自版本化真源：
[`starcat-cli/contracts/global-search`](https://github.com/starcat-app/starcat-cli/tree/main/contracts/global-search)。

## 打包与发布

`scripts/verify-package.sh` 只验证源码包，不生成可安装文件。

UPXS 必须通过 uTools 开发者工具手动生成。首个应用市场正式版本使用 `1.0.0`，仓库
开发阶段从 `0.1.0` 开始。详见 [RELEASING.md](./RELEASING.md)。

## 隐私、安全与支持

- [隐私说明](./PRIVACY.md)
- [安全策略](./SECURITY.md)
- [支持渠道](./SUPPORT.md)
- [参与贡献](./CONTRIBUTING.md)
- [更新记录](./CHANGELOG.md)

## License

MIT，详见 [LICENSE](./LICENSE)。
