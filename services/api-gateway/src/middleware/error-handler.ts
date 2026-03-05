import { Request, Response, NextFunction } from "express";
import {
  CustomError,
  DatabaseError,
  DuplicateRecordError,
  ForeignKeyViolationError,
  HttpStatus,
  ResponseTemplate,
} from "shared";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _: NextFunction,
): Response<unknown, Record<string, unknown>> | void => {
  if (error instanceof CustomError) {
    return res
      .status(error.statusCode)
      .send(new ResponseTemplate(error.statusCode, error.status, error.message));
  }

  return res
    .status(HttpStatus.INTERNAL_SERVER_ERROR.code)
    .send(
      new ResponseTemplate(
        HttpStatus.INTERNAL_SERVER_ERROR.code,
        HttpStatus.INTERNAL_SERVER_ERROR.status,
        HttpStatus.INTERNAL_SERVER_ERROR.description,
      ),
    );
};
