import {
  Controller, Get, Post, Body, UseGuards, Req,
} from '@nestjs/common';
import { CoinsService } from './coins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('coins')
@UseGuards(JwtAuthGuard)
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  /* GET /coins/balance — saldo de monedas del usuario autenticado */
  @Get('balance')
  getBalance(@Req() req: any) {
    return this.coinsService.getBalance(req.user.id);
  }

  /* GET /coins/history — últimas 50 transacciones del usuario */
  @Get('history')
  getHistory(@Req() req: any) {
    return this.coinsService.getHistory(req.user.id);
  }

  /* POST /coins/grant — concede monedas al admin autenticado (solo admin)
     Útil para testing y recompensas manuales.
     Body: { amount: number }                                      */
  @Post('grant')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  grantCoins(
    @Req() req: any,
    @Body('amount') amount: number,
  ) {
    return this.coinsService.grantCoins(req.user.id, amount ?? 500);
  }
}
