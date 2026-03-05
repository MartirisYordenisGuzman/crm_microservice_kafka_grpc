import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "http";
import jwt from "jsonwebtoken";
import {
  AuthedUser,
  AuthError,
  CreateUserRequest,
  HttpStatus,
  ResponseTemplate,
  UserServiceClient,
  ValidateUserRequest,
  ValidateUserResponse,
  config,
} from "shared";

export class AuthController {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  async register(
    req: Request<Record<string, never>, unknown, CreateUserRequest>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, firstName, lastName, password, roles } = req.body;
      const user = await this.userService.createUser({
        email,
        firstName,
        lastName,
        password,
        roles,
      });
      res.status(HttpStatus.CREATED.code).send(
        new ResponseTemplate(
          HttpStatus.CREATED.code,
          HttpStatus.CREATED.status,
          HttpStatus.CREATED.description,
          {
            user,
          },
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async login(
    req: Request<Record<string, never>, unknown, ValidateUserRequest>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const response: ValidateUserResponse = await this.userService.validateUser({
        email,
        password,
      });

      if (!response.valid || !response.user) {
        throw new AuthError("Unauthenticated");
      }

      const token = jwt.sign(
        {
          sub: response.user.id,
          roles: response.user.roles,
        } as AuthedUser,
        config.jwtSecret,
        {
          expiresIn: config.jwtExpiresIn,
        },
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 3600000,
      });

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          token,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}
