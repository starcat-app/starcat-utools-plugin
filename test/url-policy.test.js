"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { safeAvatarURL, safeOpenURL } = require("../src/url-policy");

test("accepts versioned Starcat repository deep links", () => {
  const url = "starcat://repo/starcat-app/starcat?v=1&rid=123";
  assert.equal(safeOpenURL(url), url);
});

test("accepts canonical GitHub repository URLs", () => {
  const url = "https://github.com/starcat-app/starcat";
  assert.equal(safeOpenURL(url), url);
});

test("rejects unsafe or non-repository open URLs", () => {
  for (const url of [
    "javascript:alert(1)",
    "file:///tmp/token",
    "starcat://settings/integrations?v=1",
    "starcat://repo/starcat-app/starcat?v=2",
    "starcat://repo/starcat-app/starcat?v=1&rid=-1",
    "starcat://repo/starcat-app/starcat?v=1&next=https://evil.example",
    "https://user:token@github.com/starcat-app/starcat",
    "https://github.com:443/starcat-app/starcat",
    "https://github.com/starcat-app/starcat/issues",
    "https://github.com/starcat-app/starcat?tab=readme",
    "https://evil.example/starcat-app/starcat"
  ]) {
    assert.equal(safeOpenURL(url), null, url);
  }
});

test("allows only public GitHub avatar hosts", () => {
  assert.equal(
    safeAvatarURL("https://github.com/starcat-app.png?size=80"),
    "https://github.com/starcat-app.png?size=80"
  );
  assert.equal(
    safeAvatarURL("https://avatars.githubusercontent.com/u/1?v=4"),
    "https://avatars.githubusercontent.com/u/1?v=4"
  );
  assert.equal(safeAvatarURL("https://evil.example/avatar.png"), null);
  assert.equal(safeAvatarURL("http://github.com/starcat-app.png"), null);
});
