import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEvent } from './user-event.dto';

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);
  private readonly TOPIC = 'user-events';

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async publishUserEvent(event: UserEvent): Promise<void> {
    try {
      this.eventEmitter.emit(this.TOPIC, event);
      this.logger.debug(`Published event ${event.eventId} for user ${event.userId}`);
    } catch (error) {
      this.logger.error(`Failed to publish event ${event.eventId}`, error);
      throw error;
    }
  }

  async sendToDLQ(event: UserEvent, reason: string): Promise<void> {
    try {
      this.eventEmitter.emit('user-events-dlq', { ...event, dlqReason: reason });
      this.logger.warn(`Sent event ${event.eventId} to DLQ: ${reason}`);
    } catch (error) {
      this.logger.error(`Failed to send event ${event.eventId} to DLQ`, error);
    }
  }
}
