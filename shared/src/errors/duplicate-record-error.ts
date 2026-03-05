import { HttpStatus } from "../utils/http-status";
import { CustomError } from "./custom-error";

export class DuplicateRecordError extends CustomError {
  constructor(message = "Duplicate record") {
    super(HttpStatus.CONFLICT.code, HttpStatus.CONFLICT.status, message);
  }
}
