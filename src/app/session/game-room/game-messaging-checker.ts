import { GameInfo, GameRoomInfo, GameState } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { Chat } from "../../chat.interface";
import { ChatValidator, validObject } from "../../validators/validators";

export class GameMessagingChecker {
  private static playersJoinedError(gameState: GameRoomInfo): ErrorType {
    return !gameState.filled ? ErrorType.WaitForPlayers : undefined;
  }

  private static gameStartError(gameState: GameState): ErrorType {
    return !gameState.startedAt ? ErrorType.GameStart : undefined;
  }
  private static gameEndedError(gameState: GameState): ErrorType {
    return gameState.endedAt ? ErrorType.GameOver : undefined;
  }

  private static gameUpdateBasedOnStateError(gameInfo: GameInfo): ErrorType {
    return (
      GameMessagingChecker.playersJoinedError(gameInfo) ||
      GameMessagingChecker.gameStartError(gameInfo.gameState) ||
      GameMessagingChecker.gameEndedError(gameInfo.gameState)
    );
  }

  private static updateDataErrorType(data: {}): ErrorType {
    return !validObject(data) ? ErrorType.UpdateData : undefined;
  }

  public static gameChatError(gameState: GameRoomInfo, data: Chat): ErrorType {
    return ChatValidator.chatErrorType(data) || GameMessagingChecker.playersJoinedError(gameState);
  }

  public static gameUpdateError(gameInfo: GameInfo, data: {}): ErrorType {
    return GameMessagingChecker.updateDataErrorType(data) || GameMessagingChecker.gameUpdateBasedOnStateError(gameInfo);
  }

  public static gameOverError(gameInfo: GameInfo): ErrorType {
    return (
      GameMessagingChecker.playersJoinedError(gameInfo) ||
      GameMessagingChecker.gameStartError(gameInfo.gameState)
    );
  }

}
