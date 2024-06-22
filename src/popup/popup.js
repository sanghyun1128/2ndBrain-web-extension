import {
  MAX_DELETED_MEMO_SIZE,
  MAX_INPUT_LENGTH,
  MAX_MEMO_SIZE,
  WARNING_TEXT_KO,
  WARNING_TEXT_EN,
} from "../const/popup.const.js";

let size = 0; // chrome.storage.local에 저장된 데이터중 삭제되지 않은 데이터의 개수를 관리 위한 변수
let deletedSize = 0; // chrome.storage.local에 저장된 데이터중 삭제된 데이터의 개수를 관리 위한 변수

window.onload = () => {
  const textInput = document.getElementById("textInput");
  const addButton = document.getElementById("addButton");
  const list = document.getElementById("list");
  const clearButton = document.getElementById("clearButton");
  const historyButton = document.getElementById("historyButton");
  const settingButton = document.getElementById("settingButton");

  /**
   * 테마 설정
   * - chrome.storage.local에 저장된 2ndBrain_theme을 불러와서
   *    body, textInput, addButton, list, clearButton, historyButton, settingButton
   *    에 테마 설정
   */
  chrome.storage.local.get("2ndBrain_theme", (items) => {
    let theme = items["2ndBrain_theme"];
    document.body.classList.add(theme);
    textInput.classList.add(theme);
    addButton.classList.add(theme);
    list.classList.add(theme);
    clearButton.classList.add(theme);
    historyButton.classList.add(theme);
    settingButton.classList.add(theme);
    return items["2ndBrain_theme"];
  });

  /**
   * 2nd Brain의 메모를 추가하는 로직
   * - 실행시 textInput으로 커서를 이동
   * - Enter키와 addButton 클릭 이벤트를 연결
   * - textInput에 입력된 값이 maxInputLength자를 넘으면 경고 메시지를 표시
   * - addButton을 클릭하면 검사 후 경고 메시지를 표시
   *  - 입력된 값이 없는 경우
   *  - 메모가 maxMemoSize개 이상인 경우
   * - 이상 없으면 chrome.storage.local에 데이터를 저장하고 createListItem 함수를 호출
   * - textInput을 초기화하고 경고 메시지를 숨김
   * - 삭제된 메모가 maxDeletedMemoSize개 이상인 경우 가장 오래된 메모를 삭제
   */
  if (textInput && addButton) {
    textInput.focus();
    /**
     * 언어 설정
     * - chrome.storage.local에 저장된 2ndBrain_language를 불러와서 warningMessage에 언어 설정
     */
    chrome.storage.local.get("2ndBrain_language", (items) => {
      let language = items["2ndBrain_language"];
      let warningText = language === "ko" ? WARNING_TEXT_KO : WARNING_TEXT_EN;

      textInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          addButton.click();
        }
      });

      textInput.addEventListener("input", () => {
        if (textInput.value.length > MAX_INPUT_LENGTH) {
          textInput.value = textInput.value.substring(0, MAX_INPUT_LENGTH);
          onTextInputWarning(warningText.MAX_INPUT_LENGTH_WARNING);
        } else {
          offTextInputWarning();
        }
      });

      addButton.addEventListener("click", () => {
        const text = textInput.value;
        const noSpacesText = text.replace(/\s+/g, "");
        const currentTimeMs = Date.now();
        if (noSpacesText === "") {
          onTextInputWarning(warningText.EMPTY_INPUT_WARNING);
          return;
        }
        if (size >= MAX_MEMO_SIZE) {
          onTextInputWarning(warningText.MAX_MEMO_SIZE_WARNING);
          return;
        }

        chrome.storage.local.set({
          ["2ndBrain_item__" + currentTimeMs]: {
            content: text,
            addedTime: currentTimeMs,
            deletedTime: null,
            deletedBy: null,
            matchedText: null,
          },
        });
        createListItem(text, currentTimeMs);
        textInput.value = "";
        size++;
        offTextInputWarning();

        if (deletedSize > MAX_DELETED_MEMO_SIZE) {
          chrome.storage.local.get(null, (items) => {
            let item = Object.entries(items)
              .filter(
                ([key, value]) =>
                  key.includes("2ndBrain_item__") && value.deletedTime !== null
              )
              .sort((a, b) => a[1].deletedTime - b[1].deletedTime)[0];

            chrome.storage.local.remove(item[0]);
          });
        }
      });

      return items["2ndBrain_language"];
    });
  }

  /**
   * 저장된 데이터를 불러와서 화면에 표시하는 로직
   * - chrome.storage.local에 저장된 데이터를 저장한 시간순서로 정렬
   * - 순서대로 2nd Brain의 메모를 화면에 표시
   */
  if (list) {
    chrome.storage.local.get(null, (items) => {
      Object.entries(items)
        .filter(([key, value]) => {
          if (key.includes("2ndBrain_item__") && value.deletedTime === null) {
            size++;
            return true;
          } else {
            deletedSize++;
            return false;
          }
        })
        .sort((a, b) => a[0].split("__")[1] - b[0].split("__")[1])
        .forEach(([key, value]) => {
          const itemAddTimeMs = parseInt(key.split("__")[1]);
          createListItem(value.content, itemAddTimeMs);
        });
    });
  }

  /**
   * 2nd Brain의 메모를 모두 완료로 처리하는 로직
   * - clearButton을 클릭하면 chrome.storage.local에서 아직 완료되지 않은 모든 메모를 완료로 처리
   */
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      chrome.storage.local.get(null, (items) => {
        Object.entries(items).filter(([key, value]) => {
          if (key.includes("2ndBrain_item__") && value.deletedTime === null) {
            chrome.storage.local.set({
              [key]: {
                content: value.content,
                addedTime: value.addedTime,
                deletedTime: Date.now(),
                deletedBy: "User",
                matchedText: null,
              },
            });
            deleteListItem(key.split("__")[1]);
          }
        });
      });
    });
  }

  /**
   * 2nd Brain의 히스토리를 볼 수 있는 페이지로 이동하는 로직
   * - historyButton을 클릭하면 setting.html로 이동
   */
  if (historyButton) {
    historyButton.addEventListener("click", () => {
      chrome.tabs.create({ url: "/src/pages/setting.html?page=history" });
    });
  }

  /**
   * 2nd Brain의 설정을 볼 수 있는 페이지로 이동하는 로직
   * - settingButton을 클릭하면 setting.html로 이동
   */
  if (settingButton) {
    settingButton.addEventListener("click", () => {
      chrome.tabs.create({ url: "/src/pages/setting.html?page=setting" });
    });
  }
};

const createListItem = (text, itemAddTimeMs) => {
  const listItem = document.createElement("li");
  const itemText = document.createElement("span");
  const deleteButton = document.createElement("button");
  const deleteIcon = document.createElement("img");

  deleteIcon.src = "../images/x-icon.svg";
  deleteButton.appendChild(deleteIcon);
  deleteButton.className = "smallButton";
  deleteButton.id = "delButton_id__" + itemAddTimeMs;
  deleteButton.onclick = () => {
    chrome.storage.local.set({
      ["2ndBrain_item__" + deleteButton.id.split("__")[1]]: {
        content: text,
        addedTime: itemAddTimeMs,
        deletedTime: Date.now(),
        deletedBy: "User",
        matchedText: null,
      },
    });
    deleteListItem(deleteButton.id.split("__")[1]);
  };
  itemText.textContent = text;
  listItem.id = "listItem_id__" + itemAddTimeMs;
  listItem.appendChild(itemText);
  listItem.appendChild(deleteButton);
  chrome.storage.local.get("2ndBrain_theme", (items) => {
    let theme = items["2ndBrain_theme"];
    listItem.classList.add(theme);
    itemText.classList.add(theme);
    return items["2ndBrain_theme"];
  });

  list.appendChild(listItem);
  listItem.scrollIntoView({ block: "end", behavior: "smooth" });
  listItem.classList.add("slideFadeIn");
};

const deleteListItem = (itemAddTimeMs) => {
  const listItem = document.getElementById("listItem_id__" + itemAddTimeMs);
  listItem.classList.add("slideFadeOut");
  listItem.addEventListener("animationend", () => {
    listItem.remove();
  });
  size--;
};

const onTextInputWarning = (message) => {
  const textInput = document.getElementById("textInput");
  const warningMessage = document.getElementById("warningMessage");

  textInput.classList.add("warning", "shake");
  warningMessage.textContent = message;
  warningMessage.classList.remove("hidden");
  setTimeout(() => {
    textInput.classList.remove("shake");
  }, 400);
};

const offTextInputWarning = () => {
  const textInput = document.getElementById("textInput");
  const warningMessage = document.getElementById("warningMessage");

  textInput.classList.remove("warning");
  warningMessage.classList.add("hidden");
};
