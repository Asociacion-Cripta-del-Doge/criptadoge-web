import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('1 0 * * *')
  async expireMemberships() {
    const today = new Date().toISOString().split('T')[0];

    const result = await this.prisma.user.updateMany({
      where: {
        status: 'Activo',
        expirationDate: { lt: today },
      },
      data: { status: 'Inactivo' },
    });

    this.logger.log(`[Cron] Membresías actualizadas: ${result.count} usuarios han expirado hoy.`);
  }
}
