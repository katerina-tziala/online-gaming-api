import { ErrorType } from "../error-type.enum";

export interface Validation {
  type: string;
  value: any;
  errorType?: ErrorType;
}
