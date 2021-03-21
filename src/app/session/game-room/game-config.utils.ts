import { GameConfig } from "./game-config.intefrace";
import { TYPOGRAPHY } from "../../utilities/constants/typography.constants";

export function getValidGameConfig(config: GameConfig): GameConfig {
  config.playersAllowed = config.playersAllowed || 2;
  config.roomType = config.roomType || "default";
  config.startWaitingTime = config.startWaitingTime || 3000;
  return config;
}

export function generateGameKey(config: GameConfig): string {
  return `${config.roomType}${TYPOGRAPHY.HYPHEN}${config.playersAllowed}${TYPOGRAPHY.HYPHEN}${config.startWaitingTime}`;
}
