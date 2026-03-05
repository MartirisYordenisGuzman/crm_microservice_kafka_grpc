export type GrpcProtoUserMethods =
  | "GetUser"
  | "GetUserByEmail"
  | "CreateUser"
  | "UpdateUser"
  | "DeleteUser"
  | "ValidateUser";

export type GrpcProtoProductMethods =
  | "GetProduct"
  | "CreateProduct"
  | "UpdateProduct"
  | "DeleteProduct"
  | "GetProducts"
  | "UpdateStock";

export type GrpcProtoOrderMethods = "CreateOrder" | "GetOrder" | "GetUserOrders";

export type GrpcProtoNotificationMethods =
  | "SendNotification"
  | "GetUserNotifications"
  | "MarkAsRead";

export type GrpcServices =
  | "NotificationService"
  | "OrderService"
  | "ProductService"
  | "UserService";

export type GrpcServiceKey = "User" | "Product" | "Order" | "Notification";
