import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { EstadoReservaMesa } from '@prisma/client';
import { Server } from 'socket.io';

type ReservationSocketPayload = {
  action: 'created' | 'cancelled';
  reservaId: string;
  mesaId: string;
  userId: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  estado: EstadoReservaMesa;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class ReservasGateway {
  @WebSocketServer()
  server: Server;

  emitReservationChanged(payload: ReservationSocketPayload) {
    this.server.emit('reservation-changed', payload);
  }
}
