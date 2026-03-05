import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRoutes } from "./routes/auth.routes";
import { productRoutes } from "./routes/product.routes";
import { orderRoutes } from "./routes/order.routes";
import { userRoutes } from "./routes/user.routes";
import { metricsMiddleware } from "./middleware/metrics";
import { errorHandler } from "./middleware/error-handler";
import { config, register } from "shared";

const app = express();

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { error: "Too many requests, please try again later" },
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(metricsMiddleware("api-gateway"));

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "api-gateway",
  });
});

app.get("/metrics", async (_, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use(errorHandler);

// 404 handler
app.use("*", (_, res) => {
  res.status(404).json({ error: "Route not found" });
});

export { app };
