import { validObject } from "../../../validators/validators";
import { GameConfig } from "./game-config.inteface";
import { SettingsType } from "./settings-type";

const DEFAULT_GAME_CONFIG = {
  playersAllowed: 2,
  roomType: "default",
  startWaitingTime: 3000
};

export function getValidRoomType(value: any): string {
  if (typeof value !== "string") {
    return DEFAULT_GAME_CONFIG.roomType;
  }
  const roomType = value.trim();
  return roomType.length ? roomType : DEFAULT_GAME_CONFIG.roomType;
}

export function getValidPlayersAllowed(value: any): number {
  if (typeof value !== "number") {
    return DEFAULT_GAME_CONFIG.playersAllowed;
  }
  const playersAllowed = Math.abs(parseInt(value.toString(), 10));
  return playersAllowed > 1 ? playersAllowed : DEFAULT_GAME_CONFIG.playersAllowed;
}

export function getValidStartWaitingTime(value: any): number {
  if (typeof value !== "number") {
    return DEFAULT_GAME_CONFIG.startWaitingTime;
  }
  return Math.abs(parseInt(value.toString(), 10));
}

export function getGameConfigWithValidValues(config: GameConfig): GameConfig {
  config.playersAllowed = config.playersAllowed || 2;
  config.roomType = getValidRoomType(config.roomType);
  config.startWaitingTime = getValidStartWaitingTime(config.startWaitingTime);
  config.settings = validObject(config.settings) ? config.settings : undefined;
  return config;
}

export function getValidGameConfig(config: GameConfig): GameConfig {
  if (!config) {
    return DEFAULT_GAME_CONFIG;
  }
  return getGameConfigWithValidValues(config);
}

export function generateGameKey(config: GameConfig): string {
  const settingsType = config.settings ? SettingsType.Settings : SettingsType.NoSettings;
  return `${config.roomType}-${config.playersAllowed}-${config.startWaitingTime}-${settingsType}`;
}
