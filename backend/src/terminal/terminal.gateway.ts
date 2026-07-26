import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket 
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TerminalService } from './terminal.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TerminalGateway {
  constructor(private readonly terminalService: TerminalService) {}

  @SubscribeMessage('terminal-input')
  handleTerminalInput(
    @MessageBody() payload: { sessionId: string; data: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.terminalService.writeInput(payload.sessionId, payload.data);
    } catch (err) {
      client.emit('terminal-error', {
        sessionId: payload.sessionId,
        message: err.message || 'Failed to process input command',
      });
    }
  }
}
