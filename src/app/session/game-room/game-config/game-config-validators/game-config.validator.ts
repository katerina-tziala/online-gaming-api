

import { ValidTypes } from "../../../../validators/validators";
import { GameConfig } from "../game-config.inteface";
import { TurnsSwitch } from "../../../../game/turns/turns-switch.enum";
import { TeamsConfigValidator } from "./teams-config.validator";
export class GameConfigValidator {
  private static _DEFAULT_GAME_CONFIG = {
    playersAllowed: 2,
    roomType: "default",
    startWaitingTime: 3000
  };


  public static getValidConfig(config: GameConfig): GameConfig {
    if (!config) {
      return this._DEFAULT_GAME_CONFIG;
    }
    return this.getGameConfigWithValidValues(config);
  }

  private static getGameConfigWithValidValues(config: GameConfig): GameConfig {
    config.playersRequired = this.getValidRequiredPlayers(config.playersRequired);
    config.roomType = this.getValidRoomType(config.roomType);
    config.startWaitingTime = this.getValidStartWaitingTime(config.startWaitingTime);
    config.settings = this.getValidSettings(config.settings);
    config.turnsSwitch = this.getValidTurnsSwitch(config.turnsSwitch);
    config.turnsRandomStart = this.getValidTurnsRandomStart(config.turnsRandomStart, config.turnsSwitch);
    config.teams = TeamsConfigValidator.getValidConfig(config.playersRequired, config.teams);
    return JSON.parse(JSON.stringify(config));
  }

  private static getValidSettings(settings: any): {} {
    return ValidTypes.typeOfObject(settings) && Object.keys(settings).length ? settings : undefined;
  }

  private static getValidRoomType(value: string): string {
    const roomType = value ? value.trim() : undefined;
    return ValidTypes.validString(roomType) ? roomType : this._DEFAULT_GAME_CONFIG.roomType;
  }

  private static getValidStartWaitingTime(value: number): number {
    return ValidTypes.typeOfNumber(value) ? ValidTypes.positiveInteger(value) : this._DEFAULT_GAME_CONFIG.startWaitingTime;
  }

  private static getValidRequiredPlayers(value: number): number {
    const playersAllowed = ValidTypes.typeOfNumber(value) ? ValidTypes.positiveInteger(value) : 0;
    return playersAllowed > 1 ? playersAllowed : this._DEFAULT_GAME_CONFIG.playersAllowed;
  }

  private static getValidTurnsSwitch(value: TurnsSwitch): TurnsSwitch {
    const allowedValues: string[] = Object.values(TurnsSwitch);
    return allowedValues.includes(value) ? value : undefined;
  }

  private static getValidTurnsRandomStart(value: boolean, turnsSwitch: TurnsSwitch) {
    if (!turnsSwitch) {
      return undefined;
    }
    return (typeof value !== "boolean") ? true : !!value;
  }

}
