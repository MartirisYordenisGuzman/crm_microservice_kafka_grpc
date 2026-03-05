import { app } from "./app";
import { config } from "shared";

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 API Gateway running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      process.exit(0);
    });
  } catch (error) {
    process.exit(1);
  }
};

startServer();
