import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AdminService, UpdatePackConfigDto } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

/* Todos los endpoints de este módulo son exclusivos de ADMIN */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /* GET /admin/dashboard — resumen rápido para el panel */
  @Get('dashboard')
  getDashboardSummary() {
    return this.adminService.getDashboardSummary();
  }

  /* GET /admin/pack-config — configuración actual de los sobres */
  @Get('pack-config')
  getPackConfig() {
    return this.adminService.getPackConfig();
  }

  /* PATCH /admin/pack-config — actualizar precio, cartas/sobre, etc.
     Body: { price?, cardsPerPack?, isActive? }                     */
  @Patch('pack-config')
  updatePackConfig(@Body() dto: UpdatePackConfigDto) {
    return this.adminService.updatePackConfig(dto);
  }

  /* GET /admin/cards/stats — posesión y distribución de cartas */
  @Get('cards/stats')
  getCardStats() {
    return this.adminService.getCardStats();
  }
}
