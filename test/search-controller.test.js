"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { LauncherError } = require("../src/errors");
const { createSearchController } = require("../src/search-controller");
const { fixture } = require("./helpers");

function nextTurn() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

test("empty query shows a placeholder without starting the CLI", () => {
  let calls = 0;
  let items;
  const controller = createSearchController({
    searchRepositories: async () => {
      calls += 1;
    },
    debounceMs: 0
  });
  controller.search("  ", (value) => {
    items = value;
  });
  assert.equal(calls, 0);
  assert.equal(items[0].title, "输入仓库关键词");
});

test("new input aborts the previous request and prevents stale results", async () => {
  const pending = [];
  const displayed = [];
  const controller = createSearchController({
    debounceMs: 0,
    searchRepositories: ({ query, signal }) => new Promise((resolve, reject) => {
      const entry = { query, resolve, signal };
      pending.push(entry);
      signal.addEventListener("abort", () => {
        reject(new LauncherError("ABORTED", "cancelled"));
      }, { once: true });
    })
  });

  controller.search("first", (items) => displayed.push(items));
  await nextTurn();
  controller.search("second", (items) => displayed.push(items));
  await nextTurn();

  assert.equal(pending.length, 2);
  assert.equal(pending[0].signal.aborted, true);
  pending[1].resolve(fixture("success-all.json"));
  await nextTurn();

  assert.equal(displayed.length, 1);
  assert.equal(displayed[0][0].title, "starcat-app/starcat");
});

test("expected errors become non-executable list items", async () => {
  let displayed;
  const controller = createSearchController({
    debounceMs: 0,
    searchRepositories: async () => {
      throw new LauncherError("CLI_NOT_PAIRED", "private detail");
    }
  });
  controller.search("repo", (items) => {
    displayed = items;
  });
  await nextTurn();
  assert.equal(displayed[0].title, "Starcat CLI 尚未配对");
  assert.equal(displayed[0].openURL, undefined);
});
