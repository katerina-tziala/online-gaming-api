export interface ClientData {
  id: string;
  username?: string;
  inGame?: boolean;
  gameId?: string;
  joinedAt?: string;
  properties?: {};
  team?: string;
  turn?: boolean;
}
