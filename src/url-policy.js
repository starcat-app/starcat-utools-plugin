// 外部 URL allowlist。适配器只能打开 MCP 已输出且再次通过本地约束的仓库 URL。
"use strict";

const REPOSITORY_SEGMENT = /^[A-Za-z0-9_.-]+$/;

function hasExplicitPort(rawValue) {
  const match = String(rawValue).match(/^[A-Za-z][A-Za-z0-9+.-]*:\/\/([^/?#]*)/);
  if (!match) {
    return false;
  }
  const authority = match[1].slice(match[1].lastIndexOf("@") + 1);
  return /:[0-9]+$/.test(authority);
}

function repositorySegments(pathname) {
  const parts = String(pathname || "")
    .split("/")
    .filter(Boolean);
  if (
    parts.length !== 2 ||
    !REPOSITORY_SEGMENT.test(parts[0]) ||
    !REPOSITORY_SEGMENT.test(parts[1])
  ) {
    return null;
  }
  return parts;
}

function safeOpenURL(rawValue) {
  if (typeof rawValue !== "string" || rawValue.length === 0) {
    return null;
  }
  let url;
  try {
    url = new URL(rawValue);
  } catch (_error) {
    return null;
  }
  // WHATWG URL 会把显式默认端口 `:443` 归一化为空，因此还要检查原始 authority。
  if (
    url.username ||
    url.password ||
    url.port ||
    hasExplicitPort(rawValue) ||
    url.hash ||
    !repositorySegments(url.pathname)
  ) {
    return null;
  }
  if (url.protocol === "https:") {
    return url.hostname.toLowerCase() === "github.com" && !url.search
      ? rawValue
      : null;
  }
  if (url.protocol !== "starcat:" || url.hostname !== "repo") {
    return null;
  }
  const keys = Array.from(url.searchParams.keys());
  if (
    url.searchParams.getAll("v").length !== 1 ||
    url.searchParams.get("v") !== "1" ||
    keys.some((key) => key !== "v" && key !== "rid")
  ) {
    return null;
  }
  if (url.searchParams.has("rid")) {
    const values = url.searchParams.getAll("rid");
    if (values.length !== 1 || !/^[1-9][0-9]*$/.test(values[0])) {
      return null;
    }
  }
  return rawValue;
}

function safeAvatarURL(rawValue) {
  if (typeof rawValue !== "string" || rawValue.length === 0) {
    return null;
  }
  let url;
  try {
    url = new URL(rawValue);
  } catch (_error) {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    hasExplicitPort(rawValue) ||
    url.hash
  ) {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (host === "avatars.githubusercontent.com") {
    return rawValue;
  }
  if (host === "github.com" && url.pathname.toLowerCase().endsWith(".png")) {
    return rawValue;
  }
  return null;
}

module.exports = {
  safeAvatarURL,
  safeOpenURL
};
