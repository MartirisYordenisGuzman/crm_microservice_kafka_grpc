import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../repository/IUserRepository";
import {
  AuthError,
  ICacheService,
  // IRepository,
  // UserCreatedEvent,
  // UserUpdatedEvent,
} from "shared";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { User } from "../entities/user.entity";
import bcrypt from "bcryptjs";
// import { randomUUID } from "crypto";
import { UserRepository } from "../repository/user.repository.impl";

@injectable()
export class UserService {
  constructor(
    @inject("UserRepository") private userRepository: UserRepository,
    @inject("CacheService") private cacheService: ICacheService,
    // @inject("KafkaMessagingService") private messagingService: IMessagingService,
  ) { }

  async CreateUser(userData: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    } as User);

    // Non-blocking cache and Kafka operations
    this.cacheService
      .set(`user_${user.id}`, JSON.stringify(user), 3600)
      .then(() => console.log("✅ User cached successfully"))
      .catch((error) => console.warn("⚠️ Cache set failed:", error.message));

    // // Non-blocking Kafka
    // const event: UserCreatedEvent = {
    //     id: randomUUID(),
    //     type: 'user.created',
    //     timestamp: new Date(),
    //     version: '1.0',
    //     data: {
    //         userId: user.id,
    //         email: user.email,
    //         firstName: user.firstName,
    //         lastName: user.lastName,
    //     },
    // };
    // this.messagingService.publish('user.events', event)
    //     .then(() => console.log('✅ User created event published'))
    //     .catch(error => console.warn('⚠️ Kafka publish failed:', error.message));

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const cachedUser = await this.cacheService.get<User>(`user:${id}`).catch(() => null);

    if (cachedUser) {
      console.log("✅ User retrieved from cache");
      return cachedUser;
    }

    const user = await this.userRepository.findById(id);
    if (user) {
      this.cacheService
        .set(`user:${user.id}`, user, 3600)
        .catch((error) => console.warn("⚠️ Background cache set failed:", error.message));
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const cachedUser = await this.cacheService.get<User>(`user:${email}`).catch(() => null);

    if (cachedUser) {
      console.log("User retrieved from cache");
      return cachedUser;
    }

    const user = await this.userRepository.findByEmail(email);
    if (user) {
      this.cacheService
        .set(`user:${user.email}`, user, 3600)
        .catch((error) => console.log("Background cache set failed", error.message));
    }

    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    const isValid = await bcrypt.compare(password, user.password);

    if (!user.isActive) throw new AuthError("User Inactive");
    if (!isValid) throw new AuthError("Invalid password");
    return user;
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.update(id, userData);
    if (user) {
      this.cacheService
        .set(`user:${user.id}`, user, 3600)
        .catch((error) => console.warn("⚠️ Background cache update failed:", error.message));

      // Non-blocking Kafka
      // const event: UserUpdatedEvent = {
      //     id: randomUUID(),
      //     type: 'user.updated',
      //     timestamp: new Date(),
      //     version: '1.0',
      //     data: {
      //         userId: user.id,
      //         changes: userData,
      //     },
      // };
      // this.messagingService.publish('user.events', event)
      //     .catch(error => console.warn('⚠️ Background Kafka publish failed:', error.message));
    }

    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const success = await this.userRepository.delete(id);
    if (success) {
      this.cacheService
        .delete(`user:${id}`)
        .catch((error) => console.warn("⚠️ Background cache delete failed:", error.message));
    }
    return success;
  }

  async getUsers(
    page: number,
    limit: number,
  ): Promise<{
    items: User[];
    total: number;
  }> {
    const cachedUsers = await this.cacheService
      .get<User[]>(`users:${page}:${limit}`)
      .catch(() => null);

    if (cachedUsers) {
      console.log("Users retrieved from cache");
      return {
        items: cachedUsers,
        total: cachedUsers.length,
      };
    }
    return this.userRepository.findAll(page, limit);
  }
}
