import {
  arrayDifference,
  getDurationFromDates,
  isOdd,
  randomFromArray,
} from "../../utils/utils";
import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";
import { Duration } from "../duration.interface";
import { GameState } from "../session/game-room/game.interfaces";

export class GameController {
  private startedAt: string;
  private endedAt: string;
  private playerStartId: string;
  public players: ClientData[] = [];
  private _teamsRequired: boolean;

  constructor(teamsRequired: boolean) {
    this.init();
    this._teamsRequired = teamsRequired;
  }

  private init(): void {
    this.playerStartId = undefined;
    this.startedAt = undefined;
    this.endedAt = undefined;
  }
  private get completedIn(): Duration {
    const start = this.startedAt ? new Date(this.startedAt) : undefined;
    const end = this.endedAt ? new Date(this.endedAt) : undefined;
    return getDurationFromDates(start, end);
  }

  public get idle(): boolean {
    return !this.startedAt && !this.endedAt;
  }

  public get state(): GameState {
    return {
      idle: this.idle,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      playerStartId: this.playerStartId,
      completedIn: this.completedIn,
    };
  }

  public get playersIds(): string[] {
    return this.players.map(player => player.id);
  }

  public getPlayerInfo(client: Client): ClientData {
    const clientInfo = client.info;
    const playerInfo = this.getPlayerById(client.id);
    return playerInfo ? Object.assign(clientInfo, playerInfo) : clientInfo;
  }

  public start(playersIds: string[]): void {
    this.setUpPlayers(playersIds);
    this.assignTeams();
    this.initGameState();
  }

  public endGame(): void {
    this.endedAt = new Date().toString();
  }

  public initGameState(): void {
    this.init();
    this.setStartingPlayer();
    this.startedAt = new Date().toString();
    this.players.forEach(player => player.turn = player.id === this.playerStartId);

    console.log(this.playerStartId);
    console.log(this.players);


  }



  private getPlayerById(playerId: string): ClientData {
    return this.players.find(player => player.id === playerId);
  }

  private setUpPlayers(playersIds: string[]): void {
    const turn = false;
    this.players = playersIds.map(id => {
      return  { id, turn };
    });
  }

  private setStartingPlayer(): void {
    const playersIds = this.playersIds;
    this.playerStartId = randomFromArray<string>(playersIds);
  }

  private assignTeams(): void {
    const teams: any = this.createTeams();
    const teamNames = Object.keys(teams);
    this.players = this.players.map(player => {
      player.team = teamNames.find(teamName => teams[teamName].includes(player.id))
      return player;
    });
  }

  private createTeams(): { teamA: string[]; teamB: string[] } {
    const playersIds = this.playersIds;
    let teamA: string[] = [];
    let teamB: string[] = [];
    if (this._teamsRequired && playersIds.length && isOdd(playersIds.length)) {
      const playersPerTeam = Math.floor(playersIds.length / 2);
      teamA = this.getTeamPlayers(playersIds, playersPerTeam);
      teamB = arrayDifference<string>(playersIds, teamA);
    }
    return { teamA, teamB };
  }

  private getTeamPlayers(playersIds: string[], playersPerTeam = 1): string[] {
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
