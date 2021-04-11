import { TeamsConfig } from "../game-config/game-config";
import { arrayDifference, randomFromArray } from "../../../utils/utils";
import { TeamJoin } from "./team-join.enum";

export class TeamsHandler {
  public static createTeams(playersIds: string[], teamsConfig: TeamsConfig): Map<string, string[]> {
    const playersToAssign: string[] = [...playersIds].sort();
    if (teamsConfig.joinTeams === TeamJoin.Random) {
      return this.createRandomTeams(playersToAssign, teamsConfig.numberOfTeams, teamsConfig.playersPerTeam);
    }
    return this.createOrderedTeams(playersToAssign, teamsConfig.numberOfTeams, teamsConfig.playersPerTeam);
  }

  public static getTeamPlayers(teams: Map<string, string[]>, teamName: string): string[] {
    return teams.get(teamName);
  }

  public static getPlayerTeam(teams: Map<string, string[]>, playerId: string): string {
    const teamsNames = Array.from(teams.keys());
    return teamsNames.find(teamName => teams.get(teamName).includes(playerId));
  }

  private static createOrderedTeams(playersToAssign: string[], teamsNumber: number, playersPerTeam: number): Map<string, string[]> {
    const teamsMap: Map<string, string[]> = new Map();
    for (let index = 1; index <= teamsNumber; index++) {
      const teamName = this.teamName(index);
      const startIndex = (index - 1) * playersPerTeam;
      const endIndex = startIndex + playersPerTeam;
      const playersForTeam = playersToAssign.slice(startIndex, endIndex);
      teamsMap.set(teamName, playersForTeam);
    }
    return teamsMap;
  }

  private static teamName(teamIndex: number): string {
    return `team-${teamIndex}`;
  }

  private static createRandomTeams(playersIds: string[], teamsNumber: number, playersPerTeam: number): Map<string, string[]> {
    let playersToAssign: string[] = [...playersIds];
    const teamsMap: Map<string, string[]> = new Map();
    for (let index = 1; index <= teamsNumber; index++) {
      const teamName = this.teamName(index);
      let playersForTeam: string[] = [];
      if (playersPerTeam === playersToAssign.length) {
        playersForTeam = playersToAssign;
      } else {
        playersForTeam = this.getPlayersForTeam(playersToAssign,playersPerTeam);
        playersToAssign = arrayDifference<string>(playersToAssign, playersForTeam);
      }
      teamsMap.set(teamName, playersForTeam.sort());
    }
    return teamsMap;
  }



  private static getPlayersForTeam(playersIds: string[], playersPerTeam = 2): string[] {
    const playersInTeam: string[] = [];
    while (playersInTeam.length < playersPerTeam) {
      const selectedPlayerId = randomFromArray<string>(playersIds);
      if (!playersInTeam.includes(selectedPlayerId)) {
        playersInTeam.push(selectedPlayerId);
      }
    }
    return playersInTeam;
  }
}
