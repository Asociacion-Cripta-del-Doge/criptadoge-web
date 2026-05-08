import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoReservaMesa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConsultaDisponibilidadDto } from './dto/consulta-disponibilidad.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';

const ACTIVE_RESERVATION_STATES = [
  EstadoReservaMesa.PENDIENTE,
  EstadoReservaMesa.CONFIRMADA,
];

@Injectable()
export class ReservasService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateReservaDto, userId: string) {
    const range = this.parseRange(data.fechaHoraInicio, data.fechaHoraFin);

    const availability = await this.getAvailability(
      data.mesaId,
      range.fechaHoraInicio,
      range.fechaHoraFin,
      data.asientosReservados,
    );

    if (!availability.disponible) {
      throw new ConflictException(
        'No hay asientos disponibles para ese horario',
      );
    }

    return this.prisma.reservaMesa.create({
      data: {
        mesaId: data.mesaId,
        userId,
        fechaHoraInicio: range.fechaHoraInicio,
        fechaHoraFin: range.fechaHoraFin,
        asientosReservados: data.asientosReservados,
      },
      include: this.defaultInclude(),
    });
  }

  async checkAvailability(query: ConsultaDisponibilidadDto) {
    const range = this.parseRange(query.fechaHoraInicio, query.fechaHoraFin);

    return this.getAvailability(
      query.mesaId,
      range.fechaHoraInicio,
      range.fechaHoraFin,
      query.asientosReservados ?? 1,
    );
  }

  async findOwn(userId: string) {
    return this.prisma.reservaMesa.findMany({
      where: { userId },
      orderBy: { fechaHoraInicio: 'desc' },
      include: this.defaultInclude(),
    });
  }

  async findAll() {
    return this.prisma.reservaMesa.findMany({
      orderBy: { fechaHoraInicio: 'desc' },
      include: this.defaultInclude(true),
    });
  }

  async cancel(id: string, userId: string, role: string) {
    const reserva = await this.prisma.reservaMesa.findUnique({
      where: { id },
      include: this.defaultInclude(true),
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (role !== 'ADMIN' && reserva.userId !== userId) {
      throw new ForbiddenException(
        'No puedes cancelar una reserva de otro usuario',
      );
    }

    if (reserva.estado === EstadoReservaMesa.CANCELADA) {
      throw new ConflictException('La reserva ya esta cancelada');
    }

    if (reserva.estado === EstadoReservaMesa.COMPLETADA) {
      throw new ConflictException(
        'No se puede cancelar una reserva completada',
      );
    }

    return this.prisma.reservaMesa.update({
      where: { id },
      data: { estado: EstadoReservaMesa.CANCELADA },
      include: this.defaultInclude(true),
    });
  }

  private async getAvailability(
    mesaId: string,
    fechaHoraInicio: Date,
    fechaHoraFin: Date,
    asientosSolicitados: number,
  ) {
    const mesa = await this.prisma.mesa.findUnique({
      where: { id: mesaId },
      select: { id: true, asientos: true, orden: true, esDePago: true },
    });

    if (!mesa) {
      throw new NotFoundException('Mesa no encontrada');
    }

    if (asientosSolicitados > mesa.asientos) {
      throw new BadRequestException(
        'La reserva supera los asientos de la mesa',
      );
    }

    const ocupacion = await this.prisma.reservaMesa.aggregate({
      where: {
        mesaId,
        estado: { in: ACTIVE_RESERVATION_STATES },
        fechaHoraInicio: { lt: fechaHoraFin },
        fechaHoraFin: { gt: fechaHoraInicio },
      },
      _sum: { asientosReservados: true },
    });

    const asientosOcupados = ocupacion._sum.asientosReservados ?? 0;
    const asientosDisponibles = mesa.asientos - asientosOcupados;

    return {
      mesa,
      fechaHoraInicio,
      fechaHoraFin,
      asientosTotales: mesa.asientos,
      asientosOcupados,
      asientosDisponibles,
      asientosSolicitados,
      disponible: asientosDisponibles >= asientosSolicitados,
    };
  }

  private parseRange(fechaHoraInicio: string, fechaHoraFin: string) {
    const inicio = new Date(fechaHoraInicio);
    const fin = new Date(fechaHoraFin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new BadRequestException(
        'Las fechas deben tener formato ISO 8601 valido',
      );
    }

    if (fin <= inicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la de inicio',
      );
    }

    return {
      fechaHoraInicio: inicio,
      fechaHoraFin: fin,
    };
  }

  private defaultInclude(includeUser = false) {
    return {
      mesa: {
        select: {
          id: true,
          orden: true,
          asientos: true,
          esDePago: true,
        },
      },
      user: includeUser
        ? {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
            },
          }
        : false,
    };
  }
}
