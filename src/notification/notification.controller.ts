import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'sent', 'failed'], description: 'Filter by status' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit results (default: 50)' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async getNotifications(
    @Query('userId') userId?: string,
    @Query('status') status?: 'pending' | 'sent' | 'failed',
    @Query('limit') limit?: number,
  ) {
    const query = this.repo.createQueryBuilder('notification');

    if (userId) {
      query.where('notification.userId = :userId', { userId });
    }

    if (status) {
      query.andWhere('notification.status = :status', { status });
    }

    query.orderBy('notification.createdAt', 'DESC');
    query.limit(limit || 50);

    return query.getMany();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification details' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotificationById(@Param('id') id: string) {
    return this.repo.findOne({ where: { id } });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'List of notifications for the user' })
  async getNotificationsByUser(@Param('userId') userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}

