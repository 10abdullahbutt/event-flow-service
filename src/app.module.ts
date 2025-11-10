import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from './notification/notification.module';
import { AuditLog } from './audit/audit-log.entity';
import { Notification } from './notification/notification.entity';
import { AuditModule } from './audit/audit.module';
import { ProducerModule } from './producer/producer.module';
import { HealthModule } from './health/health.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EventEmitterModule.forRoot(),
    // Configure TypeORM with ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get('POSTGRES_USER', 'postgres'),
        password: configService.get('POSTGRES_PASSWORD', 'postgres'),
        database: configService.get('POSTGRES_DB', 'audit_db'),
        entities: [AuditLog, Notification],
        // Use synchronize only in development, migrations in production
        synchronize: configService.get('NODE_ENV') !== 'production',
        migrations: configService.get('NODE_ENV') === 'production' ? ['dist/migrations/*.js'] : [],
        migrationsRun: configService.get('NODE_ENV') === 'production', // Auto-run migrations in production
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuditModule,
    NotificationModule,
    ProducerModule,
    HealthModule,
  ],
})
export class AppModule {}
