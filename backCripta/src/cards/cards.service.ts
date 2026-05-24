import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Rarity } from '@prisma/client';

/* ─── DTOs ──────────────────────────────────────────────────── */
export class CreateCardDto {
  name: string;
  rarity: Rarity;       // COMUN | RARA | EPICA | LEGENDARIA
  dropWeight: number;   // peso para el sorteo ponderado (mayor = más probable)
  collectionId?: number;
}

export class UpdateCardDto {
  name?: string;
  rarity?: Rarity;
  dropWeight?: number;
  collectionId?: number | null;
}

@Injectable()
export class CardsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  /* Lista todas las cartas ordenadas por ID ascendente */
  findAll() {
    return this.prisma.card.findMany({
      orderBy: { id: 'asc' },
      include: { collection: { select: { id: true, name: true } } },
    });
  }

  /* Devuelve una carta o lanza 404 */
  async findOne(id: number) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: { collection: { select: { id: true, name: true } } },
    });
    if (!card) throw new NotFoundException(`Carta #${id} no encontrada`);
    return card;
  }

  /* Crea una nueva carta (solo admin) */
  create(dto: CreateCardDto) {
    return this.prisma.card.create({ data: dto });
  }

  /* Actualiza campos de una carta (solo admin) */
  async update(id: number, dto: UpdateCardDto) {
    await this.findOne(id);  // lanza 404 si no existe
    return this.prisma.card.update({ where: { id }, data: dto });
  }

  /* Elimina una carta (solo admin) */
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.card.delete({ where: { id } });
  }

  /* Devuelve las cartas que posee el usuario con su cantidad */
  findMyCards(userId: string) {
    return this.prisma.userCard.findMany({
      where: { userId },
      include: {
        card: {
          include: { collection: { select: { id: true, name: true } } },
        },
      },
      orderBy: { cardId: 'asc' },
    });
  }

  /*
   * Sube la imagen de una carta a Cloudinary.
   * El admin envía el fichero en base64.
   * Cloudinary redimensiona a 400×560 px (ratio TCG 5:7) y devuelve la URL.
   */
  async uploadImage(id: number, base64: string) {
    const card = await this.findOne(id);
    const imageUrl = await this.cloudinary.uploadCardImage(base64, card.id);
    return this.prisma.card.update({ where: { id }, data: { imageUrl } });
  }
}
