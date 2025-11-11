import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { UserEvent } from '../events/user-event.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  @OnEvent('user-events')
  async handleUserEvent(event: UserEvent): Promise<void> {
    const { eventId, userId, type, payload, createdAt } = event;

    try {
      const audit = this.repo.create({
        eventId,
        userId,
        type,
        payload,
        createdAt: createdAt || new Date().toISOString(),
      });
      await this.repo.save(audit);
      this.logger.debug(`Saved audit ${eventId}`);
    } catch (err: any) {
      if (/(duplicate key|unique constraint|UniqueViolation)/i.test(err?.message || '')) {
        this.logger.warn(`Duplicate event ${eventId}, ignoring`);
        return;
      }
      this.logger.error('Failed to save audit', err);
      throw err;
    }
  }
}
