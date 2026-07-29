// uTools 与测试共同使用的最小常量，避免 plugin feature code 和 preload key 漂移。
"use strict";

module.exports = Object.freeze({
  FEATURE_CODE: "starcat-repository-search",
  FALLBACK_ICON: "assets/repo-fallback.png",
  DEFAULT_SOURCE: "all",
  DEFAULT_LIMIT: 30,
  DEFAULT_DEBOUNCE_MS: 200,
  DEFAULT_TIMEOUT_MS: 8000,
  MAX_STDOUT_BYTES: 2 * 1024 * 1024,
  MAX_STDERR_BYTES: 64 * 1024
});
