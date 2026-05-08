import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ConsultaDisponibilidadDto } from './dto/consulta-disponibilidad.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { ReservasService } from './reservas.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReservaDto: CreateReservaDto, @Req() req: Request) {
    const user = (req as AuthenticatedRequest).user;
    return this.reservasService.create(createReservaDto, user.id);
  }

  @Get('disponibilidad')
  @UseGuards(JwtAuthGuard)
  checkAvailability(@Query() query: ConsultaDisponibilidadDto) {
    return this.reservasService.checkAvailability(query);
  }

  @Get('mis-reservas')
  @UseGuards(JwtAuthGuard)
  findOwn(@Req() req: Request) {
    const user = (req as AuthenticatedRequest).user;
    return this.reservasService.findOwn(user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.reservasService.findAll();
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string, @Req() req: Request) {
    const user = (req as AuthenticatedRequest).user;
    return this.reservasService.cancel(id, user.id, user.role);
  }
}
