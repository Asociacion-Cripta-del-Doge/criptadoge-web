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
import { ConsultaHuecosDto } from './dto/consulta-huecos.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';

const ACTIVE_RESERVATION_STATES = [
  EstadoReservaMesa.PENDIENTE,
  EstadoReservaMesa.CONFIRMADA,
];
const MIN_RESERVED_SEATS = 2;
const PAID_SEAT_PRICE_EUROS = 1.25;
const ACTIVE_USER_STATUS = 'Activo';
const DEACTIVATED_USER_STATUS = 'Desactivado';
const ACTIVE_MEMBER_FREE_PAID_MINUTES = 60;

/**
 * Horario provisional visible en la web. Se usa como ventana por defecto para
 * calcular huecos libres cuando el cliente no envia un rango personalizado.
 */
const SERVER_BOOKING_SCHEDULE = {
  duracionFranjaMinutos: 60,
  porDiaSemana: [
    { dia: 'domingo', horaApertura: '11:00', horaCierre: '20:00' },
    { dia: 'lunes', horaApertura: '17:00', horaCierre: '22:00' },
    { dia: 'martes', horaApertura: '17:00', horaCierre: '22:00' },
    { dia: 'miercoles', horaApertura: '17:00', horaCierre: '22:00' },
    { dia: 'jueves', horaApertura: '17:00', horaCierre: '22:00' },
    { dia: 'viernes', horaApertura: '17:00', horaCierre: '00:00' },
    { dia: 'sabado', horaApertura: '11:00', horaCierre: '00:00' },
  ],
};

@Injectable()
export class ReservasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una reserva para el usuario autenticado si la mesa tiene asientos
   * suficientes en el rango solicitado. Las reservas parciales no bloquean la
   * mesa completa: solo consumen el numero de asientos reservados.
   */
  async create(data: CreateReservaDto, userId: string) {
    const range = this.parseRange(data.fechaHoraInicio, data.fechaHoraFin);
    this.validateReservedSeats(data.asientosReservados);
    const user = await this.getBookingUser(userId);

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

    if (availability.mesa.esDePago && user.status !== ACTIVE_USER_STATUS) {
      throw new ForbiddenException(
        'Solo los socios con membresia activa pueden reservar mesas de pago',
      );
    }

    const precio = this.calculatePrice(
      availability.mesa.esDePago,
      data.asientosReservados,
      range.fechaHoraInicio,
      range.fechaHoraFin,
      user.status,
    );

    return this.prisma.reservaMesa.create({
      data: {
        mesaId: data.mesaId,
        userId,
        fechaHoraInicio: range.fechaHoraInicio,
        fechaHoraFin: range.fechaHoraFin,
        asientosReservados: data.asientosReservados,
        precio,
      },
      include: this.defaultInclude(),
    });
  }

  /**
   * Consulta disponibilidad para una mesa concreta y un rango concreto.
   * Devuelve ocupacion y asientos libres considerando reservas solapadas.
   */
  async checkAvailability(query: ConsultaDisponibilidadDto) {
    const range = this.parseRange(query.fechaHoraInicio, query.fechaHoraFin);
    const asientosSolicitados =
      query.asientosReservados ?? MIN_RESERVED_SEATS;
    this.validateReservedSeats(asientosSolicitados);

    return this.getAvailability(
      query.mesaId,
      range.fechaHoraInicio,
      range.fechaHoraFin,
      asientosSolicitados,
    );
  }

  /**
   * Genera huecos libres por franjas horarias usando el horario del servidor.
   * Si `soloGratis` es true, calcula las franjas solo sobre mesas gratuitas.
   */
  async findAvailableSlots(
    query: ConsultaHuecosDto,
    soloGratis = false,
    userId?: string,
  ) {
    const asientosSolicitados =
      query.asientosReservados ?? MIN_RESERVED_SEATS;
    this.validateReservedSeats(asientosSolicitados);
    const duracionMinutos =
      query.duracionMinutos ?? SERVER_BOOKING_SCHEDULE.duracionFranjaMinutos;
    const scheduleRange = this.parseScheduleRange(query, duracionMinutos);
    const user = userId ? await this.getBookingUser(userId) : null;
    const onlyFreeTables =
      soloGratis || Boolean(user && user.status !== ACTIVE_USER_STATUS);

    const mesas = await this.prisma.mesa.findMany({
      where: onlyFreeTables ? { esDePago: false } : undefined,
      orderBy: { orden: 'asc' },
      select: { id: true, orden: true, asientos: true, esDePago: true },
    });

    const reservas = await this.prisma.reservaMesa.findMany({
      where: {
        estado: { in: ACTIVE_RESERVATION_STATES },
        fechaHoraInicio: { lt: scheduleRange.fin },
        fechaHoraFin: { gt: scheduleRange.inicio },
        mesa: onlyFreeTables ? { esDePago: false } : undefined,
      },
      select: {
        mesaId: true,
        fechaHoraInicio: true,
        fechaHoraFin: true,
        asientosReservados: true,
      },
    });

    const slots = this.buildSlots(
      scheduleRange.inicio,
      scheduleRange.fin,
      duracionMinutos,
    ).map((slot) => {
      const mesasDisponibles = mesas
        .map((mesa) => {
          const asientosOcupados = reservas
            .filter(
              (reserva) =>
                reserva.mesaId === mesa.id &&
                reserva.fechaHoraInicio < slot.fechaHoraFin &&
                reserva.fechaHoraFin > slot.fechaHoraInicio,
            )
            .reduce((total, reserva) => total + reserva.asientosReservados, 0);
          const asientosDisponibles = mesa.asientos - asientosOcupados;

          return {
            ...mesa,
            asientosOcupados,
            asientosDisponibles,
            disponible: asientosDisponibles >= asientosSolicitados,
          };
        })
        .filter((mesa) => mesa.disponible);

      return {
        fechaHoraInicio: slot.fechaHoraInicio,
        fechaHoraFin: slot.fechaHoraFin,
        horaInicio: this.formatTime(slot.fechaHoraInicio),
        horaFin: this.formatTime(slot.fechaHoraFin),
        asientosSolicitados,
        asientosDisponiblesTotales: mesasDisponibles.reduce(
          (total, mesa) => total + mesa.asientosDisponibles,
          0,
        ),
        mesasDisponibles,
      };
    });

    return {
      fecha: query.fecha,
      soloGratis: onlyFreeTables,
      horario: {
        dia: scheduleRange.dia,
        horaApertura: this.formatTime(scheduleRange.inicio),
        horaCierre: scheduleRange.horaCierre,
        duracionFranjaMinutos: duracionMinutos,
      },
      slots: slots.filter((slot) => slot.mesasDisponibles.length > 0),
    };
  }

  /**
   * Lista las reservas del usuario autenticado con la informacion basica de la
   * mesa, sin exponer datos de otros usuarios.
   */
  async findOwn(userId: string) {
    return this.prisma.reservaMesa.findMany({
      where: { userId },
      orderBy: { fechaHoraInicio: 'desc' },
      include: this.defaultInclude(),
    });
  }

  /**
   * Lista todas las reservas para administracion, incluyendo datos basicos del
   * usuario propietario.
   */
  async findAll() {
    return this.prisma.reservaMesa.findMany({
      orderBy: { fechaHoraInicio: 'desc' },
      include: this.defaultInclude(true),
    });
  }

  /**
   * Cancela una reserva conservando el historico. Puede hacerlo el propietario
   * de la reserva o un ADMIN; no permite cancelar reservas completadas.
   */
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
    /**
     * Hay solape cuando una reserva empieza antes de que termine el rango
     * consultado y termina despues de que empiece. En ese caso suma asientos,
     * no bloquea la mesa entera.
     */
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

  private async getBookingUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });

    if (!user || user.status === DEACTIVATED_USER_STATUS) {
      throw new ForbiddenException('Usuario no autorizado para reservar mesas');
    }

    return user;
  }

  private parseScheduleRange(
    query: ConsultaHuecosDto,
    duracionMinutos: number,
  ) {
    /**
     * Permite acotar el calculo dentro del horario oficial del dia, pero evita
     * pedir huecos fuera de apertura. Los cierres a 00:00 se tratan como el
     * inicio del dia siguiente.
     */
    const schedule = this.getScheduleForDate(query.fecha);
    const inicio =
      query.desde ??
      this.buildServerDateTime(query.fecha, schedule.horaApertura);
    const fin =
      query.hasta ?? this.buildServerDateTime(query.fecha, schedule.horaCierre);
    const range = this.parseRange(inicio, fin);

    if (
      range.fechaHoraInicio < schedule.inicio ||
      range.fechaHoraFin > schedule.fin
    ) {
      throw new BadRequestException(
        'El rango de huecos debe estar dentro del horario de apertura',
      );
    }

    const durationInMs = duracionMinutos * 60 * 1000;

    if (
      range.fechaHoraInicio.getTime() + durationInMs >
      range.fechaHoraFin.getTime()
    ) {
      throw new BadRequestException(
        'La duracion de la franja no cabe dentro del horario consultado',
      );
    }

    return {
      inicio: range.fechaHoraInicio,
      fin: range.fechaHoraFin,
      dia: schedule.dia,
      horaCierre: schedule.horaCierre,
    };
  }

  private buildSlots(inicio: Date, fin: Date, duracionMinutos: number) {
    const slots: { fechaHoraInicio: Date; fechaHoraFin: Date }[] = [];
    const durationInMs = duracionMinutos * 60 * 1000;

    for (
      let cursor = inicio.getTime();
      cursor + durationInMs <= fin.getTime();
      cursor += durationInMs
    ) {
      slots.push({
        fechaHoraInicio: new Date(cursor),
        fechaHoraFin: new Date(cursor + durationInMs),
      });
    }

    return slots;
  }

  private buildServerDateTime(fecha: string, hora: string) {
    const date = new Date(`${fecha}T00:00:00.000Z`);
    const [hours, minutes] = hora.split(':').map(Number);

    if (hora === '00:00') {
      date.setUTCDate(date.getUTCDate() + 1);
    }

    date.setUTCHours(hours, minutes, 0, 0);
    return date.toISOString();
  }

  private formatTime(date: Date) {
    return date.toISOString().slice(11, 16);
  }

  private calculatePrice(
    esDePago: boolean,
    asientosReservados: number,
    fechaHoraInicio: Date,
    fechaHoraFin: Date,
    userStatus: string,
  ) {
    if (!esDePago) {
      return 0;
    }

    const durationInMinutes =
      (fechaHoraFin.getTime() - fechaHoraInicio.getTime()) / (60 * 1000);
    const freeMinutes =
      userStatus === ACTIVE_USER_STATUS ? ACTIVE_MEMBER_FREE_PAID_MINUTES : 0;
    const billableHours = Math.max(0, durationInMinutes - freeMinutes) / 60;

    return (
      Math.round(
        asientosReservados * PAID_SEAT_PRICE_EUROS * billableHours * 100,
      ) / 100
    );
  }

  private validateReservedSeats(asientosReservados: number) {
    if (asientosReservados % 2 !== 0) {
      throw new BadRequestException('Solo se pueden reservar asientos pares');
    }
  }

  private getScheduleForDate(fecha: string) {
    const date = new Date(`${fecha}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
    }

    const schedule = SERVER_BOOKING_SCHEDULE.porDiaSemana[date.getUTCDay()];
    const inicio = new Date(
      this.buildServerDateTime(fecha, schedule.horaApertura),
    );
    const fin = new Date(this.buildServerDateTime(fecha, schedule.horaCierre));

    return {
      ...schedule,
      inicio,
      fin,
    };
  }
}
