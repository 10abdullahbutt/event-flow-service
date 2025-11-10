import { IsNotEmpty, IsString, IsObject, IsUUID } from 'class-validator';

export class CreateEventDto {
  @IsUUID()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  payload: Record<string, any>;

  @IsString()
  createdAt: string;
}
