import {
  Controller, Get, Post, Param, ParseIntPipe, UseGuards, Req,
} from '@nestjs/common';
import { PacksService } from './packs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/* El precio del sobre es público; la gestión de sobres requiere sesión. */
@Controller('packs')
export class PacksController {
  constructor(private readonly packsService: PacksService) {}

  /* GET /packs/price — precio del sobre y cartas que contiene */
  @Get('price')
  getPackPrice() {
    return this.packsService.getPackPrice();
  }

  /* GET /packs/my — sobres del usuario autenticado (abiertos y cerrados) */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyPacks(@Req() req: any) {
    return this.packsService.findMyPacks(req.user.id);
  }

  /* POST /packs/buy — compra un sobre descontando monedas
     Devuelve el Pack creado con sus cartas incluidas.       */
  @Post('buy')
  @UseGuards(JwtAuthGuard)
  buyPack(@Req() req: any) {
    return this.packsService.buyPack(req.user.id);
  }

  /* POST /packs/:id/open — abre un sobre, añade cartas a la colección
     Devuelve array de Card con las cartas obtenidas.               */
  @Post(':id/open')
  @UseGuards(JwtAuthGuard)
  openPack(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.packsService.openPack(id, req.user.id);
  }
}
