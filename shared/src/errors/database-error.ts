import { HttpStatus } from "../utils/http-status";
import { CustomError } from "./custom-error";

export class DatabaseError extends CustomError {
  constructor(message = "Database error") {
    super(HttpStatus.INTERNAL_SERVER_ERROR.code, HttpStatus.INTERNAL_SERVER_ERROR.status, message);
  }
}
