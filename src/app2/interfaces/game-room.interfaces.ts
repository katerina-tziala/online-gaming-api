import { Duration } from "./duration.interface";
import { ClientData } from "./user-data.interface";

export interface GameConfig {
  playersAllowed?: number;
  startWaitingTime?: number;
  roomType?: string;
}
  // playersExpected?: string[];
export interface GameInfo extends GameConfig {
  id: string;
  entranceAllowed: boolean;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  settings?: {};
  playerStartId?: string;
  players?: ClientData[];
  completedIn?: Duration;
}

export interface GameMessage {
  sender: ClientData;
  game?: GameInfo;
  data?: {};
}

// export interface OpenPrivateGameRoom {
//   recipients: string[];
//   config: GameConfig;
//   settings?: {};
// }

// gameState: data,
// sender: initiator.details,
/**
 * "game-entrance-forbidden"
 */
/**
 * "player-joined"
 */
