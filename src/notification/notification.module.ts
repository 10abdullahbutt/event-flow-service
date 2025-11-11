import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { EventBusModule } from '../events/event-bus.module';
import Redis from 'ioredis';

const redisProvider = {
  provide: 'REDIS',
  useFactory: () => {
    return new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      retryStrategy: () => {
        return null;
      },
    });
  },
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    EventBusModule,
  ],
  providers: [NotificationService, NotificationGateway, redisProvider],
  controllers: [NotificationController],
  exports: [NotificationGateway],
})
export class NotificationModule {}
