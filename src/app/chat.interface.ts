import { ClientData } from "./client/client-data.interface";

export interface Chat {
  content: {};
  recipientId?: string;
  sender?: ClientData;
  deliveredAt?: string;
}
