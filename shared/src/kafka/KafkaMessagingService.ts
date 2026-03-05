import { Consumer, Producer, KafkaJSNonRetriableError } from "kafkajs";
import { kafka } from "../config/kafka";
import { injectable } from "tsyringe";
import { IMessagingService } from "./IMessagingService";
import { DomainEvent } from "../types/events";

@injectable()
export class KafkaMessagingService implements IMessagingService {
  private producer: Producer;
  private consumer: Consumer;
  private isProducerConnected = false;
  private connectionPromise: Promise<void> | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor() {
    const groupId: string = process.env.KAFKA_GROUP_ID!;

    this.producer = kafka.producer({
      allowAutoTopicCreation: true,
      retry: { initialRetryTime: 100, retries: 3, maxRetryTime: 1000 },
      transactionTimeout: 10000,
    });

    this.consumer = kafka.consumer({
      groupId,
      allowAutoTopicCreation: true,
      retry: { initialRetryTime: 100, retries: 3 },
    });
  }

  private async connectProducer(): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = (async () => {
      if (this.isProducerConnected) return;

      try {
        await this.producer.connect();
        this.isProducerConnected = true;
        console.log("✅ Kafka producer connected");
      } catch (error: unknown) {
        console.error("❌ Failed to connect Kafka producer:", error);
        if (!(error instanceof KafkaJSNonRetriableError)) {
          console.warn("🔁 Retrying Kafka producer connection in 5s...");
          this.scheduleReconnect();
        }
        this.isProducerConnected = false;
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) return;
    this.reconnectInterval = setTimeout(async () => {
      this.reconnectInterval = null;
      await this.connectProducer().catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.log("Kafka reconnect failed:", errorMessage);
      });
    }, 5000);
  }

  async publish(topic: string, event: DomainEvent): Promise<void> {
    if (!this.isProducerConnected) {
      // Conexión lazy
      console.warn("⚠️ Kafka producer not connected, attempting lazy connect...");
      await this.connectProducer();
      if (!this.isProducerConnected) return; // Si falla, no bloqueamos
    }

    try {
      const messageValue = JSON.stringify(event);
      await Promise.race([
        this.producer.send({ topic, messages: [{ key: event.id, value: messageValue }] }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Kafka publish timeout after 2s")), 2000),
        ),
      ]);

      console.log(`✅ Event published to ${topic}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Failed to publish Kafka event:", message);
      this.isProducerConnected = false;
      this.scheduleReconnect();
    }
  }

  async subscribe(topic: string, handler: (event: DomainEvent) => Promise<void>): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic, fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ message, topic, partition }) => {
          if (!message.value) return;
          try {
            const event = JSON.parse(message.value.toString()) as DomainEvent;
            await handler(event);
          } catch (error) {
            console.error(`❌ Error processing Kafka message from ${topic}[${partition}]:`, error);
          }
        },
      });

      console.log(`✅ Subscribed to Kafka topic: ${topic}`);
    } catch (error) {
      console.error("❌ Failed to subscribe to Kafka topic:", error);
      console.warn("🔁 Retrying subscription in 5s...");
      setTimeout(() => this.subscribe(topic, handler), 5000);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.isProducerConnected) {
        await this.producer.disconnect();
        this.isProducerConnected = false;
      }
      await this.consumer.disconnect();
      console.log("🧹 Kafka connections closed cleanly");
    } catch (error) {
      console.error("❌ Error disconnecting Kafka:", error);
    }
  }
}
