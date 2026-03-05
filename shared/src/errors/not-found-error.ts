import { HttpStatus } from "../utils/http-status";
import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  constructor(resource: string = "Resource") {
    super(HttpStatus.NOT_FOUND.code, HttpStatus.NOT_FOUND.status, `${resource} not found`);
  }
}
