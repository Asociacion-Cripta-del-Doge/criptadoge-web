import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

export class UpdatePackConfigDto {
  price?: number;
  cardsPerPack?: number;
  packCoverImageUrl?: string | null;
  isActive?: boolean;
}

export class UploadPackCoverDto {
  base64!: string;
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  /* ── Pack Config ────────────────────────────────────────────────
     Devuelve la config activa. Si no existe, la crea con defaults. */
  async getPackConfig() {
    const config = await this.prisma.packConfig.findFirst({
      where: { isActive: true },
      orderBy: { id: 'desc' },
    });
    if (config) return config;

    /* Primera vez: crear config por defecto */
    return this.prisma.packConfig.create({ data: {} });
  }

  async updatePackConfig(dto: UpdatePackConfigDto) {
    const config = await this.getPackConfig();
    return this.prisma.packConfig.update({
      where: { id: config.id },
      data: dto,
    });
  }

  async uploadPackCover(base64: string) {
    const config = await this.getPackConfig();
    const packCoverImageUrl = await this.cloudinary.uploadPackCoverImage(base64);

    return this.prisma.packConfig.update({
      where: { id: config.id },
      data: { packCoverImageUrl },
    });
  }

  /* ── Estadísticas de cartas ─────────────────────────────────────
     Para cada carta devuelve cuántos usuarios la tienen y
     la cantidad total de copias en circulación.                   */
  async getCardStats() {
    const cards = await this.prisma.card.findMany({
      orderBy: { id: 'asc' },
      include: {
        collection: { select: { id: true, name: true } },
        _count: { select: { userCards: true } },
      },
    });

    const totals = await this.prisma.userCard.groupBy({
      by: ['cardId'],
      _sum: { quantity: true },
    });

    const totalMap = new Map(totals.map(t => [t.cardId, t._sum.quantity ?? 0]));

    return cards.map(card => ({
      id: card.id,
      name: card.name,
      rarity: card.rarity,
      dropWeight: card.dropWeight,
      imageUrl: card.imageUrl,
      collection: card.collection,
      ownersCount: card._count.userCards,
      totalCopies: totalMap.get(card.id) ?? 0,
    }));
  }

  /* ── Resumen general ────────────────────────────────────────────
     Números rápidos para el dashboard del admin.                  */
  async getDashboardSummary() {
    const [
      totalCards,
      totalCollections,
      totalPacks,
      totalUsers,
      packsOpened,
    ] = await Promise.all([
      this.prisma.card.count(),
      this.prisma.collection.count(),
      this.prisma.pack.count(),
      this.prisma.user.count(),
      this.prisma.pack.count({ where: { openedAt: { not: null } } }),
    ]);

    return {
      totalCards,
      totalCollections,
      totalPacks,
      totalUsers,
      packsOpened,
      packsUnopened: totalPacks - packsOpened,
    };
  }
}
