export interface ClientData {
  id: string;
  username: string;
  gameRoomId: string;
  joined: boolean;
  joinedAt?: string;
  properties?: {};
}
