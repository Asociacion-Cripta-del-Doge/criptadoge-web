import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReservasController } from './reservas.controller';
import { ReservasGateway } from './reservas.gateway';
import { ReservasService } from './reservas.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReservasController],
  providers: [ReservasService, ReservasGateway],
})
export class ReservasModule {}
