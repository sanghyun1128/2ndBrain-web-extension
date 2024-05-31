const textInput = document.getElementById("textInput");
const addButton = document.getElementById("addButton");
const list = document.getElementById("list");
const clearButton = document.getElementById("clearButton");
let index = 0; // localStorage에 저장된 데이터의 index를 관리 위한 변수

window.onload = () => {
  console.log("2ndBrain popup.js");
  /**
   * 2nd Brain의 메모를 추가하는 로직
   * - 실행시 textInput으로 커서를 이동
   * - Enter키와 addButton 클릭 이벤트를 연결
   * - addButton을 클릭하면 localStorage에 데이터를 저장하고 createListItem 함수를 호출
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
      if (text) {
        localStorage.setItem("2ndBrain_item__" + index, text);
        createListItem(text, index++);
      }
    });
  }

  //TODO: localStorage에 저장된 데이터가 무작위 순서로 나오는 문제
  //TODO: localStorage => chrome.storage.local로 변경, 위의 문제도 해결 가능할듯
  /**
   * localStorage에 저장된 데이터를 불러와서 화면에 표시하는 로직
   * - localStorage에 저장된 데이터를 순회하면서 2nd Brain의 메모를 화면에 표시
   */
  if (list) {
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i).includes("2ndBrain_item__")) {
        const itemIndex = localStorage.key(i).split("__")[1];
        if (parseInt(itemIndex) >= index) {
          index = parseInt(itemIndex) + 1;
        }
        createListItem(localStorage.getItem(localStorage.key(i)), itemIndex);
      }
    }
  }

  /**
   * 2nd Brain의 메모를 삭제하는 로직
   * - clearButton을 클릭하면 localStorage를 비우고, 화면을 새로고침
   */
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      localStorage.clear();
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
    localStorage.removeItem("2ndBrain_item__" + deleteButton.id.split("__")[1]);
    location.reload(true);
  };
  itemText.textContent = text;
  listItem.appendChild(itemText);
  listItem.appendChild(deleteButton);

  list.appendChild(listItem);
  textInput.value = "";
};
