// uTools 快速输入调度：debounce、取消旧进程和 request ID 三层共同防止旧结果闪回。
"use strict";

const {
  DEFAULT_DEBOUNCE_MS,
  DEFAULT_LIMIT,
  DEFAULT_SOURCE
} = require("./constants");
const { searchRepositories } = require("./cli");
const {
  errorItem,
  placeholderItem,
  searchResultItems
} = require("./list-items");

function createSearchController(options) {
  const settings = options || {};
  const search = settings.searchRepositories || searchRepositories;
  const debounceMs = settings.debounceMs === undefined
    ? DEFAULT_DEBOUNCE_MS
    : settings.debounceMs;
  const schedule = settings.setTimeout || setTimeout;
  const unschedule = settings.clearTimeout || clearTimeout;
  let requestID = 0;
  let timer = null;
  let currentAbortController = null;

  function cancelCurrent() {
    if (timer !== null) {
      unschedule(timer);
      timer = null;
    }
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  }

  function run(rawQuery, callbackSetList) {
    requestID += 1;
    const ownRequestID = requestID;
    cancelCurrent();
    const query = String(rawQuery || "").trim();
    if (!query) {
      callbackSetList([placeholderItem()]);
      return;
    }

    timer = schedule(async () => {
      timer = null;
      const abortController = new AbortController();
      currentAbortController = abortController;
      try {
        const result = await search({
          query,
          source: DEFAULT_SOURCE,
          limit: DEFAULT_LIMIT,
          signal: abortController.signal
        });
        if (ownRequestID === requestID && !abortController.signal.aborted) {
          callbackSetList(searchResultItems(result));
        }
      } catch (error) {
        if (
          ownRequestID === requestID &&
          error &&
          error.code !== "ABORTED"
        ) {
          callbackSetList([errorItem(error)]);
        }
      } finally {
        if (currentAbortController === abortController) {
          currentAbortController = null;
        }
      }
    }, debounceMs);
  }

  return {
    search: run,
    placeholderItem,
    dispose() {
      requestID += 1;
      cancelCurrent();
    }
  };
}

module.exports = {
  createSearchController
};
