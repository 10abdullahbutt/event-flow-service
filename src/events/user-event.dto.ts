import { IsNotEmpty, IsString, IsObject, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserEventDto {
  @ApiPropertyOptional({
    description: 'Unique event ID (UUID). If not provided, will be auto-generated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiProperty({
    description: 'User ID who triggered the event',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Event type (e.g., ORDER_CREATED, LOGIN, PROFILE_UPDATED)',
    example: 'ORDER_CREATED',
    enum: ['ORDER_CREATED', 'LOGIN', 'PROFILE_UPDATED', 'PURCHASE', 'WEBHOOK'],
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Event payload data (JSON object)',
    example: { orderId: 'order123', amount: 99.99, currency: 'USD' },
  })
  @IsObject()
  payload: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Event creation timestamp (ISO8601). If not provided, will be auto-generated',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsString()
  @IsOptional()
  createdAt?: string;
}

export interface UserEvent {
  eventId: string;
  userId: string;
  type: string;
  payload: Record<string, any>;
  createdAt: string;
}
