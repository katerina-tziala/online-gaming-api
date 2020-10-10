import { MessageInType, MessageOutType } from "./message-types.enum";

export interface MessageIn {
  type: MessageInType;
  data: any;
}

export interface MessageOut {
  type: MessageOutType;
  data: any;
}

