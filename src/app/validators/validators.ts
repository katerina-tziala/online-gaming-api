import { UsernameValidator } from "./username-validator";
import { ChatValidator } from "./chat-validator";

const validObject = (value: any): boolean => {
  return value && typeof value === "object";
};

export { UsernameValidator, ChatValidator, validObject };
