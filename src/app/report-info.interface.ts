import { ClientData } from './client/client-data.interface';
import { GameRoomInfo } from './session/game-room/game.interfaces';

export interface ReportInfo {
  origin?: string;
  port?: number;
  clients?: ClientData[];
  privateGameRooms?: GameRoomInfo[];
  gameRooms?: GameRoomInfo[];
};