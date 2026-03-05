import { HttpStatus } from "../utils/http-status";
import { CustomError } from "./custom-error";

export class AuthError extends CustomError {
  constructor(message = "Authentication error") {
    super(HttpStatus.FORBIDDEN.code, HttpStatus.FORBIDDEN.status, message);
  }
}
