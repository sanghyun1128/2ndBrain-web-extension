const puppeteer = require("puppeteer");
const path = require("path");
const {
  MAX_INPUT_LENGTH,
  MAX_MEMO_SIZE,
  WARNING_TEXT,
} = require("./const/popup.const.js");
const exp = require("constants");

describe("2ndBrain Chrome Extension popup", () => {
  let browser;
  let extensionPage;

  beforeAll(async () => {
    const extensionPath = path.resolve(__dirname, "../..");
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium-browser",
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    extensionPage = await browser.newPage();
    const extensionId = "fdcemnaglaaiilfkdcbeaaalefggpicm";
    await extensionPage.goto(
      `chrome-extension://${extensionId}/src/popup/popup.html`
    );
  });

  afterAll(async () => {
    if (browser) await browser.close();
  });

  it("should popup ui load", async () => {
    const textInput = await extensionPage.$("#textInput");
    const warningMessage = await extensionPage.$("#warningMessage");
    const addButton = await extensionPage.$("#addButton");
    const list = await extensionPage.$("#list");
    const historyButton = await extensionPage.$("#historyButton");
    const clearButton = await extensionPage.$("#clearButton");

    expect(textInput).not.toBeNull();
    expect(warningMessage).not.toBeNull();
    expect(addButton).not.toBeNull();
    expect(list).not.toBeNull();
    expect(historyButton).not.toBeNull();
    expect(clearButton).not.toBeNull();
  });

  it("should add and delete a item", async () => {
    const textInput = await extensionPage.$("#textInput");
    const addButton = await extensionPage.$("#addButton");

    await textInput.type("Test Item");
    await addButton.click();

    const listItemText = await extensionPage.$eval(
      "#list li span",
      (el) => el.textContent
    );
    expect(listItemText).toBe("Test Item");

    const deleteButton = await extensionPage.$("#list li button");
    await deleteButton.click();
    expect(await extensionPage.$("#list li")).toBeNull();
  });

  it("should not add an empty task", async () => {
    const addButton = await extensionPage.$("#addButton");
    await addButton.click();

    const warningMessage = await extensionPage.$eval(
      "#warningMessage",
      (el) => el.textContent
    );
    expect(warningMessage).toBe(WARNING_TEXT.EMPTY_INPUT_WARNING);
  });

  it("should show a warning when input length exceeds max", async () => {
    const textInput = await extensionPage.$("#textInput");
    const addButton = await extensionPage.$("#addButton");

    await textInput.type("A".repeat(MAX_INPUT_LENGTH + 1));
    const inputValue = await extensionPage.$eval(
      "#textInput",
      (el) => el.value
    );
    expect(inputValue.length).toBe(MAX_INPUT_LENGTH);

    const warningMessage = await extensionPage.$eval(
      "#warningMessage",
      (el) => el.textContent
    );
    expect(warningMessage).toBe(WARNING_TEXT.MAX_INPUT_LENGTH_WARNING);

    await addButton.click();
  });

  it("should clear all items", async () => {
    const clearButton = await extensionPage.$("#clearButton");
    await clearButton.click();

    const listItems = await extensionPage.$$("#list li");
    expect(listItems.length).toBe(0);
  });

  it("should limit the number of items", async () => {
    const textInput = await extensionPage.$("#textInput");
    const addButton = await extensionPage.$("#addButton");

    for (let i = 0; i <= MAX_MEMO_SIZE; i++) {
      await textInput.type(`Item ${i}`);
      await addButton.click();
    }

    const warningMessage = await extensionPage.$eval(
      "#warningMessage",
      (el) => el.textContent
    );
    expect(warningMessage).toBe(WARNING_TEXT.MAX_MEMO_SIZE_WARNING);

    const listItems = await extensionPage.$$("#list li");
    expect(listItems.length).toBe(MAX_MEMO_SIZE);
  });
});
