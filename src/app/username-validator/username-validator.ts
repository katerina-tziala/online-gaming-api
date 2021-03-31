import { ErrorType } from '../error-type.enum';
import { Validation } from './validation-interface';

export class UsernameValidator {
    private static usernameValid(username: string): boolean {
      return username.length ? new RegExp(/^(\w{4,})$/).test(username) : false;
    }

    private static getValidationResult(value: any, validationError?: ErrorType): Validation {
      return {
        type: 'string',
        value,
        validationError
      }
    }

    public static validate(value: any): Validation {
      if (!value) {
        return this.getValidationResult(value, ErrorType.UsernameRequired);
      } else if (typeof value !== 'string') {
        return this.getValidationResult(value, ErrorType.UsernameString);
      }
      return this.validateString(value);
    }

    public static validateString(username: string): Validation {
      const value = username.trim();
      const validationError = !this.usernameValid(value) ? ErrorType.UsernameInvalid : undefined;
      return this.getValidationResult(value, validationError);
    }

}
