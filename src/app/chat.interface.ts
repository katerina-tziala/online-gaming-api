import { ClientData } from "./client/client-data.interface";

export interface Chat {
  content: any;
  recipientId?: string;
  sender?: ClientData;
  deliveredAt?: string;
}
