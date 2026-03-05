import "reflect-metadata";
import { container } from "tsyringe";
import { GrpcObject, Server, ServerCredentials, ServiceDefinition, UntypedServiceImplementation, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { register } from "shared/dist/utils/metrics";
import { ProductController } from "./controller/product.controller";
import { registerDependencies } from "./containers";
import { initializeDatabase } from "./config/database";
import { OrderConsumer } from "./config/order.consumer";
import { authUnaryInterceptor, wrapUnary } from "shared/dist";

const PROTO_PATH = "/app/shared/proto/product.proto";

type ProductGrpcPackage = GrpcObject & {
  ProductService: {
    service: ServiceDefinition<UntypedServiceImplementation>;
  };
};

async function startServer() {
  try {
    await initializeDatabase();
    await registerDependencies();

    const startConsumerWithRetry = async (retryCount = 0) => {
      try {
        const orderConsumer = container.resolve(OrderConsumer);
        await orderConsumer.start();
        console.log("✅ OrderConsumer started successfully");
      } catch (error) {
        console.error(`❌ Failed to start OrderConsumer (attempt ${retryCount + 1}):`, error);

        if (retryCount < 5) {
          console.log(`🔄 Retrying OrderConsumer in 10 seconds...`);
          setTimeout(() => startConsumerWithRetry(retryCount + 1), 10000);
        } else {
          console.error("💥 Max retries reached for OrderConsumer. Continuing without consumer...");
        }
      }
    };

    startConsumerWithRetry().catch(console.error);

    const packageDefinition = loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const loadedDefinition = loadPackageDefinition(packageDefinition);
    const productProto = loadedDefinition.product as ProductGrpcPackage;
    const server = new Server();

    const productController: ProductController = container.resolve(ProductController);

    server.addService(productProto.ProductService.service, {
      GetProduct: wrapUnary(
        productController.GetProduct.bind(productController),
        authUnaryInterceptor(["Admin", "Supplier", "Customer"]),
      ),
      CreateProduct: wrapUnary(
        productController.CreateProduct.bind(productController),
        authUnaryInterceptor(["Admin", "Supplier"]),
      ),
      UpdateProduct: wrapUnary(
        productController.UpdateProduct.bind(productController),
        authUnaryInterceptor(["Admin", "Supplier"]),
      ),
      DeleteProduct: wrapUnary(
        productController.DeleteProduct.bind(productController),
        authUnaryInterceptor(["Admin", "Supplier"]),
      ),
      GetProducts: wrapUnary(
        productController.GetProducts.bind(productController),
        authUnaryInterceptor(["Admin", "Supplier", "Customer"]),
      ),
      UpdateStock: wrapUnary(
        productController.UpdateStock.bind(productController),
        authUnaryInterceptor(["Admin", "Supplier"]),
      ),
    });

    register.setDefaultLabels({ service: "product-service" });
    register.metrics().then((metrics) => {
      console.log("Metrics registered:", metrics);
    });

    const port = process.env.PRODUCT_SERVICE_PORT || "50052";

    server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), (error, port) => {
      if (error) {
        console.error("Error binding server:", error);
        return;
      }
      console.log(`Server listening on port ${port}`);
      server.start();
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error starting server: ${error.message}`);
    } else {
      console.error("Unknown error starting server");
    }
  }
}

startServer();
