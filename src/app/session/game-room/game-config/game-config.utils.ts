import { GameConfig } from "./game-config.inteface";
import { GameConfigValidator } from "./game-config.validator";

export function getValidGameConfig(config: GameConfig): GameConfig {
  return GameConfigValidator.getValidGameConfig(config);
}

export function generateGameKey(config: GameConfig): string {
  const { roomType, startWaitingTime, playersAllowed } = config;
  let gameKey = `${roomType}|${startWaitingTime}|${playersAllowed}`;
  const optionalGameKey = optionalSettingsKeyPart(config);
  if (optionalGameKey) {
    gameKey += `|${optionalGameKey}`;
  }
  return gameKey;
}


const optionalSettingsKeyPart = (config: GameConfig): string => {
  const keyParts: string[] = [];

  if (config.turnsSwitch) {
    keyParts.push(config.turnsSwitch);
  }

  if (config.turnsRandomStart) {
    keyParts.push("trs");
  }

  if (config.settings) {
    keyParts.push("cs");
  }

  return keyParts.length ? keyParts.join("|") : undefined;
}
