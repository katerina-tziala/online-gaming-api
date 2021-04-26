import { ErrorType } from '../error-type.enum';
import { Validation } from './validation-interface';

export class UsernameValidator {
    private static usernameValid(username: string): boolean {
      return username.length ? new RegExp(/([0-9_-]*[a-z][0-9_-]*){3}/igm).test(username) : false;
    }

    public static getValidationResult(value: any, errorType?: ErrorType): Validation {
      return {
        type: 'string',
        value,
        errorType
      }
    }

    public static validate(value: any, forbiddenValues: string[] = []): Validation {
      if (!value) {
        return this.getValidationResult(value, ErrorType.UsernameRequired);
      } else if (typeof value !== 'string') {
        return this.getValidationResult(value, ErrorType.UsernameString);
      }
      return this.validateUsername(value, forbiddenValues);
    }

    public static validateUsername(username: string, forbiddenValues: string[]): Validation {
      const value = username.trim();
      let validationError = !this.usernameValid(value) ? ErrorType.UsernameInvalid : undefined;
      if (!validationError) {
        validationError = forbiddenValues.includes(username) ? ErrorType.UsernameInUse : undefined;
      }
      return this.getValidationResult(value, validationError);
    }

}
