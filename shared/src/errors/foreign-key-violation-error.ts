import { HttpStatus } from "../utils/http-status";
import { CustomError } from "./custom-error";

export class ForeignKeyViolationError extends CustomError {
  constructor(message = "Foreign key violation") {
    super(HttpStatus.BAD_REQUEST.code, HttpStatus.BAD_REQUEST.status, message);
  }
}
