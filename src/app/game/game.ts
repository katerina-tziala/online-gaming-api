import { getDurationFromDates } from "../../utils/utils";
import { Client } from "../client/client";
import { ClientData } from "../client/client-data.interface";
import { Duration } from "../duration.interface";
import { TeamsHandler } from "./teams/teams.handler";
import { TurnsHandler } from "./turns/turns-handler";
import { GameConfig } from "./game-config/game-config";
import { TeamsConfig } from "./game-config/game-config.inteface";
import { GameState } from "../session/game-room/game.interfaces";

export class Game {
  private _teamsConfig: TeamsConfig;
  private _TurnsHandler: TurnsHandler;
  private _teams: Map<string, string[]>;
  private _players: ClientData[] = [];
  private startedAt: string;
  private endedAt: string;

  constructor(config: GameConfig) {
    this._teamsConfig = config.teams;
    if (config.turnsSwitch) {
      this._TurnsHandler = new TurnsHandler(config.turnsSwitch, config.turnsRandomStart);
    }
    this.init();
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

  private get teamsTurns(): string[] {
    return this._TurnsHandler ? this._TurnsHandler.teamsTurns : undefined;
  }

  public init(): void {
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

  public get over(): boolean {
    return !!this.endedAt;
  }

  public get initialState(): GameState {
    return {
      ...this.state,
      playerStartId: this.playerStartId,
      playersTurns: this.playersTurns,
      teamsTurns: this.teamsTurns
    };
  }

  public get finalState(): GameState {
    return {
      ...this.initialState,
      completedIn: this.completedIn
    };
  }

  public get state(): GameState {
    return {
      idle: this.idle,
      startedAt: this.startedAt,
      endedAt: this.endedAt
    };
  }

  public get playersIds(): string[] {
    return this._players.map(player => player.id);
  }

  public get playerOnTurn(): ClientData {
    return this._players.find(player => player.turn);
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
    this.setUpTurns();
    this.startedAt = new Date().toString();
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
    this._players = playersIds.map(id => {
      return  { id, turn };
    });
  }

  private getPlayerById(playerId: string): ClientData {
    return this._players.find(player => player.id === playerId);
  }

  private setUpTurns(): void {
    if (this.turnsConfigured) {
      this._TurnsHandler.setTurns(this.playersIds, this._teams);
      this.setPlayerOnTurn(this.playerStartId);
    }
  }

  private setPlayerOnTurn(playerOnTurnId: string): void {
    this._players.forEach(player => player.turn = player.id === playerOnTurnId);
  }

  private assignTeams(): void {
    if (this._teamsConfig && !this._teams) {
      this._teams = TeamsHandler.createTeams(this.playersIds, this._teamsConfig);
      this._players.forEach(player => player.team = this.getPlayerTeam(player.id));
    }
  }

  private getPlayerTeam(playerOnTurnId: string): string {
    return this._teams ? TeamsHandler.getPlayerTeam(this._teams, playerOnTurnId): undefined;
  }

}
