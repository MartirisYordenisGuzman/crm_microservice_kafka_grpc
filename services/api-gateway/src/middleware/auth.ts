import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { AuthedUser, AuthError, config, Roles, UserResponse } from "shared";

declare global {
  namespace Express {
    interface Request {
      token?: string;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  _: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);

  try {
    if (!token) {
      new AuthError("Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthedUser;

    if (typeof decoded !== "object" || !("sub" in decoded) || !("roles" in decoded)) {
      throw new AuthError("Invalid token structure");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles: Roles[]): RequestHandler => {
  return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    if (!req.token) throw new AuthError("Unauthorized");
    const decoded = jwt.verify(req.token, config.jwtSecret) as AuthedUser;

    const shouldAllowReq = roles.some((role) => decoded.roles.includes(role));
    if (!shouldAllowReq) throw new AuthError("Insufficient permissions");
    next();
  };
};
