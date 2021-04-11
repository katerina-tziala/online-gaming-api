import { ArraySuffling } from "../../utils/array-suffling";
import { positionInArray } from "../../utils/utils";
import { TurnsSwitch } from "./turns-switch.enum";

export class TurnsHandler {
  private _turnsConfig: Map<TurnsSwitch, (arrayToSuffle: string[]) => string[]> = new Map();
  private _turnsIndex: string[] = [];
  private _teamsTurns: string[] = [];
  private _playersIds: string[] = [];
  private _teamsMap: Map<string, string[]>;
  private _turnsSwitchType = TurnsSwitch.LeftWise;
  private _randomStart = true;

  constructor(switchType: TurnsSwitch, randomStart = true) {
    this._turnsSwitchType = switchType;
    this._randomStart = randomStart;
    this.setTurnsConfig();
  }

  private setTurnsConfig(): void {
    this._turnsConfig.set(TurnsSwitch.RightWise, this.getRightWiseTurns.bind(this));
    this._turnsConfig.set(TurnsSwitch.LeftWise, this.getLeftWiseTurns.bind(this));
    this._turnsConfig.set(TurnsSwitch.Random, this.getRandomTurns.bind(this));
  }

  public get startingPlayer(): string {
    return this._turnsIndex[0];
  }

  public get playersTurns(): string[] {
    return this._turnsIndex;
  }

  public get teamsTurns(): string[] {
    return this._teamsTurns;
  }

  public getNextTurnPlayer(currentTurn: string): string {
    const currentTurnPosition = positionInArray(this._turnsIndex, currentTurn);
    const nextPosition = currentTurnPosition + 1;
    const nextTurn = this._turnsIndex[nextPosition];
    return nextTurn ? nextTurn : this._turnsIndex[0];
  }

  public setTurns(playersIds: string[], teamsMap: Map<string, string[]>): void {
    this._playersIds = playersIds;
    this._teamsMap = teamsMap;
    this._teamsMap ? this.setTeamsTurnsIndex() : this.setPlayersTurnsIndex();
  }

  private setPlayersTurnsIndex(): void {
    this._turnsIndex = this.getTurnsIndex(this._playersIds);
  }

  private setTeamsTurnsIndex(): void {
    const teamsIds = Array.from(this._teamsMap.keys());
    this._teamsTurns = this.getTurnsIndex(teamsIds);

    const playersPerTeam = this.getTeamPlayers(this._teamsTurns[0]).length;
    this.setTurnsInTeams();

    let playersTurns: string[] = [];
    for (let index = 0; index < playersPerTeam; index++) {
      const playersInSamePositions = this.getPlayersFromTeamsWithSamePosition(index);
      playersTurns = [...playersTurns, ...playersInSamePositions]
    }
    this._turnsIndex = playersTurns;
  }

  private setTurnsInTeams(): void {
    const teamsIds = Array.from(this._teamsMap.keys());
    const newTeamsMap: Map<string, string[]> = new Map();
    teamsIds.forEach(team => {
      const playersInTeam = this._teamsMap.get(team);
      const turnsInTeam = this.getTurnsIndex(playersInTeam);
      newTeamsMap.set(team, turnsInTeam);
    });
    this._teamsMap = newTeamsMap;
  }

  private getTeamPlayers(teamName: string): string[] {
    return this._teamsMap ? this._teamsMap.get(teamName) : [];
  }

  private getTeamPlayerFromPosition(teamName: string, playerPosition: number): string {
    return this.getTeamPlayers(teamName)[playerPosition];
  }

  private getPlayersFromTeamsWithSamePosition(position: number): string[] {
    const playersInSamePosition: string[] = [];
    this._teamsTurns.forEach(teamName => {
      playersInSamePosition.push(this.getTeamPlayerFromPosition(teamName, position))
    });
    return playersInSamePosition;
  }

  private getTurnsIndex(arrayToSuffle: string[]): string[] {
    return this._turnsConfig.get(this._turnsSwitchType)(arrayToSuffle);
  }

  private getRightWiseTurns(arrayToSuffle: string[]): string[] {
    return ArraySuffling.suffleRightWise(arrayToSuffle, this._randomStart);
  }

  private getLeftWiseTurns(arrayToSuffle: string[]): string[] {
    return ArraySuffling.suffleLeftWise(arrayToSuffle, this._randomStart);
  }

  private getRandomTurns(arrayToSuffle: string[]): string[] {
    return ArraySuffling.suffleRandomly(arrayToSuffle);
  }

}
