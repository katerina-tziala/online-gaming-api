import { TeamJoin } from "../../teams/team-join.enum";
import { ValidTypes } from "../../../validators/validators";
import { TeamsConfig } from "../game-config.inteface";

export class TeamsConfigValidator {
  public static getValidConfig(playersRequired: number,  config: TeamsConfig): TeamsConfig {
    const numberOfTeams = this.getValidNumberOfTeams(config?.numberOfTeams);
    const playersPerTeam = this.getValidPlayersPerTeam(config?.playersPerTeam);
    const joinTeams = this.getValidTeamJoinType(config?.joinTeams);
    const totalPlayers = numberOfTeams * playersPerTeam;
    if (totalPlayers !== playersRequired) {
      return;
    }
    return { numberOfTeams, playersPerTeam, joinTeams };
  }

  private static getValidNumberOfTeams(value: number): number {
    const numberOfTeams = this.getValidNumberConfig(value);
    return numberOfTeams > 1 ? numberOfTeams : 0;
  }

  private static getValidPlayersPerTeam(value: number): number {
    return this.getValidNumberConfig(value);
  }

  private static getValidNumberConfig(value: number): number {
    return ValidTypes.typeOfNumber(value)
      ? ValidTypes.positiveInteger(value)
      : 0;
  }

  private static getValidTeamJoinType(value: TeamJoin): TeamJoin {
    const allowedValues: string[] = Object.values(TeamJoin);
    return allowedValues.includes(value) ? value : TeamJoin.Random;
  }
}
