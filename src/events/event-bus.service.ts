import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEvent } from './user-event.dto';

/**
 * Simple event bus using NestJS EventEmitter2.
 * This can be replaced with Kafka later by changing the implementation.
 */
@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly TOPIC = 'user-events';

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Publish a user event to the event bus.
   * Partitioning by userId is handled implicitly by the event system.
   * Later, this will publish to Kafka topic 'user-events' with key=userId.
   */
  async publishUserEvent(event: UserEvent): Promise<void> {
    try {
      // For now, emit locally. Later: publish to Kafka topic 'user-events' with key=event.userId
      this.eventEmitter.emit(this.TOPIC, event);
      this.logger.debug(`Published event ${event.eventId} for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${event.eventId}`, error);
      throw error;
    }
  }

  /**
   * Send event to dead-letter queue.
   * Later: publish to Kafka topic 'user-events-dlq' with key=userId.
   */
  async sendToDLQ(event: UserEvent, reason: string): Promise<void> {
    try {
      this.eventEmitter.emit('user-events-dlq', { ...event, dlqReason: reason });
      this.logger.warn(`Sent event ${event.eventId} to DLQ: ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to send event ${event.eventId} to DLQ`, error);
    }
  }
}




