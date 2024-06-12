chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const items = await findItemKeyMatchedQuery(
      getQueryFromUrl(changeInfo.url)
    );
    items.forEach((key, value) => {
      chrome.storage.local.remove(key);
      chrome.storage.local.set({
        [`2ndBrain_history__${key.split("__")[1]}`]: value,
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
      return decodeURIComponent(value);
  }

  return false;
};

const findItemKeyMatchedQuery = (query) => {
  return new Promise((resolve) => {
    const result = [];
    chrome.storage.local.get(null, (items) => {
      Object.entries(items)
        .filter(
          ([key, value]) => key.includes("2ndBrain_item__") && value === query
        )
        .forEach(([key, value]) => {
          result.push([key, value]);
        });
      resolve(result);
    });
  });
};
