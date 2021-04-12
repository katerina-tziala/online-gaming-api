import { Chat } from '../chat.interface';
import { ErrorType } from '../error-type.enum';
import { typeOfObject } from './validator-type';

export class ChatValidator {
  private static chatDatatErrorType(data: Chat): ErrorType {
    return !typeOfObject(data) ? ErrorType.ChatDataObject : undefined;
  }

  private static chatContentErrorType(data: Chat): ErrorType {
    return !data.content ? ErrorType.ChatContentNotDefined : undefined;
  }

  private static chatRecipientErrorType(data: Chat): ErrorType {
    const { recipientId } = data;
    return !recipientId || !recipientId.toString().length
      ? ErrorType.ChatRecipientNotDefined
      : undefined;
  }

  public static privateChatErrorType(data: Chat): ErrorType {
    return (
      ChatValidator.chatDatatErrorType(data) ||
      ChatValidator.chatRecipientErrorType(data) ||
      ChatValidator.chatContentErrorType(data)
    );
  }

  public static chatErrorType(data: Chat): ErrorType {
    return (
      ChatValidator.chatDatatErrorType(data) ||
      ChatValidator.chatContentErrorType(data)
    );
  }

}
