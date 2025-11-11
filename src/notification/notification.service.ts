import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Redis from 'ioredis';
import { Notification } from './notification.entity';
import { NotificationGateway } from './notification.gateway';
import { UserEvent } from '../events/user-event.dto';
import { EventBusService } from '../events/event-bus.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    @Inject('REDIS') private readonly redis: Redis,
    private readonly gateway: NotificationGateway,
    private readonly eventBus: EventBusService,
  ) {}

  @OnEvent('user-events')
  async handleUserEvent(event: UserEvent): Promise<void> {
    const { eventId, userId, type, payload } = event;

    if (!eventId || !userId) {
      this.logger.warn('Missing eventId or userId in event; skipping', event);
      return;
    }

    const dedupeKey = `notify:d:${eventId}`;
    try {
      const seen = await this.redis.get(dedupeKey);
      if (seen) {
        this.logger.log(`Duplicate event ${eventId} skipped (redis)`);
        return;
      }
      await this.redis.set(dedupeKey, '1', 'EX', 60 * 60 * 24);
    } catch (err) {
      this.logger.error('Redis dedupe check failed — continuing (best-effort)', err as any);
    }

    const userRateKey = `notify:rate:${userId}`;
    try {
      const cnt = await this.redis.incr(userRateKey);
      if (cnt === 1) {
        await this.redis.expire(userRateKey, 60);
      }
      if (cnt > 5) {
        this.logger.warn(`Rate limit exceeded for user ${userId} (count=${cnt}). Marking as throttled.`);
        try {
          await this.repo.save({
            eventId,
            userId,
            type,
            payload,
            status: 'failed',
          } as Partial<Notification>);
        } catch (e) {
          if (!/(duplicate key|unique constraint|UniqueViolation)/i.test((e as any)?.message || '')) {
            this.logger.error('Failed to persist throttled notification', e as any);
          }
        }
        return;
      }
    } catch (err) {
      this.logger.error('Redis rate-limit failed — continuing (best-effort)', err as any);
    }

    try {
      const rec = this.repo.create({
        eventId,
        userId,
        type,
        payload,
        status: 'pending',
      } as Partial<Notification>);
      await this.repo.save(rec);
    } catch (err: any) {
      if (/(duplicate key|unique constraint|UniqueViolation)/i.test(err?.message || '')) {
        this.logger.warn(`Notification DB duplicate for ${eventId}`);
        return;
      } else {
        this.logger.error('Failed to persist notification', err);
        await this.eventBus.sendToDLQ(event, 'persist_failed');
        return;
      }
    }

    try {
      const notifyPayload = {
        eventId,
        type,
        payload,
        createdAt: event.createdAt ?? new Date().toISOString(),
      };

      this.gateway.sendToUser(userId, 'notification', notifyPayload);

      try {
        await this.repo.update({ eventId }, { status: 'sent' });
      } catch (e) {
        this.logger.error('Failed to update notification status to sent', e as any);
      }

      this.logger.log(`Realtime notification emitted for event ${eventId} -> user ${userId}`);
    } catch (err) {
      this.logger.error('Failed to emit realtime notification', err as any);
      try {
        await this.repo.update({ eventId }, { status: 'failed' });
      } catch (e) {
        this.logger.error('Failed to mark notification as failed', e as any);
      }

      await this.eventBus.sendToDLQ(event, 'realtime_send_failed');
    }
  }
}
