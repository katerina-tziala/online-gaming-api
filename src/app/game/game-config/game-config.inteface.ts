import { TeamJoin } from "../teams/team-join.enum";
import { TurnsSwitch } from "../turns/turns-switch.enum";

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
  restartAllowed?: boolean;
  settings?: {};
  playersExpected?: string[];
}
