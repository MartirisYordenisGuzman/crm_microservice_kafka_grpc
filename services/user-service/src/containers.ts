import "reflect-metadata";
import { container } from "tsyringe";
import { ICacheService, IMessagingService, KafkaMessagingService, RedisCacheService } from "shared";
import { UserController } from "./controller/user.controller";
import { UserService } from "./service/user.service";
import { UserRepository } from "./repository/user.repository.impl";
import { AppDataSource } from "./config/database";

export async function registerDependencies(): Promise<void> {
  container.registerInstance<typeof AppDataSource>("AppDataSource", AppDataSource);
  container.registerSingleton<UserRepository>("UserRepository", UserRepository);
  container.registerSingleton<ICacheService>("CacheService", RedisCacheService);
  container.registerSingleton<IMessagingService>("KafkaMessagingService", KafkaMessagingService);
  container.registerSingleton<UserService>(UserService);
  container.registerSingleton<UserController>(UserController);
}
