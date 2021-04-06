import {
  arrayDifference,
  getDurationFromDates,
  isOdd,
  randomFromArray,
} from "../../utils/utils";
import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";
import { Duration } from "../duration.interface";
import { TurnsHandler } from "../game/turns/turns-handler";
import { GameConfig } from "../session/game-room/game-config/game-config";
import { GameState } from "../session/game-room/game.interfaces";

export class GameController {
  private startedAt: string;
  private endedAt: string;

  public players: ClientData[] = [];
  private _teamsRequired: boolean;

  private _TurnsHandler: TurnsHandler;
  private _teams: Map<string, string[]>;

  constructor(config: GameConfig) {
    this.init();
    if (config.turnsSwitch) {
      this._TurnsHandler = new TurnsHandler(config.turnsSwitch, config.turnsRandomStart);
    }

   console.log(config);

  }


  public get turnsConfigured(): boolean {
    return !!this._TurnsHandler;
  }

  public get playerStartId(): string {
    return this._TurnsHandler ? this._TurnsHandler.startingPlayer : undefined;
  }

  private get playersTurns(): string[] {
    return this._TurnsHandler ? this._TurnsHandler.playersTurns : undefined;
  }
  //

  private init(): void {
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

  public get initialState(): GameState {
    return {
      ...this.state,
      playerStartId: this.playerStartId,
      playersTurns: this.playersTurns
    };
  }


  // completedIn: this.completedIn,


  public get state(): GameState {
    return {
      idle: this.idle,
      startedAt: this.startedAt,
      endedAt: this.endedAt
    };
  }

  public get playersIds(): string[] {
    return this.players.map(player => player.id);
  }

  public get playerOnTurn(): ClientData {
    return this.players.find(player => player.turn);
  }

  public getPlayerInfo(client: Client): ClientData {
    const clientInfo = client.info;
    const playerInfo = this.getPlayerById(client.id);
    return playerInfo ? Object.assign(clientInfo, playerInfo) : clientInfo;
  }

  public start(playersIds: string[]): void {
    this.setUpPlayers(playersIds);
    // this.assignTeams();
    this.initGameState();
    console.log("start game");

  }

  public endGame(): void {
    this.endedAt = new Date().toString();
  }

  public initGameState(): void {
    this.init();
    this.setUpTurns();

    this.startedAt = new Date().toString();
    // this.setStartingPlayer();
    // this.setPlayerOnTurn(this.playerStartId);
    // console.log(this.playerStartId);
    // console.log(this.players);
  }

  public switchTurns(): void {
    const currentPlayerOnTurn = this.playerOnTurn;
    const nexPlayerOnTurn = this._TurnsHandler.getNextTurnPlayer(currentPlayerOnTurn.id);
    this.setPlayerOnTurn(nexPlayerOnTurn);
  }

  public isPlayerOnTurn(client: Client): boolean {
   return this.turnsConfigured ? this.playerOnTurn.id === client.id : true;
  }

  private setUpPlayers(playersIds: string[]): void {
    const turn = this.turnsConfigured ? false : undefined;
    this.players = playersIds.map(id => {
      return  { id, turn };
    });
  }

  private getPlayerById(playerId: string): ClientData {
    return this.players.find(player => player.id === playerId);
  }

  private setUpTurns(): void {
    if (this.turnsConfigured) {
      this._TurnsHandler.setTurns(this.playersIds, this._teams);
      this.setPlayerOnTurn(this.playerStartId);
    }
  }

  private setPlayerOnTurn(playerOnTurnId: string): void {
    this.players.forEach(player => player.turn = player.id === playerOnTurnId);
  }











  // private assignTeams(): void {
  //   const teams: any = this.createTeams();
  //   const teamNames = Object.keys(teams);
  //   this.players = this.players.map(player => {
  //     player.team = teamNames.find(teamName => teams[teamName].includes(player.id))
  //     return player;
  //   });
  // }

  // private createTeams(): { teamA: string[]; teamB: string[] } {
  //   const playersIds = this.playersIds;
  //   let teamA: string[] = [];
  //   let teamB: string[] = [];
  //   if (this._teamsRequired && playersIds.length && isOdd(playersIds.length)) {
  //     const playersPerTeam = Math.floor(playersIds.length / 2);
  //     teamA = this.getTeamPlayers(playersIds, playersPerTeam);
  //     teamB = arrayDifference<string>(playersIds, teamA);
  //   }
  //   return { teamA, teamB };
  // }

  // private getTeamPlayers(playersIds: string[], playersPerTeam = 1): string[] {
  //   const playersInTeam: string[] = [];
  //   while (playersInTeam.length < playersPerTeam) {
  //     const selectedPlayerId = randomFromArray<string>(playersIds);
  //     if (!playersInTeam.includes(selectedPlayerId)) {
  //       playersInTeam.push(selectedPlayerId);
  //     }
  //   }
  //   return playersInTeam;
  // }
}
