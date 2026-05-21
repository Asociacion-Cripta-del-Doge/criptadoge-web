import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitAttendeeUpdate(
    eventId: string,
    attendeesCount: number,
  ) {
    this.server.emit('attendee-update', { eventId, attendeesCount });
  }

  emitEventCreated(event: object) {
    this.server.emit('event-created', event);
  }

  emitEventUpdated(event: object) {
    this.server.emit('event-updated', event);
  }

  emitEventDeleted(eventId: string) {
    this.server.emit('event-deleted', { eventId });
  }
}
