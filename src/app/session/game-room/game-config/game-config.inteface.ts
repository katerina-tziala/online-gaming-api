import { TeamJoin } from "../../../game/teams/team-join.enum";
import { TurnsSwitch } from "../../../game/turns/turns-switch.enum";

export interface GameConfig {
  playersAllowed?: number;
  startWaitingTime?: number;
  roomType?: string;
  turnsSwitch?: TurnsSwitch;
  turnsRandomStart?: boolean;
  teams?: number;
  playersPerTeam?: number;
  joinTeams?: TeamJoin;
  settings?: {};
}