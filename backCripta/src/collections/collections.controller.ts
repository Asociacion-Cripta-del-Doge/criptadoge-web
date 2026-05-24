import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { CollectionsService, CreateCollectionDto, UpdateCollectionDto } from './collections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  /* GET /collections — lista pública (para mostrar en la web) */
  @Get()
  findAll() {
    return this.collectionsService.findAll();
  }

  /* GET /collections/:id — detalle con sus cartas */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.collectionsService.findOne(id);
  }

  /* POST /collections — crear colección (solo admin) */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  /* PATCH /collections/:id — editar colección (solo admin) */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, dto);
  }

  /* DELETE /collections/:id — borrar colección (solo admin) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.collectionsService.remove(id);
  }

  /* POST /collections/:id/image — subir portada a Cloudinary (solo admin)
     Body: { base64: "data:image/png;base64,..." } */
  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @Body('base64') base64: string,
  ) {
    return this.collectionsService.uploadImage(id, base64);
  }
}
