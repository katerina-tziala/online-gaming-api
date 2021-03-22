import { ClientData } from "../../interfaces/user-data.interface";

export interface GameRestart {
  id: string;
  createdAt: string;
  playerRequested: ClientData;
  playersConfirmed?: ClientData[];
  playersExpectedToConfirm?: ClientData[];
}
