import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: Map<number, string> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.users.forEach((value, key) => {
      if (value === client.id) {
        this.users.delete(key);
      }
    });
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, userId: number) {
    this.users.set(userId, client.id)
    console.log(`User ${userId} joined chat`);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(client: Socket, payload: any) {
    const { receiverId, message } = payload;
    const receiverSocketId = this.users.get(receiverId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receiverMessage', message);
    } else {
      console.log(`User ${receiverId} is not online`);
    }
  }

  @SubscribeMessage('sendGroupMessage')
  handleSendGroupMessage(client: Socket, payload: any) {
    const { groupId, message } = payload;

    // Отправляем сообщение всем участникам группы, кроме отправителя
    this.server.to(groupId).except(client.id).emit(`groupMessage`, message);
  }
}