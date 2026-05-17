import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReservasService } from './reservas.service';

describe('ReservasService', () => {
  const reservaDto = {
    mesaId: 'b263a388-317c-46b4-9f98-b4a39c724d98',
    fechaHoraInicio: '2026-05-10T18:00:00.000Z',
    fechaHoraFin: '2026-05-10T20:00:00.000Z',
    asientosReservados: 2,
  };
  const userId = 'a77236db-4a92-441b-a4ab-26d59f0bc5a7';

  const buildService = (
    mesa: { asientos: number; esDePago: boolean },
    userStatus = 'Activo',
    reservasDelDia = 0,
  ) => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: userId,
          status: userStatus,
        }),
      },
      mesa: {
        findUnique: jest.fn().mockResolvedValue({
          id: reservaDto.mesaId,
          orden: 1,
          ...mesa,
        }),
        findMany: jest.fn().mockResolvedValue([
          {
            id: reservaDto.mesaId,
            orden: 1,
            ...mesa,
          },
        ]),
      },
      reservaMesa: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { asientosReservados: 0 },
        }),
        count: jest.fn().mockResolvedValue(reservasDelDia),
        create: jest.fn().mockResolvedValue({ id: 'reserva-id' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    return {
      prisma,
      service: new ReservasService(prisma as never),
    };
  };

  it('guarda el precio proporcional en mesas de pago', async () => {
    const { prisma, service } = buildService({
      asientos: 4,
      esDePago: true,
    });

    await service.create(reservaDto, userId);

    expect(prisma.reservaMesa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          asientosReservados: 2,
          precio: 2.5,
        }),
      }),
    );
  });

  it('deja el precio a 0 en mesas gratuitas', async () => {
    const { prisma, service } = buildService({
      asientos: 4,
      esDePago: false,
    });

    await service.create(reservaDto, userId);

    expect(prisma.reservaMesa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          precio: 0,
        }),
      }),
    );
  });

  it('aplica una hora gratis a socios activos en mesas de pago', async () => {
    const { prisma, service } = buildService({
      asientos: 4,
      esDePago: true,
    });

    await service.create(
      {
        ...reservaDto,
        fechaHoraFin: '2026-05-10T19:00:00.000Z',
      },
      userId,
    );

    expect(prisma.reservaMesa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          precio: 0,
        }),
      }),
    );
  });

  it('rechaza mesas de pago para usuarios sin membresia activa', async () => {
    const { prisma, service } = buildService(
      {
        asientos: 4,
        esDePago: true,
      },
      'Inactivo',
    );

    await expect(service.create(reservaDto, userId)).rejects.toThrow(
      ForbiddenException,
    );
    expect(prisma.reservaMesa.create).not.toHaveBeenCalled();
  });

  it('permite mesas gratuitas para usuarios sin membresia activa', async () => {
    const { prisma, service } = buildService(
      {
        asientos: 4,
        esDePago: false,
      },
      'Inactivo',
    );

    await service.create(reservaDto, userId);

    expect(prisma.reservaMesa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          precio: 0,
        }),
      }),
    );
  });

  it('rechaza reservas con un numero impar de asientos', async () => {
    const { prisma, service } = buildService({
      asientos: 4,
      esDePago: true,
    });

    await expect(
      service.create({ ...reservaDto, asientosReservados: 3 }, userId),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.mesa.findUnique).not.toHaveBeenCalled();
  });

  it('rechaza reservas de mas de 3 horas', async () => {
    const { prisma, service } = buildService({
      asientos: 4,
      esDePago: false,
    });

    await expect(
      service.create(
        {
          ...reservaDto,
          fechaHoraFin: '2026-05-10T22:00:01.000Z',
        },
        userId,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.mesa.findUnique).not.toHaveBeenCalled();
  });

  it('rechaza una segunda reserva diaria para usuarios sin membresia activa', async () => {
    const { prisma, service } = buildService(
      {
        asientos: 4,
        esDePago: false,
      },
      'Inactivo',
      1,
    );

    await expect(service.create(reservaDto, userId)).rejects.toThrow(
      'Los usuarios sin membresia activa solo pueden tener una reserva por dia',
    );
    expect(prisma.reservaMesa.count).toHaveBeenCalledWith({
      where: {
        userId,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
        fechaHoraInicio: {
          gte: new Date('2026-05-10T00:00:00.000Z'),
          lt: new Date('2026-05-11T00:00:00.000Z'),
        },
      },
    });
    expect(prisma.reservaMesa.create).not.toHaveBeenCalled();
  });

  it('no aplica el limite diario de no socios a usuarios con membresia activa', async () => {
    const { prisma, service } = buildService(
      {
        asientos: 4,
        esDePago: true,
      },
      'Activo',
      1,
    );

    await service.create(reservaDto, userId);

    expect(prisma.reservaMesa.count).not.toHaveBeenCalled();
    expect(prisma.reservaMesa.create).toHaveBeenCalled();
  });

  it('genera inicios horarios para reservas de varias horas', async () => {
    const { service } = buildService({
      asientos: 4,
      esDePago: false,
    });

    const response = await service.findAvailableSlots(
      {
        fecha: '2026-05-11',
        asientosReservados: 2,
        duracionMinutos: 180,
      },
      false,
      userId,
    );

    expect(
      response.slots.map((slot) => `${slot.horaInicio}-${slot.horaFin}`),
    ).toEqual(['17:00-20:00', '18:00-21:00', '19:00-22:00']);
  });

  it('genera todos los inicios horarios para reservas de dos horas', async () => {
    const { service } = buildService({
      asientos: 4,
      esDePago: false,
    });

    const response = await service.findAvailableSlots(
      {
        fecha: '2026-05-11',
        asientosReservados: 2,
        duracionMinutos: 120,
      },
      false,
      userId,
    );

    expect(
      response.slots.map((slot) => `${slot.horaInicio}-${slot.horaFin}`),
    ).toEqual([
      '17:00-19:00',
      '18:00-20:00',
      '19:00-21:00',
      '20:00-22:00',
    ]);
  });
});
