#!/usr/bin/env node
// 校验 uTools 模板插件的可打包边界，不生成 UPXS，也不调用开发者工具。
"use strict";

const fs = require("fs");
const path = require("path");

const { FEATURE_CODE } = require("../src/constants");

const root = path.resolve(__dirname, "..");
const plugin = JSON.parse(fs.readFileSync(path.join(root, "plugin.json"), "utf8"));

function fail(message) {
  throw new Error(message);
}

if ("main" in plugin) {
  fail("template list plugin must not define plugin.json main");
}
if ("tools" in plugin) {
  fail("the first release must not expose uTools AI tools");
}
if (plugin.preload !== "preload.js") {
  fail("plugin.json preload must be preload.js");
}
if (!Array.isArray(plugin.features) || plugin.features.length !== 1) {
  fail("plugin.json must contain exactly one feature");
}
const feature = plugin.features[0];
if (feature.code !== FEATURE_CODE) {
  fail("plugin feature code does not match the runtime constant");
}
if (
  !Array.isArray(feature.platform) ||
  feature.platform.length !== 1 ||
  feature.platform[0] !== "darwin"
) {
  fail("plugin feature must be restricted to darwin");
}

for (const relativePath of [
  plugin.logo,
  plugin.preload,
  feature.icon,
  "assets/repo-fallback.png"
]) {
  if (!relativePath || !fs.statSync(path.join(root, relativePath)).isFile()) {
    fail("missing runtime file: " + relativePath);
  }
}

// preload 可被 Node require，便于 CI 确认 window.exports key 与 feature code 一致。
global.window = {};
global.utools = {
  onPluginOut() {}
};
require(path.join(root, "preload.js"));
if (
  !window.exports ||
  !window.exports[FEATURE_CODE] ||
  window.exports[FEATURE_CODE].mode !== "list"
) {
  fail("preload window.exports does not expose the list feature");
}

process.stdout.write("uTools plugin structure is valid\n");
