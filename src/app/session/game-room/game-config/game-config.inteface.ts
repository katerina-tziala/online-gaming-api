import { TurnsSwitchType } from "../../../game/turns/turns-switch.enum";

export interface GameConfig {
  playersAllowed?: number;
  startWaitingTime?: number;
  roomType?: string;
  turnsSwitch?: TurnsSwitchType;
  turnsRandomStart?: boolean;
  settings?: {};
}