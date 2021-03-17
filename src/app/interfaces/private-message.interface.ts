import { ClientInfo } from "./user-data.interface";

export interface PrivateMessage {
  message: {};
  recipientId?: string;
  sender?: ClientInfo;
}
