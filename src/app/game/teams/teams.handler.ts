import { arrayDifference, randomFromArray } from "../../../utils/utils";

export class TeamsHandler {

  public static numberOfPlayersPerTeam(numberOfPlayers: number, numberOfTeams = 2): number {
    return numberOfPlayers / numberOfTeams;
  }

  public static createTeams(playersIds: string[], numberOfTeams = 2): Map<string, string[]> {
    const numberOfPlayersPerTeam = this.numberOfPlayersPerTeam(playersIds.length, numberOfTeams);
    let playersToAssign: string[] = [...playersIds];
    const teamsMap: Map<string, string[]> = new Map();
    for (let index = 1; index <= numberOfTeams; index++) {
        const teamName = `team-${index}`;
        let playersForTeam: string[] = [];
        if (numberOfPlayersPerTeam === playersToAssign.length) {
            playersForTeam = playersToAssign;
        } else {
            playersForTeam = this.getPlayersForTeam(playersToAssign, numberOfPlayersPerTeam);
            playersToAssign = arrayDifference<string>(playersToAssign, playersForTeam);
        }
        teamsMap.set(teamName, playersForTeam);
    }
    return teamsMap;
  }

  public static getTeamPlayers(teams: Map<string, string[]>, teamName: string): string[] {
    return teams.get(teamName);
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
