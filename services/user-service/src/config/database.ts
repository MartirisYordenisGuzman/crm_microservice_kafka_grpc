import { User } from "../entities/user.entity";
import { createAppDataSource } from "shared";

export const AppDataSource = createAppDataSource([User]);

export async function initializeDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}
