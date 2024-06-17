window.onload = () => {
  const list = document.getElementById("list");

  /**
   * chrome.storage.local에 저장된 데이터를 불러와서 createListItem 함수를 호출
   * - chrome.storage.local에 저장된 데이터를 불러와서 삭제된 시간을 기준으로 내림차순 정렬
   * - key가 2ndBrain_item__로 시작하고 deletedTime이 null이 아닌 경우에만 createListItem 함수를 호출
   */
  if (list) {
    chrome.storage.local.get(null, (items) => {
      Object.entries(items)
        .sort((a, b) => b[1].deletedTime - a[1].deletedTime)
        .forEach(([key, value]) => {
          if (key.includes("2ndBrain_item__") && value.deletedTime !== null) {
            const itemAddTimeMs = parseInt(key.split("__")[1]);
            createListItem(value);
          }
        });
    });
  }
};

const createListItem = (value) => {
  const list = document.getElementById("list");
  const listItem = document.createElement("li");
  const itemContent = document.createElement("span");
  const itemAddTime = document.createElement("span");
  const itemDeletedTime = document.createElement("span");
  const itemDeletedBy = document.createElement("span");
  const itemMatchedText = document.createElement("span");

  itemContent.textContent = value.content;
  itemAddTime.textContent = convertMsToYMD_HS(value.addedTime);
  itemDeletedTime.textContent = convertMsToYMD_HS(value.deletedTime);
  itemDeletedBy.textContent = convertQueryKeyToSiteName(value.deletedBy);
  itemMatchedText.textContent = value.matchedText || "X";

  itemContent.classList.add("itemContent");
  itemMatchedText.classList.add("itemMatchedText");
  itemAddTime.classList.add("itemTime");
  itemDeletedTime.classList.add("itemTime");
  itemDeletedBy.classList.add("itemDeletedBy");

  listItem.appendChild(itemContent);
  listItem.appendChild(itemMatchedText);
  listItem.appendChild(itemDeletedBy);
  listItem.appendChild(itemAddTime);
  listItem.appendChild(itemDeletedTime);

  list.appendChild(listItem);
};

const deleteListItem = (itemAddTimeMs) => {
  const list = document.getElementById("list");
  const listItem = document.getElementById("listItem_id__" + itemAddTimeMs);
  list.removeChild(listItem);
};

const convertMsToYMD_HS = (milliSecond) => {
  const data = new Date(milliSecond);

  let year = data.getFullYear();
  let month = data.getMonth() + 1;
  let date = data.getDate();
  let hour = data.getHours();
  let minute = data.getMinutes();

  if (month < 10) month = "0" + month;
  if (date < 10) date = "0" + date;
  if (hour < 10) hour = "0" + hour;
  if (minute < 10) minute = "0" + minute;

  return `${year}.${month}.${date} ${hour}:${minute}`;
};

const convertQueryKeyToSiteName = (queryKey) => {
  const siteName = {
    User: "User",
    q: "Google",
    query: "Naver",
    search_query: "Youtube",
  };

  return siteName[queryKey] || "Unknown";
};
