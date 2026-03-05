import { injectable } from "tsyringe";
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserService } from "../service/user.service";
import { User } from "../entities/user.entity";
import {
  CreateUserRequest,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserByEmailRequest,
  GetUserRequest,
  mapGrpcResponse,
  toServiceError,
  UpdateUserRequest,
  UserResponse,
  ValidateUserRequest,
  ValidateUserResponse,
} from "shared/dist";

@injectable()
export class UserController {
  constructor(private readonly userService: UserService) { }

  async CreateUser(
    call: ServerUnaryCall<CreateUserRequest, UserResponse>,
    callback: sendUnaryData<UserResponse>,
  ): Promise<void> {
    try {
      const createdUser: User = await this.userService.CreateUser({
        firstName: call.request.firstName,
        lastName: call.request.lastName,
        email: call.request.email,
        password: call.request.password,
        roles: call.request.roles,
      } as CreateUserDto);

      const userResponse: UserResponse = this.mapUserResponse(createdUser);
      callback(null, mapGrpcResponse(userResponse));
    } catch (error) {
      callback(toServiceError(error));
    }
  }

  async GetUser(
    call: ServerUnaryCall<GetUserRequest, UserResponse>,
    callback: sendUnaryData<UserResponse>,
  ): Promise<void> {
    try {
      const user = await this.userService.getUserById(call.request.id);
      const userResponse: UserResponse = this.mapUserResponse(user);
      callback(null, mapGrpcResponse(userResponse));
    } catch (error) {
      callback(toServiceError(error));
    }
  }

  async GetUserByEmail(
    call: ServerUnaryCall<GetUserByEmailRequest, UserResponse>,
    callback: sendUnaryData<UserResponse>,
  ): Promise<void> {
    try {
      const user = await this.userService.getUserByEmail(call.request.email);
      const userResponse: UserResponse = this.mapUserResponse(user);
      callback(null, mapGrpcResponse(userResponse));
    } catch (error) {
      callback(toServiceError(error));
    }
  }
  async ValidateUser(
    call: ServerUnaryCall<ValidateUserRequest, ValidateUserResponse>,
    callback: sendUnaryData<ValidateUserResponse>,
  ): Promise<void> {
    try {
      const user = await this.userService.validateUser(call.request.email, call.request.password);
      const userResponse = this.mapUserResponse(user);
      const validResponse: ValidateUserResponse = {
        valid: true,
        user: userResponse,
      };

      callback(null, mapGrpcResponse(validResponse));
    } catch (error) {
      callback(toServiceError(error));
    }
  }

  async UpdateUser(
    call: ServerUnaryCall<UpdateUserRequest, UserResponse>,
    callback: sendUnaryData<UserResponse>,
  ): Promise<void> {
    try {
      const user = await this.userService.updateUser(call.request.id, {
        firstName: call.request.firstName,
        lastName: call.request.lastName,
        isActive: call.request.isActive,
      } as UpdateUserDto);
      const userResponse: UserResponse = this.mapUserResponse(user);

      callback(null, mapGrpcResponse(userResponse));
    } catch (error) {
      callback(toServiceError(error));
    }
  }

  async DeleteUser(
    call: ServerUnaryCall<DeleteUserRequest, DeleteUserResponse>,
    callback: sendUnaryData<DeleteUserResponse>,
  ): Promise<void> {
    try {
      const result = await this.userService.deleteUser(call.request.id);
      callback(null, { success: result } as DeleteUserResponse);
    } catch (error) {
      callback(toServiceError(error));
    }
  }

  private mapUserResponse(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt.toString(),
      updatedAt: user.updatedAt.toString(),
    };
  }
}
