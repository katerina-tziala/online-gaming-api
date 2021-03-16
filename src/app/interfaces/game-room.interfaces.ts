import { Duration } from "./duration.interface";
// import { UserInfo } from "./user-data.interface";

export interface GameConfig {
  allowedPlayers: number;
  startWaitingTime: number;
  roomType?: string;
}

export interface GameInfo {
  id: string;
  url: string;
  config: GameConfig;
  roomClosed: boolean;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  settings?: {};
  playerStartId?: string;
  // players?: UserInfo[];
  // durationCompleted?: Duration;
}

export interface GameMessage {
  // sender: UserInfo;
  game?: GameInfo;
  // data?: {};
}

export interface InviteAndOpenRoom {
  recipients: string[];
  config: GameConfig;
  settings?: {};
}

// gameState: data,
// sender: initiator.details,
/**
 * "game-entrance-forbidden"
 */
/**
 * "player-joined"
 */
