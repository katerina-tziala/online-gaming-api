import { ErrorType } from '../error-type.enum';
import * as MessageTypes from './message-types/message-types';

export interface MessageIn {
  type: MessageTypes.MessageInType;
  data?: any;
}

export interface MessageOut {
  type: MessageTypes.MessageOutType;
  data?: any;
}

export interface ErrorMessage {
  type: MessageTypes.MessageOutType;
  errorType: ErrorType
  data?: any;
}
