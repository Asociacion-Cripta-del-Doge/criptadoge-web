import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
