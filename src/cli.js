// Starcat CLI 定位与进程调用。
//
// 查询词始终作为 argv 元素传给 execFile，禁止 shell 拼接。AbortSignal 同时承担
// 快速输入取消和 timeout 终止，避免 uTools 退出后遗留搜索子进程。
"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  DEFAULT_LIMIT,
  DEFAULT_SOURCE,
  DEFAULT_TIMEOUT_MS,
  MINIMUM_CLI_VERSION,
  MAX_STDERR_BYTES,
  MAX_STDOUT_BYTES
} = require("./constants");
const { decodeSearchResult } = require("./contract");
const {
  LauncherError,
  parseStableErrorCode
} = require("./errors");

function executableFile(candidate) {
  try {
    const stats = fs.statSync(candidate);
    fs.accessSync(candidate, fs.constants.X_OK);
    return stats.isFile();
  } catch (_error) {
    return false;
  }
}

function resolveCLI(explicitPath, environment) {
  const env = environment || process.env;
  const candidates = [];
  const configured = String(explicitPath || env.STARCAT_CLI_PATH || "").trim();
  if (configured) {
    if (!path.isAbsolute(configured)) {
      throw new LauncherError(
        "CLI_NOT_FOUND",
        "STARCAT_CLI_PATH must be an absolute path"
      );
    }
    candidates.push(configured);
  }
  for (const directory of String(env.PATH || "").split(path.delimiter)) {
    if (directory) {
      candidates.push(path.join(directory, "starcat"));
    }
  }
  candidates.push(
    "/opt/homebrew/bin/starcat",
    "/usr/local/bin/starcat",
    path.join(os.homedir(), ".local", "bin", "starcat")
  );

  const seen = new Set();
  for (const candidate of candidates) {
    const normalized = path.resolve(candidate);
    if (!seen.has(normalized) && executableFile(normalized)) {
      return normalized;
    }
    seen.add(normalized);
  }
  throw new LauncherError("CLI_NOT_FOUND", "Starcat CLI was not found");
}

function buildSearchArgs(query, source, limit) {
  const normalizedQuery = String(query || "").trim();
  if (normalizedQuery.length === 0 || normalizedQuery.length > 200) {
    throw new LauncherError(
      "SEARCH_FAILED",
      "query must contain between 1 and 200 characters"
    );
  }
  if (!["all", "local", "github"].includes(source)) {
    throw new LauncherError("SEARCH_FAILED", "unsupported search source");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new LauncherError("SEARCH_FAILED", "limit must be between 1 and 50");
  }
  return [
    "search",
    normalizedQuery,
    "--source",
    source,
    "--limit",
    String(limit)
  ];
}

function parseCLIVersion(output) {
  const match = String(output || "").trim().match(
    /^Starcat CLI v?([0-9]+)\.([0-9]+)\.([0-9]+)$/
  );
  return match ? match.slice(1).map(Number) : null;
}

function versionIsOlder(version, minimum) {
  for (let index = 0; index < minimum.length; index += 1) {
    if (version[index] !== minimum[index]) {
      return version[index] < minimum[index];
    }
  }
  return false;
}

function executeCLI(executable, args, options) {
  const settings = options || {};
  const execFile = settings.execFile || childProcess.execFile;
  const callerSignal = settings.signal;
  const timeoutMs = settings.timeoutMs || DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  let timedOut = false;
  let stderrOverflow = false;

  return new Promise((resolve, reject) => {
    const relayAbort = () => controller.abort();
    if (callerSignal) {
      if (callerSignal.aborted) {
        reject(new LauncherError("ABORTED", "Search was cancelled"));
        return;
      }
      callerSignal.addEventListener("abort", relayAbort, { once: true });
    }

    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const finish = (handler) => {
      clearTimeout(timeout);
      if (callerSignal) {
        callerSignal.removeEventListener("abort", relayAbort);
      }
      handler();
    };

    let child;
    try {
      child = execFile(
        executable,
        args,
        {
          encoding: "utf8",
          maxBuffer: MAX_STDOUT_BYTES,
          shell: false,
          signal: controller.signal,
          windowsHide: true
        },
        (error, stdout, stderr) => {
          finish(() => {
            if (timedOut) {
              reject(new LauncherError("SEARCH_TIMEOUT", "Starcat search timed out"));
              return;
            }
            if (callerSignal && callerSignal.aborted) {
              reject(new LauncherError("ABORTED", "Search was cancelled"));
              return;
            }
            if (stderrOverflow) {
              reject(new LauncherError("SEARCH_FAILED", "Starcat CLI stderr exceeded the limit"));
              return;
            }
            if (error) {
              if (error.code === "ENOENT") {
                reject(new LauncherError("CLI_NOT_FOUND", "Starcat CLI was not found"));
                return;
              }
              const code = parseStableErrorCode(stderr) || "SEARCH_FAILED";
              reject(new LauncherError(code, "Starcat search failed", { cause: error }));
              return;
            }
            resolve(String(stdout || ""));
          });
        }
      );
    } catch (error) {
      finish(() => reject(new LauncherError(
        error && error.code === "ENOENT" ? "CLI_NOT_FOUND" : "SEARCH_FAILED",
        "Unable to start Starcat CLI",
        { cause: error }
      )));
      return;
    }

    // execFile 只有一个 maxBuffer。stdout 使用 2 MiB 上限，stderr 另外在流层面
    // 提前终止到 64 KiB，避免错误进程把无界日志保留在 uTools 内存中。
    if (child && child.stderr && typeof child.stderr.on === "function") {
      let stderrBytes = 0;
      child.stderr.on("data", (chunk) => {
        stderrBytes += Buffer.byteLength(chunk);
        if (stderrBytes > MAX_STDERR_BYTES && !stderrOverflow) {
          stderrOverflow = true;
          controller.abort();
        }
      });
    }
  });
}

async function searchRepositories(options) {
  const settings = options || {};
  const source = settings.source || DEFAULT_SOURCE;
  const limit = settings.limit || DEFAULT_LIMIT;
  const args = buildSearchArgs(settings.query, source, limit);
  const executable = resolveCLI(settings.cliPath, settings.environment);
  const executeOptions = {
    execFile: settings.execFile,
    signal: settings.signal,
    timeoutMs: settings.timeoutMs
  };
  let stdout;
  try {
    stdout = await executeCLI(executable, args, executeOptions);
  } catch (searchError) {
    if (!searchError || searchError.code !== "SEARCH_FAILED") {
      throw searchError;
    }

    // v1.0.0 尚未实现 search，也无法输出稳定错误码。只在未分类失败路径额外
    // 查询一次版本，避免正常输入热路径为每个关键词多启动一个进程。
    try {
      const versionOutput = await executeCLI(executable, ["version"], executeOptions);
      const version = parseCLIVersion(versionOutput);
      if (version && versionIsOlder(version, MINIMUM_CLI_VERSION)) {
        throw new LauncherError(
          "UPGRADE_REQUIRED",
          "Starcat CLI 1.1.0 or newer is required"
        );
      }
    } catch (diagnosticError) {
      if (diagnosticError && diagnosticError.code === "UPGRADE_REQUIRED") {
        throw diagnosticError;
      }
      // 诊断失败不能覆盖原始搜索错误，否则会把网络或服务问题误报成版本问题。
    }
    throw searchError;
  }
  if (Buffer.byteLength(stdout, "utf8") > MAX_STDOUT_BYTES) {
    throw new LauncherError("SEARCH_FAILED", "Starcat CLI stdout exceeded the limit");
  }
  return decodeSearchResult(stdout);
}

module.exports = {
  buildSearchArgs,
  executeCLI,
  executableFile,
  parseCLIVersion,
  resolveCLI,
  searchRepositories,
  versionIsOlder
};
