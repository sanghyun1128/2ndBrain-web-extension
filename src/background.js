chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const itemKeys = await findItemKeyMatchedQuery(
      getQueryFromUrl(changeInfo.url)
    );
    itemKeys.forEach((key) => {
      chrome.storage.local.remove(key);
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
          result.push(key);
        });
      resolve(result);
    });
  });
};
