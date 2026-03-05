import { createAppDataSource } from "shared";
import { Product } from "../entities/product.entity";

export const AppDataSource = createAppDataSource([Product]);

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}
