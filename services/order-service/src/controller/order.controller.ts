import { sendUnaryData, ServerUnaryCall, status } from "@grpc/grpc-js";
import { injectable } from "tsyringe";
import { Order } from "../entities/order.entity";
import { OrderService } from "../service/order.service";
import { CreateOrderRequest, GetOrderRequest, GetUserOrdersRequest, GetUserOrdersResponse, OrderResponse } from "shared/dist";

@injectable()
export class OrderController {
  constructor(private orderService: OrderService) { }

  private toOrderResponse(order: Order): OrderResponse {
    return {
      id: order.id,
      userId: order.userId,
      items: order.items,
      totalAmount: order.items.reduce((total, item) => total + item.price * item.quantity, 0),
      status: "created",
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  async CreateOrder(
    call: ServerUnaryCall<CreateOrderRequest, OrderResponse>,
    callback: sendUnaryData<OrderResponse>,
  ): Promise<void> {
    try {
      const order = await this.orderService.createOrder({
        userId: call.request.userId,
        items: call.request.items,
      });

      callback(null, this.toOrderResponse(order));
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }

  async GetOrder(
    call: ServerUnaryCall<GetOrderRequest, OrderResponse>,
    callback: sendUnaryData<OrderResponse>,
  ): Promise<void> {
    try {
      const order = await this.orderService.getOrderById(call.request.id);

      if (!order) {
        callback({
          code: status.NOT_FOUND,
          message: "Order not found",
        });
        return;
      }

      callback(null, this.toOrderResponse(order));
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }

  async GetUserOrders(
    call: ServerUnaryCall<GetUserOrdersRequest, GetUserOrdersResponse>,
    callback: sendUnaryData<GetUserOrdersResponse>,
  ): Promise<void> {
    try {
      const orders = await this.orderService.getOrdersByUserId(call.request.userId);
      const page = call.request.page || 1;
      const limit = call.request.limit || orders.length || 1;

      const response: GetUserOrdersResponse = {
        orders: orders.map((order) => this.toOrderResponse(order)),
        total: orders.length,
        page,
        limit,
      };

      callback(null, response);
    } catch (error) {
      callback({
        code: status.INVALID_ARGUMENT,
        message: (error as Error).message,
      });
    }
  }
}
