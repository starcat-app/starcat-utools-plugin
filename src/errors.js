// 稳定错误码到 uTools 展示文案的唯一映射。
"use strict";

const PUBLIC_ERROR_CODES = new Set([
  "CLI_NOT_FOUND",
  "CLI_NOT_PAIRED",
  "REQUIRES_PRO",
  "MCP_DISABLED",
  "UPGRADE_REQUIRED",
  "SEARCH_TIMEOUT",
  "SEARCH_FAILED"
]);

class LauncherError extends Error {
  constructor(code, message, options) {
    super(message);
    this.name = "LauncherError";
    this.code = code;
    if (options && options.cause) {
      this.cause = options.cause;
    }
  }
}

function parseStableErrorCode(stderr) {
  const match = String(stderr || "").match(/STARCAT_ERROR\s+([A-Z_]+)\s*:/);
  if (!match || !PUBLIC_ERROR_CODES.has(match[1])) {
    return null;
  }
  return match[1];
}

function userFacingError(error) {
  const code = error && PUBLIC_ERROR_CODES.has(error.code)
    ? error.code
    : "SEARCH_FAILED";
  switch (code) {
    case "CLI_NOT_FOUND":
      return {
        title: "未找到 Starcat CLI",
        description: "请通过 Homebrew 安装 CLI，或配置 STARCAT_CLI_PATH 绝对路径"
      };
    case "CLI_NOT_PAIRED":
      return {
        title: "Starcat CLI 尚未配对",
        description: "在 Starcat 的 MCP 设置中复制配对命令"
      };
    case "REQUIRES_PRO":
      return {
        title: "uTools 集成需要 Starcat Pro",
        description: "打开 Starcat 查看 Pro 方案"
      };
    case "MCP_DISABLED":
      return {
        title: "Starcat MCP Service 未开启",
        description: "请在 Starcat 设置中开启 MCP Service"
      };
    case "UPGRADE_REQUIRED":
      return {
        title: "请升级 Starcat 和 CLI",
        description: "当前版本不支持全局仓库搜索"
      };
    case "SEARCH_TIMEOUT":
      return {
        title: "搜索超时",
        description: "请检查 Starcat MCP Service 和网络连接"
      };
    default:
      return {
        title: "搜索失败",
        description: "请运行 starcat doctor 检查连接"
      };
  }
}

module.exports = {
  LauncherError,
  PUBLIC_ERROR_CODES,
  parseStableErrorCode,
  userFacingError
};
