// Starcat global search schema v1 的运行时最小校验。
//
// v1 允许增加 optional 字段，因此只校验适配器真正消费的字段，未知字段必须忽略。
"use strict";

const { LauncherError } = require("./errors");

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, field) {
  if (typeof value !== "string" || value.length === 0) {
    throw invalidContract(field + " must be a non-empty string");
  }
}

function validateRepository(item, index) {
  if (!isObject(item)) {
    throw invalidContract("items[" + index + "] must be an object");
  }
  for (const field of [
    "owner",
    "name",
    "full_name",
    "primary_source",
    "icon_url",
    "open_url",
    "html_url"
  ]) {
    requireString(item[field], "items[" + index + "]." + field);
  }
  if (item.primary_source !== "local" && item.primary_source !== "github") {
    throw invalidContract("items[" + index + "].primary_source is unsupported");
  }
  if (!Number.isInteger(item.stars_count) || item.stars_count < 0) {
    throw invalidContract("items[" + index + "].stars_count must be non-negative");
  }
  if (!Array.isArray(item.sources) || item.sources.length === 0) {
    throw invalidContract("items[" + index + "].sources must not be empty");
  }
  if (typeof item.is_private !== "boolean" || typeof item.is_starred !== "boolean") {
    throw invalidContract("items[" + index + "] boolean fields are invalid");
  }
}

function decodeSearchResult(stdout) {
  let value;
  try {
    value = JSON.parse(String(stdout));
  } catch (error) {
    throw new LauncherError(
      "UPGRADE_REQUIRED",
      "Starcat CLI returned invalid global-search JSON",
      { cause: error }
    );
  }
  if (!isObject(value) || value.schema_version !== 1) {
    throw new LauncherError(
      "UPGRADE_REQUIRED",
      "Unsupported Starcat global-search schema version"
    );
  }
  requireString(value.query, "query");
  if (!Array.isArray(value.items) || !Array.isArray(value.warnings)) {
    throw invalidContract("items and warnings must be arrays");
  }
  if (!Number.isInteger(value.returned_count) || value.returned_count !== value.items.length) {
    throw invalidContract("returned_count must equal items.length");
  }
  if (!isObject(value.providers)) {
    throw invalidContract("providers must be an object");
  }
  value.items.forEach(validateRepository);
  for (const warning of value.warnings) {
    if (typeof warning !== "string") {
      throw invalidContract("warnings must contain strings");
    }
  }
  return value;
}

function invalidContract(message) {
  return new LauncherError("UPGRADE_REQUIRED", message);
}

module.exports = {
  decodeSearchResult
};
