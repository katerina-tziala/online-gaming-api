import { Invitation } from "./invitation.interface";

export interface ClientData {
  id: string;
  username: string;
  gameRoomId: string;
  joinedAt: string;
  properties?: {};
}

export interface UserData extends ClientData {
  origin?: string;
  invitations?: Invitation[];
}

export interface ClientUpdateData  {
  username?: string;
  properties?: {};
}