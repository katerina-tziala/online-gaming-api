import { GameConfig, TeamsConfig } from "./game-config.inteface";
import { GameConfigValidator } from "./game-config-validators/game-config.validator";

export function getValidGameConfig(config: GameConfig): GameConfig {
  return GameConfigValidator.getValidConfig(config);
}

export function generateGameKey(config: GameConfig): string {
  const { roomType, startWaitingTime, playersRequired } = config;
  const turnsKey = getTurnsKey(config);
  const teamsKey = getTeamsKey(config.teams);
  const restartKey = getRestartKey(config.restartAllowed);

  let gameKey = `${roomType}|${startWaitingTime}|${playersRequired}|${restartKey}|${turnsKey}|${teamsKey}`;
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

function getRestartKey(restartAllowed: boolean): string {
  return restartAllowed ? "ra" : "rf";
}