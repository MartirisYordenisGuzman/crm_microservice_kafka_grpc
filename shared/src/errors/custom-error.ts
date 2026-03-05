export abstract class CustomError extends Error {
  public statusCode: number;
  public status: string;
  public message: string;

  constructor(statusCode: number, status: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.message = message;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
