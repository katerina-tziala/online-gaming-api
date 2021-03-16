import { Invitation } from "./invitation.interface";

export interface ClientInfo {
  id: string;
  username: string;
  gameRoomId: string;
  properties?: {};
}

export interface UserData extends ClientInfo {
  origin?: string;
  invitations?: Invitation[];
}

export interface ClientUpdateData  {
  username?: string;
  properties?: {};
}