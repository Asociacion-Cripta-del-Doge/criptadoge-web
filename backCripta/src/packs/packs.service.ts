import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PacksService {
  constructor(private prisma: PrismaService) {}

  /* Obtiene la config activa de sobres desde BD. Crea defaults si no existe. */
  private async getConfig() {
    const config = await this.prisma.packConfig.findFirst({
      where: { isActive: true },
      orderBy: { id: 'desc' },
    });
    if (config) return config;
    return this.prisma.packConfig.create({ data: {} });
  }

  /* ── Sobres del usuario ────────────────────────────────────────
     Devuelve todos los sobres (abiertos y sin abrir) con sus
     cartas incluidas, ordenados del más reciente al más antiguo. */
  async findMyPacks(userId: string) {
    return this.prisma.pack.findMany({
      where: { userId },
      include: {
        cards: { include: { card: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ── Comprar sobre ─────────────────────────────────────────────
     1. Comprueba que el usuario tenga monedas suficientes.
     2. Sortea CARDS_PER_PACK cartas con el algoritmo ponderado.
     3. En una transacción atómica:
        - Crea el Pack con sus PackCards.
        - Descuenta las monedas del usuario.
        - Registra la transacción de gasto.                     */
  async buyPack(userId: string) {
    const [user, config] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.getConfig(),
    ]);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.coins < config.price) {
      throw new BadRequestException(
        `Monedas insuficientes. Necesitas ${config.price}, tienes ${user.coins}.`,
      );
    }

    /* Cargamos todas las cartas para el sorteo ponderado */
    const allCards = await this.prisma.card.findMany({
      select: { id: true, dropWeight: true },
    });
    if (allCards.length < config.cardsPerPack) {
      throw new BadRequestException('No hay cartas suficientes en el sistema.');
    }

    const drawnIds = this.weightedDraw(allCards, config.cardsPerPack);

    /* Transacción atómica: crear sobre + descontar monedas + registrar gasto */
    const [pack] = await this.prisma.$transaction([
      this.prisma.pack.create({
        data: {
          userId,
          cards: {
            create: drawnIds.map(cardId => ({ cardId })),
          },
        },
        include: { cards: { include: { card: true } } },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: config.price } },
      }),
      this.prisma.coinTransaction.create({
        data: { userId, amount: -config.price, reason: 'pack_purchase' },
      }),
    ]);

    return pack;
  }

  /* ── Abrir sobre ───────────────────────────────────────────────
     Marca el sobre como abierto y añade las cartas a la colección
     del usuario. Si la carta ya existe, incrementa la cantidad
     (duplicado). Solo el propietario puede abrir su propio sobre. */
  async openPack(packId: number, userId: string) {
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: { cards: { include: { card: true } } },
    });

    if (!pack)              throw new NotFoundException('Sobre no encontrado');
    if (pack.userId !== userId) throw new ForbiddenException();
    if (pack.openedAt)      throw new BadRequestException('Este sobre ya fue abierto');

    /* Marcar como abierto */
    await this.prisma.pack.update({
      where: { id: packId },
      data: { openedAt: new Date() },
    });

    /* Añadir cartas a UserCard (upsert: create o incrementa quantity) */
    await Promise.all(
      pack.cards.map(pc =>
        this.prisma.userCard.upsert({
          where: { userId_cardId: { userId, cardId: pc.cardId } },
          create: { userId, cardId: pc.cardId, quantity: 1 },
          update: { quantity: { increment: 1 } },
        }),
      ),
    );

    /* Devuelve las cartas obtenidas para mostrar en la animación */
    return pack.cards.map(pc => pc.card);
  }

  /* Devuelve el precio y cartas por sobre (para mostrar en la UI) */
  async getPackPrice() {
    const config = await this.getConfig();
    return {
      price: config.price,
      cardsPerPack: config.cardsPerPack,
      packCoverImageUrl: config.packCoverImageUrl,
    };
  }

  /* ── Sorteo ponderado sin reemplazo ────────────────────────────
     Algoritmo:
     1. Calcula la suma total de pesos.
     2. Genera un número aleatorio entre 0 y esa suma.
     3. Recorre las cartas restando su peso hasta llegar al número.
     4. La carta en la que se cruza el umbral es la elegida.
     5. Se elimina del pool para evitar duplicados en el mismo sobre. */
  private weightedDraw(
    cards: { id: number; dropWeight: number }[],
    count: number,
  ): number[] {
    const pool   = [...cards];
    const result: number[] = [];

    for (let i = 0; i < count && pool.length > 0; i++) {
      const total = pool.reduce((sum, c) => sum + c.dropWeight, 0);
      let rand = Math.random() * total;

      for (let j = 0; j < pool.length; j++) {
        rand -= pool[j].dropWeight;
        if (rand <= 0) {
          result.push(pool[j].id);
          pool.splice(j, 1);  // elimina del pool (sin reemplazo)
          break;
        }
      }
    }

    return result;
  }
}
