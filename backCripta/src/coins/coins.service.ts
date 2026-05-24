import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/* ─── Configuración de monedas ──────────────────────────────── */
const WEEKLY_COINS = 50;  // monedas que reciben los socios activos cada semana

@Injectable()
export class CoinsService {
  private readonly logger = new Logger(CoinsService.name);

  constructor(private prisma: PrismaService) {}

  /* Devuelve el saldo actual de monedas del usuario */
  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });
    return { coins: user?.coins ?? 0 };
  }

  /* Devuelve el historial de transacciones (últimas 50) */
  async getHistory(userId: string) {
    return this.prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /*
   * Concede monedas manualmente a un usuario (solo admin).
   * Útil para pruebas y para que los admins puedan recompensar
   * a usuarios manualmente si fuera necesario.
   */
  async grantCoins(userId: string, amount: number) {
    const [user] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } },
        select: { coins: true },
      }),
      this.prisma.coinTransaction.create({
        data: { userId, amount, reason: 'manual_grant' },
      }),
    ]);
    return user;
  }

  /* ── Cron semanal: todos los lunes a las 9:00 ──────────────────
     Concede WEEKLY_COINS monedas a todos los usuarios con
     status = 'Activo'. Lo registra como transacción individual
     para poder mostrar el historial en el perfil.             */
  @Cron('0 9 * * 1')
  async grantWeeklyCoins() {
    const activeMembers = await this.prisma.user.findMany({
      where: { status: 'Activo' },
      select: { id: true },
    });

    if (activeMembers.length === 0) {
      this.logger.log('[Cron] Monedas semanales: ningún socio activo.');
      return;
    }

    /* Actualizamos todos los saldos + creamos transacciones en un solo lote */
    await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { id: { in: activeMembers.map(u => u.id) } },
        data: { coins: { increment: WEEKLY_COINS } },
      }),
      ...activeMembers.map(u =>
        this.prisma.coinTransaction.create({
          data: { userId: u.id, amount: WEEKLY_COINS, reason: 'weekly_reward' },
        }),
      ),
    ]);

    this.logger.log(
      `[Cron] Monedas semanales: ${WEEKLY_COINS} monedas a ${activeMembers.length} socios.`,
    );
  }
}
