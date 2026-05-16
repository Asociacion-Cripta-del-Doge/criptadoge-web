import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitAttendeeUpdate(
    eventId: string,
    attendees: { userId: string; joinedAt: Date }[],
  ) {
    this.server.emit('attendee-update', {
      eventId,
      attendees,
    });
  }
}
