import "reflect-metadata";
import { container } from "tsyringe";
import { ICacheService, IMessagingService, KafkaMessagingService, RedisCacheService } from "shared";
import { AppDataSource } from "./config/database";
import { Order } from "./entities/order.entity";
import { OrderRepository } from "./repository/order.repository";
import { OrderService } from "./service/order.service";
import { OrderController } from "./controller/order.controller";

export async function registerDependencies(): Promise<void> {
  container.registerInstance<typeof AppDataSource>("AppDataSource", AppDataSource);
  container.registerSingleton<OrderRepository>("OrderRepository", OrderRepository);
  container.registerSingleton<ICacheService>("CacheService", RedisCacheService);
  container.registerSingleton<IMessagingService>("KafkaMessagingService", KafkaMessagingService);
  container.registerSingleton<OrderService>(OrderService);
  container.registerSingleton<OrderController>(OrderController);
}
