import { Chat } from '../chat.interface';
import { ErrorType } from '../error-type.enum';
import { Validation } from './validation-interface';

export class ChatValidator {

    private static getValidationResult(value: Chat, errorType?: ErrorType): Validation {
      return {
        type: 'Chat interface',
        value,
        errorType
      }
    }

    public static validate(chatData: Chat): Validation {
      const { recipientId, content } = chatData;
      if (!recipientId || !recipientId.toString().length) {
        return this.getValidationResult(chatData,  ErrorType.RecipientNotDefined);
      } else if (!content) {
        return this.getValidationResult(chatData,  ErrorType.ChatContentNotDefined);
      }
     return this.getValidationResult(chatData);
    }

}
