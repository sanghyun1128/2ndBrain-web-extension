const textInput = document.getElementById("textInput");
const enterButton = document.getElementById("addButton");
const list = document.getElementById("list");
let index = 0;

if (textInput && enterButton) {
  textInput.focus();
  textInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      enterButton.click();
    }
  });
  enterButton.addEventListener("click", addListItem);
}

//TODO: localStorage에 저장된 데이터가 무작위 순서로 나오는 문제
if (list) {
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).includes("2nd_brain_item__")) {
      const itemIndex = localStorage.key(i).split("__")[1];
      if (parseInt(itemIndex) >= index) {
        index = parseInt(itemIndex) + 1;
      }

      const listItem = document.createElement("li");
      const itemText = document.createElement("span");
      const deleteButton = document.createElement("button");

      deleteButton.textContent = "DEL";
      deleteButton.className = "delButton";
      deleteButton.id = "delButton_" + itemIndex;
      deleteButton.onclick = function () {
        list.removeChild(listItem);
        localStorage.removeItem("2nd_brain_item__" + itemIndex);
      };
      itemText.textContent = localStorage.getItem(localStorage.key(i));
      listItem.appendChild(itemText);
      listItem.appendChild(deleteButton);

      list.appendChild(listItem);
    }
  }
}

function addListItem() {
  const text = textInput.value;
  if (text) {
    localStorage.setItem("2nd_brain_item__" + index, text);

    const listItem = document.createElement("li");
    const itemText = document.createElement("span");
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "DEL";
    deleteButton.className = "delButton";
    deleteButton.id = "delButton_" + index;
    deleteButton.onclick = function () {
      list.removeChild(listItem);
      localStorage.removeItem(
        "2nd_brain_item__" + deleteButton.id.split("_")[1]
      );
    };
    itemText.textContent = text;
    listItem.appendChild(itemText);
    listItem.appendChild(deleteButton);

    list.appendChild(listItem);
    textInput.value = "";
    index++;
  }
}
