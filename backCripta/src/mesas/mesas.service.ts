import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMesaDto) {
    try {
      return await this.prisma.mesa.create({ data });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una mesa con ese orden');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.mesa.findMany({
      orderBy: { orden: 'asc' },
    });
  }

  async findOne(id: string) {
    const mesa = await this.prisma.mesa.findUnique({
      where: { id },
    });

    if (!mesa) {
      throw new NotFoundException('Mesa no encontrada');
    }

    return mesa;
  }

  async update(id: string, data: UpdateMesaDto) {
    try {
      return await this.prisma.mesa.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Mesa no encontrada');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una mesa con ese orden');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.mesa.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Mesa no encontrada');
      }
      throw error;
    }
  }
}
