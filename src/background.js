import {
  DELETE_MESSAGE_KO,
  DELETE_MESSAGE_EN,
} from "./const/background.const.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.clear();
  chrome.storage.local.set({ "2ndBrain_theme": "light" });
  chrome.storage.local.set({ "2ndBrain_language": "en" });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const query = getQueryFromUrl(changeInfo.url);
    const items = await findItemKeyMatchedQuery(query[0], query[1]);
    items.forEach(([key, value, query, queryKey]) => {
      chrome.storage.local.set({
        [key]: {
          content: value.content,
          addedTime: value.addedTime,
          deletedTime: Date.now(),
          deletedBy: queryKey,
          matchedText: query,
        },
      });
      chrome.storage.local.get(["2ndBrain_language"], (result) => {
        let language = result["2ndBrain_language"];
        const notificationOptions = {
          type: "basic",
          iconUrl: "./images/project-icon-128.png",
          title: "2ndBrain",
          message:
            language === "ko"
              ? `"${value.content}" ${DELETE_MESSAGE_KO}`
              : `"${value.content}" ${DELETE_MESSAGE_EN}`,
        };
        chrome.notifications.create("2nd_brain__delete", notificationOptions);
      });
    });
  }
});

const getQueryFromUrl = (url) => {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);

  for (const [key, value] of params.entries()) {
    // q: Google, query: Naver, search_query: Youtube
    if (["q", "query", "search_query"].includes(key))
      return [key, decodeURIComponent(value)];
  }

  return false;
};

const findItemKeyMatchedQuery = (queryKey, query) => {
  return new Promise((resolve) => {
    const result = [];
    chrome.storage.local.get(null, (items) => {
      Object.entries(items)
        .filter(
          ([key, value]) =>
            key.includes("2ndBrain_item__") &&
            value.deletedTime === null &&
            value.content === query
        )
        .forEach(([key, value]) => {
          result.push([key, value, query, queryKey]);
        });
      resolve(result);
    });
  });
};
