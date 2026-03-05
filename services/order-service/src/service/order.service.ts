import { ICacheService, IMessagingService, OrderCreatedEvent } from "shared";
import { inject, injectable } from "tsyringe";
import { Order } from "../entities/order.entity";
import { CreateOrderDto } from "../dtos/orders.dto";
import { OrderRepository } from "../repository/order.repository";

@injectable()
export class OrderService {
  constructor(
    @inject("OrderRepository") private orderRepository: OrderRepository,
    @inject("CacheService") private cacheService: ICacheService,
    @inject("KafkaMessagingService") private messagingService: IMessagingService,
  ) { }

  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    const newOrder = new Order();
    newOrder.userId = orderData.userId;
    newOrder.items = orderData.items;
    const createdOrder = await this.orderRepository.create(newOrder);

    const orderCreatedEvent: OrderCreatedEvent = {
      type: "order.created",
      timestamp: new Date(),
      id: createdOrder.id,
      version: "1.0.0",
      data: {
        orderId: createdOrder.id,
        userId: createdOrder.userId,
        items: createdOrder.items,
        totalAmount: createdOrder.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
      },
    };

    await this.messagingService.publish("order.created", orderCreatedEvent);
    return createdOrder;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    const cachedOrder = await this.cacheService.get(`order:${orderId}`);
    if (cachedOrder) {
      return cachedOrder as Order;
    }
    const order = await this.orderRepository.findById(orderId);
    if (order) {
      await this.cacheService.set(`order:${orderId}`, order);
    }
    return order;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return this.orderRepository.getOrdersByUserId(userId);
  }
}
