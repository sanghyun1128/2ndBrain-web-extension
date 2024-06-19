window.onload = () => {
  const historyButton = document.getElementById("historyButton");
  const settingButton = document.getElementById("settingButton");

  /**
   * query에 따라서 setting 또는 history를 보여줌
   * - query가 setting인 경우 settingHeader와 settingList를 보여주고 historyHeader와 historyList를 숨김
   */
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("page");
  if (query === "setting") {
    showSetting();
    historyButton.style.backgroundColor = "#196861";
    settingButton.style.backgroundColor = "#28a398";
  } else {
    showHistory();
    historyButton.style.backgroundColor = "#28a398";
    settingButton.style.backgroundColor = "#196861";
  }

  /**
   * historyButton 클릭 시 history를 보여주고 settingButton 클릭 시 setting을 보여주는 이벤트 리스너 등록
   * - historyButton 클릭 시 showHistory 함수 호출
   * - settingButton 클릭 시 showSetting 함수 호출
   */
  if (historyButton && settingButton) {
    historyButton.addEventListener("click", () => {
      showHistory();
      historyButton.style.backgroundColor = "#28a398";
      settingButton.style.backgroundColor = "#196861";
    });

    settingButton.addEventListener("click", () => {
      showSetting();
      historyButton.style.backgroundColor = "#196861";
      settingButton.style.backgroundColor = "#28a398";
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

  listItem.classList.add("listRow");
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

const showHistory = (historyButton, settingButton) => {
  const listHeader = document.getElementById("listHeader");
  const list = document.getElementById("list");
  const settingHeader = document.getElementById("settingHeader");
  const settingList = document.getElementById("settingList");

  listHeader.style.display = "block";
  list.style.display = "block";
  settingHeader.style.display = "none";
  settingList.style.display = "none";

  /**
   * chrome.storage.local에 저장된 데이터를 불러와서 createListItem 함수를 호출
   * - chrome.storage.local에 저장된 데이터를 불러와서 삭제된 시간을 기준으로 내림차순 정렬
   * - key가 2ndBrain_item__로 시작하고 deletedTime이 null이 아닌 경우에만 createListItem 함수를 호출
   */
  chrome.storage.local.get(null, (items) => {
    Object.entries(items)
      .filter(
        ([key, value]) =>
          key.includes("2ndBrain_item__") && value.deletedTime !== null
      )
      .sort((a, b) => b[1].deletedTime - a[1].deletedTime)
      .forEach(([key, value]) => {
        const itemAddTimeMs = parseInt(key.split("__")[1]);
        createListItem(value);
      });
  });
};

const showSetting = () => {
  const listHeader = document.getElementById("listHeader");
  const list = document.getElementById("list");
  const settingHeader = document.getElementById("settingHeader");
  const settingList = document.getElementById("settingList");

  listHeader.style.display = "none";
  list.style.display = "none";
  settingHeader.style.display = "block";
  settingList.style.display = "block";
};
