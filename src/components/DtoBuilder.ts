

export function responseDtoMessage(messageObj: any, locale: string) {
  return messageObj[locale] || "Message not available";
}