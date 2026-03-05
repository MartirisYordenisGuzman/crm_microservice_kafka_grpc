import { injectable } from "tsyringe";
import { ProductService } from "../service/product.service";
import { GenericKafkaConsumer, KafkaMessagingService, OrderCreatedEvent } from "shared";

@injectable()
export class OrderConsumer {
  private consumer: GenericKafkaConsumer<OrderCreatedEvent>;
  private isStarting = false;

  constructor(
    private productService: ProductService,
    private kafkaService: KafkaMessagingService,
  ) {
    console.log("🔄 OrderConsumer constructor called");
    this.consumer = new GenericKafkaConsumer<OrderCreatedEvent>(
      "order.created",
      this.handleOrderCreated.bind(this),
      this.kafkaService,
    );
  }

  async start() {
    if (this.isStarting) {
      console.log("🔄 OrderConsumer already starting...");
      return;
    }

    this.isStarting = true;

    try {
      console.log("🚀 Starting OrderConsumer for topic: order.created");

      // Wait a bit for Kafka to be ready
      await this.delay(5000);

      await this.consumer.start();
      console.log("✅ OrderConsumer successfully started and subscribed to order.created");
    } catch (error) {
      console.error("❌ Failed to start OrderConsumer:", error);

      // Retry after delay
      console.log("🔄 Retrying OrderConsumer start in 10 seconds...");
      setTimeout(() => {
        this.isStarting = false;
        this.start();
      }, 10000);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      console.log("📥 Received order.created event:", JSON.stringify(event, null, 2));

      if (!event.data || !event.data.items) {
        console.error("❌ Invalid event structure:", event);
        return;
      }

      console.log(`🛍️ Processing ${event.data.items.length} items from order`);

      for (const item of event.data.items) {
        try {
          console.log(`📦 Processing product ${item.productId}, quantity: ${item.quantity}`);

          // ✅ First get the current product to check stock
          const product = await this.productService.getProductById(item.productId);
          if (!product) {
            console.error(`❌ Product ${item.productId} not found`);
            continue;
          }

          console.log(`📊 Current stock for ${item.productId}: ${product.stock}`);

          // ✅ Calculate new stock (reduce by quantity)
          const newStock = product.stock - item.quantity;

          if (newStock < 0) {
            console.warn(
              `⚠️ Insufficient stock for product ${item.productId}. Current: ${product.stock}, Required: ${item.quantity}`,
            );
            return;
          }

          // ✅ Update with the reduced stock
          await this.productService.updateProduct(item.productId, {
            stock: newStock,
          });

          console.log(
            `✅ Stock updated for product ${item.productId}: ${product.stock} -> ${newStock}`,
          );
        } catch (error) {
          console.error(`❌ Failed to process product ${item.productId}:`, error);
          // Log the specific error details
          if (error instanceof Error) {
            console.error(`Error details: ${error.message}`);
          }
        }
      }

      console.log("✅ Order processing completed");
    } catch (error) {
      console.error("❌ Error processing order event:", error);
    }
  }

  async stop() {
    console.log("🛑 Stopping OrderConsumer...");
    // Add stop logic if needed
  }
}
