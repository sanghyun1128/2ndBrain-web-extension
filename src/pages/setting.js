let size = 0;

window.onload = () => {
  const list = document.getElementById("list");
  if (list) {
    chrome.storage.local.get(null, (items) => {
      Object.entries(items).forEach(([key, value]) => {
        if (key.includes("2ndBrain_item__")) {
          const itemAddTime = parseInt(key.split("__")[1]);
          createListItem(value.content, itemAddTime);
          size++;
        }
      });
    });
  }
};

const createListItem = (text, itemAddTimeToMs) => {
  const list = document.getElementById("list");
  const listItem = document.createElement("li");
  const itemText = document.createElement("span");

  itemText.textContent = text;
  listItem.id = "listItem_id__" + itemAddTimeToMs;
  listItem.appendChild(itemText);

  list.appendChild(listItem);
  listItem.scrollIntoView({ block: "end", behavior: "smooth" });
};

const deleteListItem = (itemAddTimeToMs) => {
  const list = document.getElementById("list");
  const listItem = document.getElementById("listItem_id__" + itemAddTimeToMs);
  list.removeChild(listItem);
  size--;
};
