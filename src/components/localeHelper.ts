import { requestContext } from "../context";

export function getCurrentLocale(): string {
  const store = requestContext.getStore();
  return store?.locale;
}