import { UserData } from "./user-data.interface";

export interface Invitation {
  id: string;
  createdAt: string;
  sender: UserData;
  game: any;
  recipient: UserData;
}