import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditLog } from './audit-log.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    EventEmitterModule.forRoot(),
  ],
  providers: [AuditService],
  controllers: [AuditController],
})
export class AuditModule {}
