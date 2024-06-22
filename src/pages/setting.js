import {
  HISTORY_COLUMN_NAME_KO,
  HISTORY_COLUMN_NAME_EN,
  SETTING_PAGE_NAME_KO,
  SETTING_PAGE_NAME_EN,
  SETTING_CLEAR_ALL_BUTTON_KO,
  SETTING_CLEAR_ALL_BUTTON_EN,
  SETTING_THEME_SELECT_KO,
  SETTING_THEME_SELECT_EN,
  SETTING_LANGUAGE_SELECT_KO,
  SETTING_LANGUAGE_SELECT_EN,
} from "../const/setting.const.js";

window.onload = () => {
  const listHeader = document.getElementById("listHeader");
  const list = document.getElementById("list");
  const historyButton = document.getElementById("historyButton");
  const settingButton = document.getElementById("settingButton");
  const clearButton = document.getElementById("clearButton");
  const themeSelect = document.getElementById("themeSelect");
  const languageSelect = document.getElementById("languageSelect");

  /**
   * 테마 설정
   * - chrome.storage.local에 저장된 2ndBrain_theme을 불러와서 themeSelect의 value로 설정
   * - body, clearButton, settingRow, settingElement에 테마 설정
   */
  chrome.storage.local.get("2ndBrain_theme", (items) => {
    let theme = items["2ndBrain_theme"];
    themeSelect.value = theme;
    document.body.classList.add(theme);
    clearButton.classList.add(theme);

    let settingRows = document.getElementsByClassName("settingRow");
    let settingElements = document.getElementsByClassName("settingElement");
    let headerElements = document.getElementsByClassName("headerElement");

    for (let i = 0; i < settingRows.length; i++) {
      settingRows[i].classList.add(theme);
    }
    for (let i = 0; i < settingElements.length; i++) {
      settingElements[i].classList.add(theme);
    }
    for (let i = 0; i < headerElements.length; i++) {
      headerElements[i].classList.add(theme);
    }

    return items["2ndBrain_theme"];
  });

  /**
   * 언어 설정
   * - chrome.storage.local에 저장된 2ndBrain_language를 불러와서 languageSelect의 value로 설정
   */
  chrome.storage.local.get("2ndBrain_language", (items) => {
    let language = items["2ndBrain_language"];
    languageSelect.value = language;

    let historyColumnName =
      language === "ko" ? HISTORY_COLUMN_NAME_KO : HISTORY_COLUMN_NAME_EN;
    let listHeaderRow = createListItem(
      {
        content: historyColumnName.CONTENT,
        matchedText: historyColumnName.MATCHED_TEXT,
        deletedBy: historyColumnName.DELETED_BY,
        addedTime: historyColumnName.ADDED_TIME,
        deletedTime: historyColumnName.DELETED_TIME,
      },
      true
    );
    listHeader.appendChild(listHeaderRow);

    let settingHeaderRow = document.getElementById("settingHeaderRow");
    settingHeaderRow.children[0].textContent =
      language === "ko" ? SETTING_PAGE_NAME_KO : SETTING_PAGE_NAME_EN;

    let clearButtonText = document.getElementById("clearButtonText");
    clearButtonText.textContent =
      language === "ko"
        ? SETTING_CLEAR_ALL_BUTTON_KO
        : SETTING_CLEAR_ALL_BUTTON_EN;

    let themeSelectText = document.getElementById("themeSelectText");
    themeSelectText.textContent =
      language === "ko" ? SETTING_THEME_SELECT_KO : SETTING_THEME_SELECT_EN;

    let languageSelectText = document.getElementById("languageSelectText");
    languageSelectText.textContent =
      language === "ko"
        ? SETTING_LANGUAGE_SELECT_KO
        : SETTING_LANGUAGE_SELECT_EN;

    return items["2ndBrain_language"];
  });

  /**
   * chrome.storage.local에 저장된 데이터를 불러와서 createListItem 함수를 호출
   * - chrome.storage.local에 저장된 데이터를 불러와서 삭제된 시간을 기준으로 내림차순 정렬
   * - key가 2ndBrain_item__로 시작하고 deletedTime이 null이 아닌 경우에만 createListItem 함수를 호출
   */
  if (list) {
    chrome.storage.local.get(null, (items) => {
      Object.entries(items)
        .filter(
          ([key, value]) =>
            key.includes("2ndBrain_item__") && value.deletedTime !== null
        )
        .sort((a, b) => b[1].deletedTime - a[1].deletedTime)
        .forEach(([key, value]) => {
          let listItem = createListItem(value);
          list.appendChild(listItem);
        });
    });
  }

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
      chrome.tabs.update({ url: "/src/pages/setting.html?page=history" });
    });

    settingButton.addEventListener("click", () => {
      chrome.tabs.update({ url: "/src/pages/setting.html?page=setting" });
    });
  }

  /**
   * clearButton 클릭 시 2nd Brain의 히스토리를 모두 삭제하는 이벤트 리스너 등록
   * - chrome.storage.local에서 완료된 모든 메모를 삭제
   */
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      chrome.storage.local.get(null, (items) => {
        Object.entries(items).forEach(([key, value]) => {
          if (key.includes("2ndBrain_item__") && value.deletedTime !== null) {
            chrome.storage.local.remove(key);
          }
        });
      });
      chrome.tabs.update({ url: "/src/pages/setting.html?page=history" });
    });
  }

  /**
   * themeSelect 변경 시 2nd Brain의 테마를 변경하는 이벤트 리스너 등록
   * - themeSelect의 value를 chrome.storage.local에 저장
   * - 변경된 테마를 적용하기 위해 페이지 리로드
   */
  if (themeSelect) {
    themeSelect.addEventListener("change", () => {
      chrome.storage.local.set({ "2ndBrain_theme": themeSelect.value });
      location.reload();
    });
  }

  /**
   * languageSelect 변경 시 2nd Brain의 언어를 변경하는 이벤트 리스너 등록
   * - languageSelect의 value를 chrome.storage.local에 저장
   */
  if (languageSelect) {
    languageSelect.addEventListener("change", () => {
      chrome.storage.local.set({ "2ndBrain_language": languageSelect.value });
      location.reload();
    });
  }
};

const createListItem = (value, isHeader = false) => {
  const listItem = document.createElement("li");
  const itemContent = document.createElement("span");
  const itemAddTime = document.createElement("span");
  const itemDeletedTime = document.createElement("span");
  const itemDeletedBy = document.createElement("span");
  const itemMatchedText = document.createElement("span");

  if (isHeader) {
    itemContent.textContent = value.content;
    itemAddTime.textContent = value.addedTime;
    itemDeletedTime.textContent = value.deletedTime;
    itemDeletedBy.textContent = value.deletedBy;
    itemMatchedText.textContent = value.matchedText;
  } else {
    itemContent.textContent = value.content;
    itemAddTime.textContent = convertMsToYMD_HS(value.addedTime);
    itemDeletedTime.textContent = convertMsToYMD_HS(value.deletedTime);
    itemDeletedBy.textContent = convertQueryKeyToSiteName(value.deletedBy);
    itemMatchedText.textContent = value.matchedText || "X";
  }

  listItem.appendChild(itemContent);
  listItem.appendChild(itemMatchedText);
  listItem.appendChild(itemDeletedBy);
  listItem.appendChild(itemAddTime);
  listItem.appendChild(itemDeletedTime);

  if (isHeader) {
    listItem.className = "headerRow";
    listItem.id = "listHeaderRow";
    for (let i = 0; i < listItem.children.length; i++) {
      listItem.children[i].className = "headerElement";
    }
  } else {
    listItem.className = "listRow";
  }

  // chrome.storage.local에 저장된 2ndBrain_theme을 불러와서 각각의 요소에 테마를 적용
  chrome.storage.local.get("2ndBrain_theme", (items) => {
    let theme = items["2ndBrain_theme"];
    listItem.classList.add(theme);
    itemContent.classList.add(theme);
    itemMatchedText.classList.add(theme);
    itemAddTime.classList.add(theme);
    itemDeletedTime.classList.add(theme);
    itemDeletedBy.classList.add(theme);
    return items["2ndBrain_theme"];
  });

  return listItem;
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

const showHistory = () => {
  const listHeader = document.getElementById("listHeader");
  const list = document.getElementById("list");
  const settingHeader = document.getElementById("settingHeader");
  const settingList = document.getElementById("settingList");

  listHeader.style.display = "block";
  list.style.display = "block";
  settingHeader.style.display = "none";
  settingList.style.display = "none";
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
