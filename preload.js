// Starcat uTools 模板插件入口。
//
// preload 必须保持清晰可读的 CommonJS 源码，这是 uTools 的安全审查约束。搜索、
// 排序、去重、鉴权和 Pro 判断全部由 Starcat CLI/MCP 负责，这里只做宿主适配。
"use strict";

const { createSearchController } = require("./src/search-controller");
const { safeOpenURL } = require("./src/url-policy");

const controller = createSearchController();

function selectItem(_action, item) {
  const openURL = safeOpenURL(item && item.openURL);
  if (!openURL) {
    return;
  }

  try {
    utools.hideMainWindow();
    utools.shellOpenExternal(openURL);
    utools.outPlugin();
  } catch (_error) {
    // 打开失败不回退另一个 URL，避免绕过已经验证的 open_url 产品语义。
    utools.showNotification("无法打开仓库，请稍后重试。");
  }
}

window.exports = {
  "starcat-repository-search": {
    mode: "list",
    args: {
      enter: (_action, callbackSetList) => {
        callbackSetList([controller.placeholderItem()]);
      },
      search: (_action, searchWord, callbackSetList) => {
        // controller 内部捕获所有异步错误；这里不返回悬空 Promise。
        controller.search(searchWord, callbackSetList);
      },
      select: selectItem,
      placeholder: "搜索 Starcat 本地与 GitHub 仓库"
    }
  }
};

if (typeof utools.onPluginOut === "function") {
  utools.onPluginOut(() => controller.dispose());
}
