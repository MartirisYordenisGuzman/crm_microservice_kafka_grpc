import { DomainEvent } from "../types/events";

export interface IMessagingService {
  publish(topic: string, event: DomainEvent): Promise<void>;
  subscribe(topic: string, handler: (event: DomainEvent) => Promise<void>): Promise<void>;
}