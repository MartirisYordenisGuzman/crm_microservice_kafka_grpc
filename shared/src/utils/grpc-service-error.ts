import { Metadata, ServiceError, status } from "@grpc/grpc-js";
import { DuplicateRecordError } from "../errors/duplicate-record-error";
import { NotFoundError } from "../errors/not-found-error";
import { AuthError } from "../errors/auth-error";
import { DatabaseError } from "../errors/database-error";
import { BaseAppException } from "../errors/base-app-exception";
import { HttpStatus } from "./http-status";
import { ForeignKeyViolationError } from "../errors/foreign-key-violation-error";

export const grpcServiceError = (code: status, message: string, details: string): ServiceError => {
  return {
    name: "ServiceError",
    message,
    code,
    details: details,
    metadata: new Metadata(),
  };
};

export const toServiceError = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (error instanceof DuplicateRecordError)
    return grpcServiceError(status.ALREADY_EXISTS, errorMessage, HttpStatus.CONFLICT.description);
  if (error instanceof ForeignKeyViolationError)
    return grpcServiceError(
      status.FAILED_PRECONDITION,
      errorMessage,
      HttpStatus.CONFLICT.description,
    );
  if (error instanceof NotFoundError)
    return grpcServiceError(status.NOT_FOUND, errorMessage, HttpStatus.NOT_FOUND.description);
  if (error instanceof AuthError)
    return grpcServiceError(
      status.PERMISSION_DENIED,
      errorMessage,
      HttpStatus.FORBIDDEN.description,
    );
  if (error instanceof DatabaseError)
    return grpcServiceError(
      status.INTERNAL,
      errorMessage,
      HttpStatus.INTERNAL_SERVER_ERROR.description,
    );
  if (error instanceof BaseAppException)
    return grpcServiceError(
      status.INTERNAL,
      errorMessage,
      HttpStatus.INTERNAL_SERVER_ERROR.description,
    );

  return grpcServiceError(
    status.INTERNAL,
    errorMessage,
    HttpStatus.INTERNAL_SERVER_ERROR.description,
  );
};
