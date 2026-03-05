import { config } from "../config/config";
import { Roles } from "../utils/auth-grpc";
import { GrpcService } from "../utils/grpc-service";

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: Roles[];
}

export interface GetUserByEmailRequest {
  email: string;
}

export interface ValidateUserRequest {
  email: string;
  password: string;
}

export interface ValidateUserResponse {
  valid: boolean;
  user?: UserResponse;
}

export interface GetUserRequest {
  id: string;
}

export interface UpdateUserRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roles: Roles[];
}

export interface DeleteUserRequest {
  id: string;
}

export interface DeleteUserResponse {
  success: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: Roles[];
  createdAt: string;
  updatedAt: string;
}

export class UserServiceClient {
  private grpcService: GrpcService;

  constructor() {
    this.grpcService = new GrpcService(
      "UserService",
      "User",
      "/app/shared/proto/user.proto",
      config.services.user.host,
      config.services.user.port,
    );
  }

  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    return this.grpcService.call<UserResponse>("CreateUser", request);
  }

  async validateUser(request: ValidateUserRequest): Promise<ValidateUserResponse> {
    return this.grpcService.call<ValidateUserResponse>("ValidateUser", request);
  }

  async getUser(id: string): Promise<UserResponse> {
    return this.grpcService.call<UserResponse>("GetUser", { id });
  }

  async getUserByEmail(email: string): Promise<UserResponse> {
    return this.grpcService.call<UserResponse>("GetUserByEmail", { email });
  }

  async updateUser(id: string, request: Omit<UpdateUserRequest, "id">): Promise<UserResponse> {
    return this.grpcService.call<UserResponse>("UpdateUser", { id, ...request });
  }

  async deleteUser(id: string): Promise<void> {
    return this.grpcService.call<void>("DeleteUser", { id });
  }
}
