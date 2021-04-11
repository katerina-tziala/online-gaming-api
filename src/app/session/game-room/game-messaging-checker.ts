import { GameInfo, GameRoomInfo, GameState } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { Chat } from "../../chat.interface";
import { ChatValidator, ValidTypes } from "../../validators/validators";

export class GameMessagingChecker {
  private static playersJoinedError(gameState: GameRoomInfo): ErrorType {
    return !gameState.allPlayersJoined ? ErrorType.WaitForPlayers : undefined;
  }

  private static gameStartError(gameState: GameState): ErrorType {
    return !gameState.startedAt ? ErrorType.GameNotStarted : undefined;
  }
  private static gameEndedError(gameState: GameState): ErrorType {
    return gameState.endedAt ? ErrorType.GameOver : undefined;
  }

  public static updateDataErrorType(data: {}): ErrorType {
    return ValidTypes.typeOfObject(data) && Object.keys(data).length ? undefined : ErrorType.DataRequired;
  }

  public static gameUpdateBasedOnStateError(gameInfo: GameInfo): ErrorType {
    return (
      GameMessagingChecker.playersJoinedError(gameInfo) ||
      GameMessagingChecker.gameStartError(gameInfo.gameState) ||
      GameMessagingChecker.gameEndedError(gameInfo.gameState)
    );
  }

  public static gameRestartError(gameInfo: GameInfo): ErrorType {
    return (
      GameMessagingChecker.playersJoinedError(gameInfo) ||
      GameMessagingChecker.gameStartError(gameInfo.gameState)
    );
  }

  public static gameChatError(gameInfo: GameRoomInfo, data: Chat): ErrorType {
    return (
      ChatValidator.chatErrorType(data) ||
      GameMessagingChecker.playersJoinedError(gameInfo)
    );
  }

  public static gameUpdateError(gameInfo: GameInfo, playerOnTurn: boolean, data: {}): ErrorType {
    return (
      GameMessagingChecker.updateDataErrorType(data) ||
      GameMessagingChecker.gameUpdateBasedOnStateError(gameInfo) ||
      GameMessagingChecker.turnError(playerOnTurn)
    );
  }

  public static turnsSwitchError(playerOnTurn: boolean, gameInfo: GameInfo): ErrorType {
    return (
      GameMessagingChecker.gameUpdateBasedOnStateError(gameInfo) ||
      GameMessagingChecker.turnError(playerOnTurn)
    );
  }

  private static turnError(playerOnTurn: boolean): ErrorType {
    return playerOnTurn ? ErrorType.PlayerOnTurn : undefined;
  }

}
