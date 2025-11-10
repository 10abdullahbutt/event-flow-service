import { Body, Controller, Post, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EventBusService } from '../events/event-bus.service';
import { UserEventDto, UserEvent } from '../events/user-event.dto';
import { randomUUID } from 'crypto';

@ApiTags('events')
@Controller('events')
export class ProducerController {
  constructor(private readonly eventBus: EventBusService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Publish a user event' })
  @ApiBody({ type: UserEventDto })
  @ApiResponse({
    status: 202,
    description: 'Event accepted and published',
    schema: {
      example: {
        status: 'accepted',
        eventId: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async publishEvent(@Body() dto: UserEventDto): Promise<{ status: string; eventId: string }> {
    // Ensure eventId and createdAt are set
    const event: UserEvent = {
      eventId: dto.eventId || randomUUID(),
      userId: dto.userId,
      type: dto.type,
      payload: dto.payload,
      createdAt: dto.createdAt || new Date().toISOString(),
    };

    // Publish to event bus (later: this will publish to Kafka topic 'user-events' with key=userId)
    await this.eventBus.publishUserEvent(event);

    return {
      status: 'accepted',
      eventId: event.eventId,
    };
  }
}
