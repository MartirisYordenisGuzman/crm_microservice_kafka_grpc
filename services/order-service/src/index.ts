import "reflect-metadata";
import { container } from "tsyringe";
import { GrpcObject, Server, ServerCredentials, ServiceDefinition, UntypedServiceImplementation, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { register } from "shared/dist/utils/metrics";
import { registerDependencies } from "./containers";
import { initializeDatabase } from "./config/database";
import { OrderController } from "./controller/order.controller";
import { authUnaryInterceptor, wrapUnary } from "shared/dist";

const PROTO_PATH = "/app/shared/proto/order.proto";

type OrderGrpcPackage = GrpcObject & {
  OrderService: {
    service: ServiceDefinition<UntypedServiceImplementation>;
  };
};

async function startServer() {
  try {
    await initializeDatabase();
    await registerDependencies();

    const packageDefinition = loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const loadedDefinition = loadPackageDefinition(packageDefinition);
    const orderProto = loadedDefinition.order as OrderGrpcPackage;
    const server = new Server();

    const orderController: OrderController = container.resolve(OrderController);

    server.addService(orderProto.OrderService.service, {
      CreateOrder: wrapUnary(
        orderController.CreateOrder.bind(orderController),
        authUnaryInterceptor(["Customer"]),
      ),
      GetOrder: wrapUnary(
        orderController.GetOrder.bind(orderController),
        authUnaryInterceptor(["Admin"]),
      ),
      GetUserOrders: wrapUnary(
        orderController.GetUserOrders.bind(orderController),
        authUnaryInterceptor(["Admin", "Customer"]),
      ),
    });

    register.setDefaultLabels({ service: "order-service" });
    register.metrics().then((metrics) => {
      console.log("Metrics registered:", metrics);
    });

    const port = process.env.ORDER_SERVICE_PORT || "50053";

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
