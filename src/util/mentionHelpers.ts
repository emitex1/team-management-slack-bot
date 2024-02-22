export const replaceStartMentions = (text: string, targetText = "") => {
  const startMentionPattern = /^<@[A-Z0-9]+>/;
  if (startMentionPattern.test(text)) {
    return text.replace(startMentionPattern, targetText).trim();
  }
  return text;
};

export const replaceMiddleMentions = (
  text: string,
  targetText = "John Doe"
) => {
  const mentionInTheMiddlePattern = /<@[A-Z0-9]+>/;
  const match = text.match(mentionInTheMiddlePattern);
  let mentionedMemberId = match ? match[0] : undefined;
  mentionedMemberId = mentionedMemberId?.substring(
    2,
    mentionedMemberId.length - 1
  );
  // elog("mentionedMemberId = ", mentionedMemberId);

  return {
    text: text.replace(mentionInTheMiddlePattern, targetText).trim(),
    mentionedMemberId: mentionedMemberId,
  };
};
