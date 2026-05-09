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
      },
      reservaMesa: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { asientosReservados: 0 },
        }),
        create: jest.fn().mockResolvedValue({ id: 'reserva-id' }),
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
});
