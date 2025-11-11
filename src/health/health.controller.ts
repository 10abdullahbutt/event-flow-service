import { Controller, Get, Optional, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import Redis from 'ioredis';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Optional() @Inject('REDIS') private readonly redis?: Redis,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async healthCheck() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    try {
      await this.connection.query('SELECT 1');
      checks.services.database = 'healthy';
    } catch (error) {
      checks.services.database = 'unhealthy';
      checks.status = 'unhealthy';
    }

    if (this.redis) {
      try {
        await this.redis.ping();
        checks.services.redis = 'healthy';
      } catch (error) {
        checks.services.redis = 'unhealthy';
      }
    } else {
      checks.services.redis = 'not_configured';
    }

    return checks;
  }
}

