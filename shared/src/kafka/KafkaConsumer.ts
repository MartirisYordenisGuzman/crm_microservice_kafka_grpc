import { KafkaMessagingService } from "./KafkaMessagingService";
import { DomainEvent } from "../types/events";

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void>;

export class GenericKafkaConsumer<T extends DomainEvent = DomainEvent> {
  constructor(
    private topic: string,
    private handler: EventHandler<T>,
    private kafkaService: KafkaMessagingService,
  ) { }

  async start() {
    await this.kafkaService.subscribe(this.topic, async (event: DomainEvent) => {
      try {
        await this.handler(event as T);
      } catch (error) {
        console.error(`❌ Error handling event from topic ${this.topic}:`, error);
      }
    });
    console.log(`✅ GenericKafkaConsumer subscribed to topic: ${this.topic}`);
  }
}
