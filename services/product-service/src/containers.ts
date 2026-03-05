import "reflect-metadata";
import { container } from "tsyringe";
import {
  ICacheService,
  IMessagingService,
  IRepository,
  KafkaMessagingService,
  RedisCacheService,
} from "shared";
import { Product } from "./entities/product.entity";
import { ProductService } from "./service/product.service";
import { ProductController } from "./controller/product.controller";
import { AppDataSource } from "./config/database";
import { ProductRepository } from "./repository/product.repository";
import { OrderConsumer } from "./config/order.consumer";

export async function registerDependencies(): Promise<void> {
  container.registerInstance<typeof AppDataSource>("AppDataSource", AppDataSource);
  container.registerSingleton<IRepository<Product>>("ProductRepository", ProductRepository);
  container.registerSingleton<ICacheService>("CacheService", RedisCacheService);
  container.registerSingleton<IMessagingService>("KafkaMessagingService", KafkaMessagingService);
  container.registerSingleton<OrderConsumer>(OrderConsumer);
  container.registerSingleton<ProductService>(ProductService);
  container.registerSingleton<ProductController>(ProductController);
}
