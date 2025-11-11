import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string) {
    client.join(userId);
    this.logger.log(`Client ${client.id} joined room for user ${userId}`);
    client.emit('joined', { userId, message: 'Successfully joined notification room' });
  }

  @SubscribeMessage('leave')
  handleLeave(client: Socket, userId: string) {
    client.leave(userId);
    this.logger.log(`Client ${client.id} left room for user ${userId}`);
    client.emit('left', { userId, message: 'Left notification room' });
  }

  sendToUser(userId: string, event: string, payload: any): void {
    if (!this.server) {
      this.logger.warn('Socket.IO server not initialized');
      return;
    }
    this.server.to(userId).emit(event, payload);
    this.logger.debug(`Sent ${event} to user ${userId}`);
  }
}
