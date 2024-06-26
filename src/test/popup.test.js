const puppeteer = require("puppeteer");
const path = require("path");
const {
  MAX_INPUT_LENGTH,
  MAX_MEMO_SIZE,
  WARNING_TEXT_EN,
} = require("./const/popup.const.js");

describe("2ndBrain Chrome Extension popup", () => {
  let browser;
  let extensionPage;

  beforeAll(async () => {
    const extensionPath = path.resolve(__dirname, "../..");
    browser = await puppeteer.launch({
      headless: true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--allow-file-access-from-files",
      ],
      ignoreHTTPSErrors: true,
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
    const settingButton = await extensionPage.$("#settingButton");

    expect(textInput).not.toBeNull();
    expect(warningMessage).not.toBeNull();
    expect(addButton).not.toBeNull();
    expect(list).not.toBeNull();
    expect(historyButton).not.toBeNull();
    expect(clearButton).not.toBeNull();
    expect(settingButton).not.toBeNull();
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

    await extensionPage.waitForFunction(() => {
      return document.querySelector("#list li") === null;
    });

    const listItemAfterDeletion = await extensionPage.$("#list li");
    expect(listItemAfterDeletion).toBeNull();
  });

  it("should not add an empty task", async () => {
    const addButton = await extensionPage.$("#addButton");
    await addButton.click();

    const warningMessage = await extensionPage.$eval(
      "#warningMessage",
      (el) => el.textContent
    );
    expect(warningMessage).toBe(WARNING_TEXT_EN.EMPTY_INPUT_WARNING);
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
    expect(warningMessage).toBe(WARNING_TEXT_EN.MAX_INPUT_LENGTH_WARNING);

    await addButton.click();
  });

  it("should clear all items", async () => {
    const clearButton = await extensionPage.$("#clearButton");
    await clearButton.click();

    await extensionPage.waitForFunction(() => {
      return document.querySelectorAll("#list li").length === 0;
    });

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
    expect(warningMessage).toBe(WARNING_TEXT_EN.MAX_MEMO_SIZE_WARNING);

    const listItems = await extensionPage.$$("#list li");
    expect(listItems.length).toBe(MAX_MEMO_SIZE);
  });
});
