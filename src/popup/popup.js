window.onload = () => {
  const textInput = document.getElementById("textInput");
  const addButton = document.getElementById("addButton");
  const list = document.getElementById("list");
  const clearButton = document.getElementById("clearButton");
  let index = 0; // chrome.storage.local에 저장된 데이터의 index를 관리 위한 변수
  /**
   * 2nd Brain의 메모를 추가하는 로직
   * - 실행시 textInput으로 커서를 이동
   * - Enter키와 addButton 클릭 이벤트를 연결
   * - addButton을 클릭하면 chrome.storage.local에 데이터를 저장하고 createListItem 함수를 호출
   */
  if (textInput && addButton) {
    textInput.focus();
    textInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        addButton.click();
      }
    });
    addButton.addEventListener("click", () => {
      const text = textInput.value;
      const noSpacesText = text.replace(/\s+/g, "");
      if (noSpacesText !== "") {
        chrome.storage.local.set({ ["2ndBrain_item__" + index]: text });
        createListItem(text, index++);
      }
    });
  }

  /**
   * chrome.storage.local에 저장된 데이터를 불러와서 화면에 표시하는 로직
   * - chrome.storage.local에 저장된 데이터를 index순서로 정렬
   * - 순서대로 2nd Brain의 메모를 화면에 표시
   */
  if (list) {
    chrome.storage.local.get(null, (items) => {
      Object.entries(items)
        .sort((a, b) => a[0].split("__")[1] - b[0].split("__")[1])
        .forEach(([key, value]) => {
          if (key.includes("2ndBrain_item__")) {
            const itemIndex = parseInt(key.split("__")[1]);
            if (itemIndex >= index) {
              index = itemIndex + 1;
            }
            createListItem(value, itemIndex);
          }
        });
    });
  }

  /**
   * 2nd Brain의 메모를 삭제하는 로직
   * - clearButton을 클릭하면 chrome.storage.local를 비우고, 화면을 새로고침
   */
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      chrome.storage.local.clear();
      index = 0;
      location.reload(true);
    });
  }
};

const createListItem = (text, index = index) => {
  const listItem = document.createElement("li");
  const itemText = document.createElement("span");
  const deleteButton = document.createElement("button");

  deleteButton.textContent = "DEL";
  deleteButton.className = "delButton";
  deleteButton.id = "delButton_id__" + index;
  deleteButton.onclick = function () {
    list.removeChild(listItem);
    chrome.storage.local.remove([
      "2ndBrain_item__" + deleteButton.id.split("__")[1],
    ]);
    location.reload(true);
  };
  itemText.textContent = text;
  listItem.appendChild(itemText);
  listItem.appendChild(deleteButton);

  list.appendChild(listItem);
  textInput.value = "";
};
