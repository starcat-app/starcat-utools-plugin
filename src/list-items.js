// Starcat 搜索契约到 uTools list item 的纯展示映射。
"use strict";

const { FALLBACK_ICON } = require("./constants");
const { userFacingError } = require("./errors");
const { safeAvatarURL, safeOpenURL } = require("./url-policy");

function formatStars(value) {
  const stars = Number.isFinite(value) ? value : 0;
  if (Math.abs(stars) >= 1000000) {
    return trimDecimal(stars / 1000000) + "M";
  }
  if (Math.abs(stars) >= 1000) {
    return trimDecimal(stars / 1000) + "k";
  }
  return String(stars);
}

function trimDecimal(value) {
  const digits = Math.abs(value) >= 100 ? 0 : 1;
  return value.toFixed(digits).replace(/\.0$/, "");
}

function collapseText(value, maxLength) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return normalized.slice(0, Math.max(0, maxLength - 1)) + "…";
}

function repositoryItem(repository) {
  const openURL = safeOpenURL(repository.open_url);
  if (!openURL) {
    return null;
  }
  const parts = [
    repository.primary_source === "local" ? "Starcat 本地" : "GitHub"
  ];
  if (repository.language && String(repository.language).trim()) {
    parts.push(String(repository.language).trim());
  }
  parts.push("★ " + formatStars(repository.stars_count));
  if (repository.description) {
    const description = collapseText(repository.description, 140);
    if (description) {
      parts.push(description);
    }
  }
  return {
    title: repository.full_name,
    description: parts.join(" · "),
    icon: safeAvatarURL(repository.icon_url) || FALLBACK_ICON,
    openURL
  };
}

function searchResultItems(result) {
  const items = result.items
    .map(repositoryItem)
    .filter(Boolean);
  if (items.length === 0) {
    items.push({
      title: "没有找到仓库",
      description: "已搜索 Starcat 本地仓库和 GitHub",
      icon: FALLBACK_ICON
    });
  }
  for (const warning of result.warnings) {
    items.push({
      title: "部分搜索来源暂不可用",
      description: collapseText(warning, 160),
      icon: FALLBACK_ICON
    });
  }
  return items;
}

function errorItem(error) {
  const presentation = userFacingError(error);
  return {
    title: presentation.title,
    description: presentation.description,
    icon: FALLBACK_ICON
  };
}

function placeholderItem() {
  return {
    title: "输入仓库关键词",
    description: "搜索 Starcat 本地仓库与 GitHub",
    icon: FALLBACK_ICON
  };
}

module.exports = {
  collapseText,
  errorItem,
  formatStars,
  placeholderItem,
  repositoryItem,
  searchResultItems
};
