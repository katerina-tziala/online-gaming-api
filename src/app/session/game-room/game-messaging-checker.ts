import { GameInfo } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import { Chat } from "../../chat.interface";
import { ChatValidator, validObject } from "../../validators/validators";

export class GameMessagingChecker {
  private static playersJoinedError(gameState: GameInfo): ErrorType {
    return !gameState.filled ? ErrorType.WaitForPlayers : undefined;
  }

  private static gameStartError(gameState: GameInfo): ErrorType {
    return !gameState.startedAt ? ErrorType.GameStart : undefined;
  }
  private static gameEndedError(gameState: GameInfo): ErrorType {
    return gameState.endedAt ? ErrorType.GameOver : undefined;
  }

  private static gameUpdateBasedOnStateError(gameState: GameInfo): ErrorType {
    return (
      GameMessagingChecker.playersJoinedError(gameState) ||
      GameMessagingChecker.gameStartError(gameState) ||
      GameMessagingChecker.gameEndedError(gameState)
    );
  }

  private static updateDataErrorType(data: {}): ErrorType {
    return !validObject(data) ? ErrorType.UpdateData : undefined;
  }

  public static gameChatError(gameState: GameInfo, data: Chat): ErrorType {
    return ChatValidator.chatErrorType(data) || GameMessagingChecker.playersJoinedError(gameState);
  }

  public static gameUpdateError(gameState: GameInfo, data: {}): ErrorType {
    return GameMessagingChecker.updateDataErrorType(data) || GameMessagingChecker.gameUpdateBasedOnStateError(gameState);
  }

  public static gameOverError(gameState: GameInfo): ErrorType {
    return (
      GameMessagingChecker.playersJoinedError(gameState) ||
      GameMessagingChecker.gameStartError(gameState)
    );
  }

}
