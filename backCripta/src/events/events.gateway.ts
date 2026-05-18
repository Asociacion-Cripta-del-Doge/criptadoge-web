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
    this.server.emit('attendee-update', { eventId, attendees });
  }

  emitEventCreated(event: Record<string, unknown>) {
    this.server.emit('event-created', event);
  }

  emitEventUpdated(event: Record<string, unknown>) {
    this.server.emit('event-updated', event);
  }

  emitEventDeleted(eventId: string) {
    this.server.emit('event-deleted', { eventId });
  }
}
