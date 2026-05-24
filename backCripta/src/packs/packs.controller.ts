import {
  Controller, Get, Post, Param, ParseIntPipe, UseGuards, Req,
} from '@nestjs/common';
import { PacksService } from './packs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/* Todos los endpoints requieren sesión iniciada */
@Controller('packs')
@UseGuards(JwtAuthGuard)
export class PacksController {
  constructor(private readonly packsService: PacksService) {}

  /* GET /packs/price — precio del sobre y cartas que contiene */
  @Get('price')
  getPackPrice() {
    return this.packsService.getPackPrice();
  }

  /* GET /packs/my — sobres del usuario autenticado (abiertos y cerrados) */
  @Get('my')
  findMyPacks(@Req() req: any) {
    return this.packsService.findMyPacks(req.user.id);
  }

  /* POST /packs/buy — compra un sobre descontando monedas
     Devuelve el Pack creado con sus cartas incluidas.       */
  @Post('buy')
  buyPack(@Req() req: any) {
    return this.packsService.buyPack(req.user.id);
  }

  /* POST /packs/:id/open — abre un sobre, añade cartas a la colección
     Devuelve array de Card con las cartas obtenidas.               */
  @Post(':id/open')
  openPack(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.packsService.openPack(id, req.user.id);
  }
}
