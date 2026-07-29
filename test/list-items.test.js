"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  formatStars,
  repositoryItem,
  searchResultItems
} = require("../src/list-items");
const { fixture } = require("./helpers");

test("renders source first and preserves Starcat open URL", () => {
  const result = fixture("success-all.json");
  const item = repositoryItem(result.items[0]);
  assert.equal(item.title, "starcat-app/starcat");
  assert.match(item.description, /^Starcat 本地 · Swift · ★ 1\.2k/);
  assert.equal(
    item.openURL,
    "starcat://repo/starcat-app/starcat?v=1&rid=123"
  );
  assert.equal(item.icon, "https://github.com/starcat-app.png?size=80");
});

test("renders GitHub-only source without changing order", () => {
  const result = fixture("success-all.json");
  const items = searchResultItems(result);
  assert.equal(items[0].title, "starcat-app/starcat");
  assert.equal(items[1].title, "example/remote-repo");
  assert.match(items[1].description, /^GitHub · Go · ★ 980/);
});

test("adds non-executable empty and warning items", () => {
  const emptyItems = searchResultItems(fixture("empty.json"));
  assert.equal(emptyItems.length, 1);
  assert.equal(emptyItems[0].openURL, undefined);

  const warningItems = searchResultItems(
    fixture("success-local-warning.json")
  );
  assert.equal(warningItems.length, 2);
  assert.equal(warningItems[1].openURL, undefined);
});

test("formats star counts compactly", () => {
  assert.equal(formatStars(999), "999");
  assert.equal(formatStars(1200), "1.2k");
  assert.equal(formatStars(1500000), "1.5M");
});
