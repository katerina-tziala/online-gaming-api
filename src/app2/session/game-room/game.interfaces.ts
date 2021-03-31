import { GameConfig } from "./game-config/game-config";
import { Duration } from "../../interfaces/duration.interface";
import { ClientData } from "../../interfaces/user-data.interface";

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


export interface GameInvitation {
  creator: string;
  game: GameInfo;
  playersExpected?: ClientData[];
}


export interface GameRestart {
  id: string;
  createdAt: string;
  playerRequested: ClientData;
  playersConfirmed?: ClientData[];
  playersExpectedToConfirm?: ClientData[];
}