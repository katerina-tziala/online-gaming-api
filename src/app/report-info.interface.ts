import { GameRoomInfo } from "./session/game-room/game.interfaces";
import { ClientData } from "./client/client-data.interface";

export interface ReportInfo {
  origin?: string;
  port?: number;
  clients?: ClientData[];
  privateGameRooms?: GameRoomInfo[];
  gameRooms?: GameRoomInfo[];
};