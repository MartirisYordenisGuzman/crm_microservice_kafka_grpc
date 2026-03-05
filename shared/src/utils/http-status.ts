export const HttpStatus = {
  OK: {
    code: 200,
    status: "OK",
    description: "The request was successful",
  },
  CREATED: {
    code: 201,
    status: "CREATED",
    description: "A new resource has been successfully created",
  },
  NOT_CONTENT: {
    code: 204,
    status: "NOT_CONTENT",
    description: "The request was successful, but there is not content to return",
  },
  BAD_REQUEST: {
    code: 400,
    status: "BAD_REQUEST",
    description: "The server cannot process the request due to client error",
  },
  NOT_FOUND: {
    code: 404,
    status: "NOT_FOUND",
    description: "The requested resource was not found in the server",
  },
  FORBIDDEN: {
    code: 403,
    status: "FORBIDDEN",
    description: "Insufficient permissions",
  },
  CONFLICT: {
    code: 409,
    status: "CONFLICT",
    description: "An error has happend when creating the resource",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    status: "INTERNAL_SERVER_ERROR",
    description: "An unexpected error occurred on the server",
  },
};
