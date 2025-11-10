import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { AuditLog } from './audit/audit-log.entity';
import { Notification } from './notification/notification.entity';

// Load .env file for migrations (TypeORM CLI doesn't use NestJS ConfigModule)
config();

/**
 * DataSource configuration for TypeORM migrations
 * This file is used by TypeORM CLI to run migrations
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'audit_db',
  entities: [AuditLog, Notification],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;

