import { HttpStatus } from "../utils/http-status";
import { CustomError } from "./custom-error";

export class BaseAppException extends CustomError {
  constructor(message = "Application error") {
    super(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, message);
  }
}
