#!/bin/bash
# 只验证源码包结构，不生成 UPXS；正式离线包必须由 uTools 开发者工具构建。

set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

node scripts/verify-plugin.js
npm run check
npm test
