import "reflect-metadata";
import { container } from "tsyringe";
import {
  GrpcObject,
  Server,
  ServerCredentials,
  ServiceDefinition,
  UntypedServiceImplementation,
  loadPackageDefinition,
} from "@grpc/grpc-js";
import { loadSync } from "@grpc/proto-loader";
import { register } from "shared/dist/utils/metrics";
import { UserController } from "./controller/user.controller";
import { registerDependencies } from "./containers";
import { initializeDatabase } from "./config/database";
import { authUnaryInterceptor, wrapUnary } from "shared/dist";

const PROTO_PATH = "/app/shared/proto/user.proto";
type UserGrpcNamespace = {
  UserService?: {
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

    const grpcObject = loadPackageDefinition(packageDefinition) as GrpcObject;
    const userProto = grpcObject.user as UserGrpcNamespace;
    if (!userProto?.UserService?.service) {
      throw new Error("UserService definition not found in loaded proto");
    }
    const server = new Server();
    const userController: UserController = container.resolve(UserController);

    server.addService(userProto.UserService.service, {
      CreateUser: userController.CreateUser.bind(userController),
      GetUser: wrapUnary(
        userController.GetUser.bind(userController),
        authUnaryInterceptor(["Admin", "Customer"]),
      ),
      ValidateUser: userController.ValidateUser.bind(userController),
      GetUserByEmail: wrapUnary(
        userController.GetUserByEmail.bind(userController),
        authUnaryInterceptor(["Admin", "Customer"]),
      ),
      UpdateUser: wrapUnary(
        userController.UpdateUser.bind(userController),
        authUnaryInterceptor(["Admin", "Customer"]),
      ),
      DeleteUser: wrapUnary(
        userController.DeleteUser.bind(userController),
        authUnaryInterceptor(["Admin"]),
      ),
    });

    register.setDefaultLabels({ service: "user-service" });
    register.metrics().then((metrics) => {
      console.log("Metrics registered:", metrics);
    });

    const port = process.env.USER_SERVICE_PORT || "50051";

    server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), (error, port) => {
      if (error) {
        console.error(`Failed to bind server: ${error.message}`);
        return;
      }
      console.log(`User service running at http://0.0.0.0:${port}`);
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
