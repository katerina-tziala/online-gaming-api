import { Invitation } from "./invitation.interface";

export interface UserInfo {
  id: string;
  username: string;
  gameRoomId: string;
  properties?: {};
}

export interface UserData extends UserInfo {
  origin?: string;
  invitations?: Invitation[];
}