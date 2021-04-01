import { Duration } from "../../duration.interface";
import { GameConfig } from "./game-config/game-config.inteface";
import { ClientData } from "../../client/client-data.interface";

export interface GameInfo extends GameConfig {
  id: string;
  filled: boolean;
  idle: boolean;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  settings?: {};
  playerStartId?: string;
  players?: ClientData[];
  completedIn?: Duration;
  expectedRestartCorfirmations?: string[];
}

export interface GameRoomOpened {
  user: ClientData;
  game: GameInfo;
  playersExpected?: ClientData[];
}

export interface PlayerEntrance {
  playerJoined: ClientData;
  game: GameInfo;
  playersExpected?: ClientData[];
}

// export interface GameInvitation {
//   creator: string;
//   game: GameInfo;
//   playersExpected?: ClientData[];
// }

// export interface GameRestart {
//   id: string;
//   createdAt: string;
//   playerRequested: ClientData;
//   playersConfirmed?: ClientData[];
//   playersExpectedToConfirm?: ClientData[];
// }