const MAX_MEMO_SIZE = 10;
const MAX_INPUT_LENGTH = 30;
const WARNING_TEXT = {
  MAX_MEMO_SIZE_WARNING: `메모는 최대 ${MAX_MEMO_SIZE}개까지 저장 가능합니다.`,
  MAX_INPUT_LENGTH_WARNING: `메모는 ${MAX_INPUT_LENGTH}자 이내로 입력해주세요.`,
  EMPTY_INPUT_WARNING: "메모를 입력해주세요.",
};

module.exports = {
  MAX_MEMO_SIZE,
  MAX_INPUT_LENGTH,
  WARNING_TEXT,
};
