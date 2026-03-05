import { HttpStatus } from "../utils/http-status";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  constructor(details: string) {
    super(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, details);
  }
}
