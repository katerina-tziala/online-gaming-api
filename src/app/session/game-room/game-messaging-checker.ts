import { Client } from "../../client/client";
import { getDurationFromDates, randomFromArray } from "../../../utils/utils";
import { Duration } from "../../duration.interface";
import { Session } from "../session";
import { ConfigUtils, GameConfig } from "./game-config/game-config";
import { GameInfo, PlayerInOut } from "./game.interfaces";
import { ErrorType } from "../../error-type.enum";
import {
  MessageInType,
  MessageOutType,
} from "../../messages/message-types/message-types.enum";
import { MessageIn } from "../../messages/message.interface";
import { Chat } from "../../chat.interface";
import { ChatValidator } from "../../validators/validators";

export class GameMessagingChecker {
  private static playersJoinedError(gameState: GameInfo): ErrorType {
    return !gameState.filled ? ErrorType.WaitForPlayers : undefined;
  }

  private static gameStartError(gameState: GameInfo): ErrorType {
    return !gameState.startedAt ? ErrorType.GameStart : undefined;
  }
  private static gameOverError(gameState: GameInfo): ErrorType {
    return gameState.endedAt ? ErrorType.GameOver : undefined;
  }

  private static gameUpdateBasedOnStateError(gameState: GameInfo): ErrorType {
    return (
      GameMessagingChecker.gameStartError(gameState) ||
      GameMessagingChecker.gameOverError(gameState) ||
      GameMessagingChecker.playersJoinedError(gameState)
    );
  }

  public static gameChatError(gameState: GameInfo, data: Chat): ErrorType {
    return ChatValidator.chatErrorType(data) || GameMessagingChecker.playersJoinedError(gameState);
  }

  public static gameUpdateError(gameState: GameInfo, data: {}): ErrorType {
    // const dataObject =
    if (!data) {
      return ErrorType.UpdateData;
    }
    return GameMessagingChecker.gameUpdateBasedOnStateError(gameState);
  }

}
