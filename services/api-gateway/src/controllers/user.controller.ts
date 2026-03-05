import { NextFunction, Request, Response } from "express";
import { HttpStatus, ResponseTemplate, Roles, UserServiceClient } from "shared";

type UserIdParams = {
  id: string;
};

type UserEmailParams = {
  email: string;
};

type GatewayUpdateUserBody = {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roles: Roles[];
};

export class UserController {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  private updateGatewayUser(id: string, request: GatewayUpdateUserBody) {
    const updateUser = this.userService.updateUser as (
      userId: string,
      payload: GatewayUpdateUserBody,
    ) => ReturnType<UserServiceClient["updateUser"]>;

    return updateUser.call(this.userService, id, request);
  }

  async getUser(req: Request<UserIdParams>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUser(userId);

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          user,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getUserByEmail(
    req: Request<UserEmailParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userEmail = req.params.email;
      const user = await this.userService.getUserByEmail(userEmail);

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          user,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateUser(
    req: Request<UserIdParams, unknown, GatewayUpdateUserBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.params.id;
      const { firstName, lastName, isActive, roles } = req.body;
      const updateRequest: GatewayUpdateUserBody = {
        roles,
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      };
      const updatedUser = await this.updateGatewayUser(userId, updateRequest);

      res
        .status(HttpStatus.OK.code)
        .send(
          new ResponseTemplate(
            HttpStatus.OK.code,
            HttpStatus.OK.status,
            HttpStatus.OK.description,
            { updatedUser },
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request<UserIdParams>, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const isDeleted = await this.userService.deleteUser(userId);

      res
        .status(HttpStatus.OK.code)
        .send(
          new ResponseTemplate(
            HttpStatus.OK.code,
            HttpStatus.OK.status,
            HttpStatus.OK.description,
            { isDeleted },
          ),
        );
    } catch (error) {
      next(error);
    }
  }
}
