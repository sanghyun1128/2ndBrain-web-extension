const MAX_MEMO_SIZE = 10;
const MAX_DELETED_MEMO_SIZE = 100;
const MAX_INPUT_LENGTH = 30;
const WARNING_TEXT_KO = {
  MAX_MEMO_SIZE_WARNING: `메모는 최대 ${MAX_MEMO_SIZE}개까지 저장 가능합니다.`,
  MAX_INPUT_LENGTH_WARNING: `메모는 ${MAX_INPUT_LENGTH}자 이내로 입력해주세요.`,
  EMPTY_INPUT_WARNING: "메모를 입력해주세요.",
};
const WARNING_TEXT_EN = {
  MAX_MEMO_SIZE_WARNING: `You can save up to ${MAX_MEMO_SIZE} memos.`,
  MAX_INPUT_LENGTH_WARNING: `Please enter a memo within ${MAX_INPUT_LENGTH} characters.`,
  EMPTY_INPUT_WARNING: "Please enter a memo.",
};

module.exports = {
  MAX_MEMO_SIZE,
  MAX_DELETED_MEMO_SIZE,
  MAX_INPUT_LENGTH,
  WARNING_TEXT_KO,
  WARNING_TEXT_EN,
};
