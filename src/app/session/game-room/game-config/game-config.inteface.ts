import { TeamJoin } from "../../../game/teams/team-join.enum";
import { TurnsSwitch } from "../../../game/turns/turns-switch.enum";

export interface TeamsConfig {
  numberOfTeams: number;
  playersPerTeam?: number;
  joinTeams?: TeamJoin;
}
export interface GameConfig {
  playersRequired?: number;
  startWaitingTime?: number;
  roomType?: string;
  turnsSwitch?: TurnsSwitch;
  turnsRandomStart?: boolean;
  teams?: TeamsConfig;
  settings?: {};
  playersExpected?: string[];
}
