"use strict";

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  buildSearchArgs,
  executeCLI,
  parseCLIVersion,
  resolveCLI,
  searchRepositories,
  versionIsOlder
} = require("../src/cli");
const { fixtureText } = require("./helpers");

function executableFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "starcat-utools-test-"));
  const executable = path.join(directory, "starcat");
  fs.writeFileSync(executable, "#!/bin/sh\nexit 0\n");
  fs.chmodSync(executable, 0o755);
  return {
    executable,
    cleanup: () => fs.rmSync(directory, { recursive: true, force: true })
  };
}

function fakeExecFile(result, inspect) {
  return (file, args, options, callback) => {
    if (inspect) {
      inspect(file, args, options);
    }
    const child = {
      stderr: new EventEmitter()
    };
    process.nextTick(() => {
      if (result.stderrChunk) {
        child.stderr.emit("data", result.stderrChunk);
      }
      callback(result.error || null, result.stdout || "", result.stderr || "");
    });
    return child;
  };
}

test("builds an argv array without shell interpolation", () => {
  const query = "$(touch /tmp/should-not-run); owner/repo";
  assert.deepEqual(buildSearchArgs(query, "all", 30), [
    "search",
    query,
    "--source",
    "all",
    "--limit",
    "30"
  ]);
});

test("parses and compares released CLI versions", () => {
  assert.deepEqual(parseCLIVersion("Starcat CLI v1.1.0\n"), [1, 1, 0]);
  assert.equal(parseCLIVersion("Starcat CLI dev"), null);
  assert.equal(versionIsOlder([1, 0, 9], [1, 1, 0]), true);
  assert.equal(versionIsOlder([1, 1, 0], [1, 1, 0]), false);
  assert.equal(versionIsOlder([1, 2, 0], [1, 1, 0]), false);
});

test("resolves an explicit absolute executable", () => {
  const fixture = executableFixture();
  try {
    assert.equal(resolveCLI(fixture.executable, { PATH: "" }), fixture.executable);
    assert.throws(
      () => resolveCLI("./starcat", { PATH: "" }),
      (error) => error.code === "CLI_NOT_FOUND"
    );
  } finally {
    // Node 16 的 TestContext 尚无 after()，显式 finally 保持 CI 与 uTools
    // 当前 preload 运行时一致。
    fixture.cleanup();
  }
});

test("calls the CLI with shell disabled and decodes v1 JSON", async () => {
  const fixture = executableFixture();
  let observed;
  try {
    const result = await searchRepositories({
      query: "local rag",
      cliPath: fixture.executable,
      environment: { PATH: "" },
      execFile: fakeExecFile(
        { stdout: fixtureText("success-all.json") },
        (file, args, options) => {
          observed = { file, args, options };
        }
      )
    });
    assert.equal(result.returned_count, 2);
    assert.equal(observed.file, fixture.executable);
    assert.equal(observed.options.shell, false);
    assert.equal(observed.args[1], "local rag");
  } finally {
    fixture.cleanup();
  }
});

test("maps stable CLI error codes without parsing human text", async () => {
  await assert.rejects(
    executeCLI(
      "/tmp/starcat",
      ["search", "query"],
      {
        execFile: fakeExecFile({
          error: new Error("exit 1"),
          stderr: "STARCAT_ERROR MCP_DISABLED: any human wording"
        })
      }
    ),
    (error) => error.code === "MCP_DISABLED"
  );
});

test("diagnoses pre-search CLI versions after an unclassified failure", async () => {
  const fixture = executableFixture();
  try {
    const execFile = (_file, args, _options, callback) => {
      const child = { stderr: new EventEmitter() };
      process.nextTick(() => {
        if (args[0] === "version") {
          callback(null, "Starcat CLI v1.0.0\n", "");
          return;
        }
        callback(
          new Error("exit 1"),
          "",
          "starcat: unknown command \"search\"; run `starcat help` for usage"
        );
      });
      return child;
    };
    await assert.rejects(
      searchRepositories({
        query: "starcat",
        cliPath: fixture.executable,
        environment: { PATH: "" },
        execFile
      }),
      (error) => error.code === "UPGRADE_REQUIRED"
    );
  } finally {
    fixture.cleanup();
  }
});

test("maps timeout to SEARCH_TIMEOUT", async () => {
  const neverCompletesUntilAbort = (_file, _args, options, callback) => {
    const child = { stderr: new EventEmitter() };
    options.signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      callback(error, "", "");
    }, { once: true });
    return child;
  };
  await assert.rejects(
    executeCLI("/tmp/starcat", [], {
      execFile: neverCompletesUntilAbort,
      timeoutMs: 5
    }),
    (error) => error.code === "SEARCH_TIMEOUT"
  );
});

test("maps caller cancellation to internal ABORTED", async () => {
  const abortController = new AbortController();
  const waitsForAbort = (_file, _args, options, callback) => {
    const child = { stderr: new EventEmitter() };
    options.signal.addEventListener("abort", () => {
      const error = new Error("aborted");
      error.name = "AbortError";
      callback(error, "", "");
    }, { once: true });
    return child;
  };
  const promise = executeCLI("/tmp/starcat", [], {
    execFile: waitsForAbort,
    signal: abortController.signal
  });
  abortController.abort();
  await assert.rejects(promise, (error) => error.code === "ABORTED");
});
