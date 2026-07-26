import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayInit, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './websocket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  namespace: '/',
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly websocketService: WebsocketService) {}

  afterInit(server: Server) {
    this.websocketService.setServer(server);
    console.log('CaelumOS Socket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Socket Client connected: ${client.id}`);
    
    // In a real-world scenario, we would parse authorization JWT handshake queries here
    const userId = client.handshake.query.userId as string;
    if (userId) {
      client.join(`user-${userId}`);
      console.log(`Socket Client ${client.id} joined user room: user-${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-logs')
  handleLogSubscription(
    @MessageBody() data: { appId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`logs-${data.appId}`);
    console.log(`Socket Client ${client.id} subscribed to application logs: ${data.appId}`);
    return { status: 'subscribed', room: `logs-${data.appId}` };
  }
}
