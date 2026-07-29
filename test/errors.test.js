"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  LauncherError,
  parseStableErrorCode,
  userFacingError
} = require("../src/errors");
const { fixture } = require("./helpers");

test("maps every public contract error code", () => {
  const catalog = fixture("error-codes.json");
  for (const entry of catalog.errors) {
    const presentation = userFacingError(
      new LauncherError(entry.code, entry.meaning)
    );
    assert.ok(presentation.title, entry.code);
    assert.ok(presentation.description, entry.code);
  }
});

test("parses only known stable error codes", () => {
  assert.equal(
    parseStableErrorCode("STARCAT_ERROR CLI_NOT_PAIRED: missing profile"),
    "CLI_NOT_PAIRED"
  );
  assert.equal(
    parseStableErrorCode("STARCAT_ERROR SECRET_ERROR: hidden"),
    null
  );
  assert.equal(parseStableErrorCode("connection refused"), null);
});

test("does not expose raw error messages", () => {
  const presentation = userFacingError(
    new LauncherError("SEARCH_FAILED", "token=secret-value")
  );
  assert.doesNotMatch(presentation.description, /secret-value/);
});
