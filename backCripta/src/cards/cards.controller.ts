import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, UseGuards, Req,
} from '@nestjs/common';
import { CardsService, CreateCardDto, UpdateCardDto } from './cards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  /* GET /cards — lista pública de cartas (para mostrar en el álbum) */
  @Get()
  findAll() {
    return this.cardsService.findAll();
  }

  /* GET /cards/my — cartas del usuario autenticado con cantidad */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyCards(@Req() req: any) {
    return this.cardsService.findMyCards(req.user.id);
  }

  /* GET /cards/:id — detalle de una carta */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cardsService.findOne(id);
  }

  /* POST /cards — crea una carta (solo admin)
     Body: { name, rarity, dropWeight } */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateCardDto) {
    return this.cardsService.create(dto);
  }

  /* PATCH /cards/:id — edita nombre, rareza o peso (solo admin) */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCardDto,
  ) {
    return this.cardsService.update(id, dto);
  }

  /* DELETE /cards/:id — elimina una carta (solo admin) */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cardsService.remove(id);
  }

  /* POST /cards/:id/image — sube la imagen de la carta a Cloudinary (solo admin)
     Body: { base64: "data:image/png;base64,..." } */
  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @Body('base64') base64: string,
  ) {
    return this.cardsService.uploadImage(id, base64);
  }
}
