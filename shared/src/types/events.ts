export interface BaseEvent {
  id: string;
  timestamp: Date;
  version: string;
}

export interface UserCreatedEvent extends BaseEvent {
  type: "user.created";
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface UserUpdatedEvent extends BaseEvent {
  type: "user.updated";
  data: {
    userId: string;
    changes: Record<string, unknown>;
  };
}

export interface ProductCreatedEvent extends BaseEvent {
  type: "product.created";
  data: {
    productId: string;
    name: string;
    price: number;
    stock: number;
  };
}

export interface ProductStockUpdatedEvent extends BaseEvent {
  type: "product.stock.updated";
  data: {
    productId: string;
    oldStock: number;
    newStock: number;
  };
}

export interface OrderCreatedEvent extends BaseEvent {
  type: "order.created";
  data: {
    orderId: string;
    userId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  };
}

export interface OrderStatusUpdatedEvent extends BaseEvent {
  type: "order.status.updated";
  data: {
    orderId: string;
    oldStatus: string;
    newStatus: string;
  };
}

export type DomainEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | ProductCreatedEvent
  | ProductStockUpdatedEvent
  | OrderCreatedEvent
  | OrderStatusUpdatedEvent;
