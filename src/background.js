chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    const queryKey = getQueryFromUrl(changeInfo.url);
    const items = await findItemKeyMatchedQuery(queryKey[0], queryKey[1]);
    items.forEach(([key, value, query, queryKey]) => {
      chrome.storage.local.set({
        [key]: {
          content: value.content,
          addedTime: value.addedTime,
          deletedTime: Date.now(),
          deletedBy: () => {
            switch (queryKey) {
              case "q":
                return "Google";
              case "query":
                return "Naver";
              case "search_query":
                return "Youtube";
              default:
                return "Unknown";
            }
          },
          matchedText: query,
        },
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
            key.includes("2ndBrain_item__") && value.content === query
        )
        .forEach(([key, value]) => {
          result.push([key, value, query, queryKey]);
        });
      resolve(result);
    });
  });
};
