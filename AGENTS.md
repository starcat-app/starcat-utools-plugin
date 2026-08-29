# AGENTS.md — Starcat uTools Plugin

本文档是本仓库 AI 协作规则的唯一维护源。

## 独立仓库边界

- 本目录是 `starcat-app/starcat-utools-plugin` 独立 Git 仓库，拥有自己的版本、
  CI、UPXS 打包和 uTools Marketplace 发布边界。
- 修改前必须确认当前分支与工作区状态；未经 dong4j 明确要求，不得切换分支、提交或处理其他仓库。
- 本仓只负责 uTools template list 适配；搜索能力与 contract 由 `starcat-cli` 提供。

## 用途与技术栈

本项目是在 macOS uTools 中搜索 Starcat 本地仓库与 GitHub 的薄适配器。
preload 层调用已配对的 `starcat search`，保持 CLI 的排序和来源标记，再把结果映射为
uTools 列表项。

- Node.js >= 16.17.0
- 可读 CommonJS 与 Node 内置模块
- uTools `plugin.json` + `preload.js`
- Node 内置 test runner；无 runtime npm 依赖

## 关键目录

- `plugin.json`：macOS 平台、命令、图标和 preload 声明。
- `preload.js`：uTools 暴露入口。
- `src/cli.js`：CLI 定位与安全调用。
- `src/contract.js` / `src/errors.js`：schema v1 解码与稳定错误码。
- `src/search-controller.js`：debounce、取消、超时和过期结果保护。
- `src/url-policy.js` / `src/list-items.js`：URL allowlist 与列表展示。
- `test/`：CLI、contract、错误、URL 与搜索控制测试。
- `scripts/verify-plugin.js` / `scripts/verify-package.sh`：源码和待发布包校验。

## 开发与验证

```bash
npm ci
npm run verify
bash -n scripts/*.sh
git diff --check
```

本地联调时，通过 uTools Developer Tools 选择仓库根 `plugin.json`，再运行
`Starcat` 命令；该过程不等于生成或上传 Marketplace 包。

## 项目特有约束

- 保持薄适配器：不得读取 Starcat SQLite、Keychain、API key、pairing profile
  或 GitHub token，不得复制搜索、排序、去重、鉴权或 Pro entitlement。
- 调用必须基于 `starcat search`，并遵守
  `starcat-cli/contracts/global-search` v1。共享 fixture 应从 CLI 的版本化来源同步，
  不得在本仓私自扩展不兼容字段或错误码。
- 查询必须作为独立 argv 传递，禁止通过 shell 拼接；CLI 搜索路径只允许既定 PATH、
  Homebrew 路径、`~/.local/bin` 或显式绝对 `STARCAT_CLI_PATH`。
- 必须保留取消、超时、debounce、过期结果保护、输出边界和 URL allowlist。
- 第一版固定搜索 local + GitHub；不得把来源选择或业务搜索逻辑下沉到插件。
- 保持无 runtime npm 依赖；若确需引入，必须先说明包体、安全和 uTools 运行时影响。

## 发布边界与禁令

`scripts/verify-package.sh` 只校验源码包，不生成 UPXS。UPXS 必须通过 uTools
Developer Tools 手工生成，Marketplace 上传是独立外部操作。未经 dong4j 在当前任务中
明确授权，禁止生成或上传 UPXS、创建或推送 tag、执行 `git push`、发布 Release、
提交 Marketplace 审核或执行任何对外分发操作。
