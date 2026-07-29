"use strict";

const fs = require("fs");
const path = require("path");

function fixture(name) {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8")
  );
}

function fixtureText(name) {
  return fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");
}

module.exports = {
  fixture,
  fixtureText
};
