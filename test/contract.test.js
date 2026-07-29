"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { decodeSearchResult } = require("../src/contract");
const { fixtureText } = require("./helpers");

test("decodes every successful v1 fixture", () => {
  for (const name of [
    "success-all.json",
    "success-local-warning.json",
    "empty.json"
  ]) {
    const result = decodeSearchResult(fixtureText(name));
    assert.equal(result.schema_version, 1);
    assert.equal(result.returned_count, result.items.length);
  }
});

test("accepts additive unknown fields within schema v1", () => {
  const value = JSON.parse(fixtureText("empty.json"));
  value.future_optional_field = { enabled: true };
  const result = decodeSearchResult(JSON.stringify(value));
  assert.equal(result.future_optional_field.enabled, true);
});

test("rejects unknown schema versions", () => {
  const value = JSON.parse(fixtureText("empty.json"));
  value.schema_version = 2;
  assert.throws(
    () => decodeSearchResult(JSON.stringify(value)),
    (error) => error.code === "UPGRADE_REQUIRED"
  );
});

test("rejects malformed repository fields", () => {
  const value = JSON.parse(fixtureText("success-all.json"));
  value.items[0].primary_source = "alfred";
  assert.throws(
    () => decodeSearchResult(JSON.stringify(value)),
    (error) => error.code === "UPGRADE_REQUIRED"
  );
});
