const textInput = document.getElementById("textInput");
const enterButton = document.getElementById("addButton");
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

function addListItem() {
  console.log("addListItem");
  const text = textInput.value;
  if (text) {
    localStorage.setItem("2nd_brain_" + index, text);
    index++;
    // const listItem = document.createElement("li");
    // listItem.textContent = text;
    // document.getElementById("list").appendChild(listItem);
    textInput.value = "";
  }
}
