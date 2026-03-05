import {
  GrpcProtoNotificationMethods,
  GrpcProtoOrderMethods,
  GrpcProtoProductMethods,
  GrpcProtoUserMethods,
  GrpcServiceKey,
  GrpcServices,
} from "../types/grpc-proto-types";
import { GrpcClient } from "./grpc-client";

type GrpcUnaryMethod<TRequest, TResponse> = (
  request: TRequest,
  callback: (error: Error | null, response: TResponse) => void,
) => void;

export class GrpcService {
  constructor(
    private serviceName: GrpcServices,
    private serviceKey: GrpcServiceKey,
    private protoPath: string,
    private host: string,
    private port: number,
  ) { }

  async call<TResponse, TRequest = unknown>(
    method:
      | GrpcProtoUserMethods
      | GrpcProtoProductMethods
      | GrpcProtoOrderMethods
      | GrpcProtoNotificationMethods,
    request: TRequest,
    timeoutMs: number = 10000,
  ): Promise<TResponse> {
    const client = await GrpcClient.getClient(
      this.serviceName,
      this.serviceKey,
      this.protoPath,
      this.host,
      this.port,
    );

    return new Promise<TResponse>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`gRPC call timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      const methodFn = (client as unknown as Record<string, unknown>)[method];
      if (typeof methodFn !== "function") {
        clearTimeout(timeoutId);
        reject(new Error(`Method ${method} not found on gRPC client`));
        return;
      }

      (methodFn as GrpcUnaryMethod<TRequest, TResponse>)(request, (error, response) => {
        clearTimeout(timeoutId);

        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}
