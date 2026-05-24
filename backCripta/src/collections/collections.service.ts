import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export class CreateCollectionDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export class UpdateCollectionDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class CollectionsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  findAll() {
    return this.prisma.collection.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { cards: true } } },
    });
  }

  async findOne(id: number) {
    const col = await this.prisma.collection.findUnique({
      where: { id },
      include: { cards: true, _count: { select: { cards: true } } },
    });
    if (!col) throw new NotFoundException(`Colección #${id} no encontrada`);
    return col;
  }

  create(dto: CreateCollectionDto) {
    return this.prisma.collection.create({ data: dto });
  }

  async update(id: number, dto: UpdateCollectionDto) {
    await this.findOne(id);
    return this.prisma.collection.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.collection.delete({ where: { id } });
  }

  async uploadImage(id: number, base64: string) {
    await this.findOne(id);
    const imageUrl = await this.cloudinary.uploadCollectionImage(base64, id);
    return this.prisma.collection.update({ where: { id }, data: { imageUrl } });
  }
}
