import { GameConfig, TeamsConfig } from "./game-config.inteface";
import { GameConfigValidator } from "./game-config-validators/game-config.validator";

export function getValidGameConfig(config: GameConfig): GameConfig {
  return GameConfigValidator.getValidConfig(config);
}

export function generateGameKey(config: GameConfig): string {
  const { roomType, startWaitingTime, playersRequired } = config;
  const turnsKey = getTurnsKey(config);
  const teamsKey = getTeamsKey(config.teams);

  let gameKey = `${roomType}|${startWaitingTime}|${playersRequired}|${turnsKey}|${teamsKey}`;
  if (config.settings) {
    gameKey += "|cs";
  }
  return gameKey;
}

function getTurnsKey(config: GameConfig): string {
  if (!config.turnsSwitch) {
    return "turns-none";
  }
  const turnsRandomStart = config.turnsRandomStart ? "random" : "first";
  return `turns-${config.turnsSwitch}-${turnsRandomStart}`;
}

function getTeamsKey(config: TeamsConfig): string{
  if (!config) {
   return "teams-none";
  }
  const { numberOfTeams, playersPerTeam, joinTeams } = config;
  return `teams-${numberOfTeams}-${playersPerTeam}-${joinTeams}`;
}
