

import { ValidTypes } from "../../../validators/validators";
import { GameConfig } from "./game-config.inteface";
import { TurnsSwitchType } from "../../../game/turns/turns-switch.enum";
export class GameConfigValidator {
  private static _DEFAULT_GAME_CONFIG = {
    playersAllowed: 2,
    roomType: "default",
    startWaitingTime: 3000
  };


  public static getValidGameConfig(config: GameConfig): GameConfig {
    if (!config) {
      return this._DEFAULT_GAME_CONFIG;
    }
    return this.getGameConfigWithValidValues(config);
  }

  private static getGameConfigWithValidValues(config: GameConfig): GameConfig {
    config.playersAllowed = this.getValidPlayersAllowed(config.playersAllowed);
    config.roomType = this.getValidRoomType(config.roomType);
    config.startWaitingTime = this.getValidStartWaitingTime(config.startWaitingTime);
    config.settings = this.getValidSettings(config.settings);
    config.turnsSwitch = this.getValidTurnsSwitch(config.turnsSwitch);
    config.turnsRandomStart = this.getValidTurnsRandomStart(config.turnsRandomStart, config.turnsSwitch);
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
    return value ? ValidTypes.positiveInteger(value) : this._DEFAULT_GAME_CONFIG.startWaitingTime;
  }

  private static getValidPlayersAllowed(value: number): number {
    const playersAllowed = value ? ValidTypes.positiveInteger(value) : 0;
    return playersAllowed > 1 ? playersAllowed : this._DEFAULT_GAME_CONFIG.playersAllowed;
  }

  private static getValidTurnsSwitch(value: TurnsSwitchType): TurnsSwitchType {
    const allowedValues: string[] = Object.values(TurnsSwitchType);
    return allowedValues.includes(value) ? value : undefined;
  }


  private static getValidTurnsRandomStart(value: boolean, turnsSwitch: TurnsSwitchType) {
    if (!turnsSwitch) {
      return undefined;
    }
    return (typeof value !== "boolean") ? true : !!value;
  }

}
