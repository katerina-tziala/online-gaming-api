import { ErrorType } from '../../error-type.enum';
import { Chat } from '../../chat.interface';
import { ChatValidator, ValidTypes } from '../../validators/validators';

export class GameMessagingChecker {

  public static dataValid(data: {}): boolean {
    return ValidTypes.typeOfObject(data) && Object.keys(data).length ? true : false;
  }

  public static gameChatError(data: Chat): ErrorType {
    return ChatValidator.chatErrorType(data);
  }

}
