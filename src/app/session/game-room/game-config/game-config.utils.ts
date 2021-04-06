import { GameConfig } from "./game-config.inteface";
import { GameConfigValidator } from "./game-config.validator";
import { SettingsType } from "./settings-type";


export function getValidGameConfig(config: GameConfig): GameConfig {
  return GameConfigValidator.getValidGameConfig(config);
}

export function generateGameKey(config: GameConfig): string {
  const settingsType = config.settings ? SettingsType.Settings : SettingsType.NoSettings;
  return `${config.roomType}-${config.playersAllowed}-${config.startWaitingTime}-${settingsType}`;
}
