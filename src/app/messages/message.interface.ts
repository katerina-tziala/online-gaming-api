import { MessageInType } from "./message-types.enum";

// export interface Message {
//   // type: string;
//   data: string;
// }


export interface MessageIn {
  type: MessageInType;
  data: any;
}

export interface MessageOut {
  type: string;
  data: any;
}

// export interface MessageOut extends Message {
//   sd: string;
// }


