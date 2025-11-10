import { Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { EventBusModule } from '../events/event-bus.module';

@Module({
  imports: [EventBusModule],
  controllers: [ProducerController],
})
export class ProducerModule {}
