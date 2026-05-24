import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GrantUserCoinsDto } from './dto/grant-user-coins.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        select: {
          id: true,
          dni: true,
          name: true,
          email: true,
          role: true,
          status: true,
          coins: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('El email o DNI ya está registrado');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        dni: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastRenewal: true,
        expirationDate: true,
        coins: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        dni: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastRenewal: true,
        expirationDate: true,
        coins: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findBasicInfo(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, status: true },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          dni: true,
          name: true,
          email: true,
          role: true,
          status: true,
          coins: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('El email o DNI ya está registrado');
      }
      throw error;
    }
  }

  async renewMembership(id: string) {
    const today = new Date();
    const expiration = new Date(today);
    expiration.setMonth(expiration.getMonth() + 1);

    const format = (d: Date) => d.toISOString().split('T')[0];

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          status: 'Activo',
          lastRenewal: format(today),
          expirationDate: format(expiration),
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          lastRenewal: true,
          expirationDate: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }

  async grantCoins(id: string, data: GrantUserCoinsDto) {
    const reason = data.reason?.trim() || 'manual_grant';

    try {
      const [user] = await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id },
          data: { coins: { increment: data.amount } },
          select: { coins: true },
        }),
        this.prisma.coinTransaction.create({
          data: { userId: id, amount: data.amount, reason },
        }),
      ]);

      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          status: 'Desactivado',
        },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          lastRenewal: true,
          expirationDate: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }
}
