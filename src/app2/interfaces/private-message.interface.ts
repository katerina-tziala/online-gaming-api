import { ClientData } from "./user-data.interface";

export interface PrivateMessage {
  content: {};
  recipientId?: string;
  sender?: ClientData;
}
