import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWebTextDto } from './dto/create-web-text.dto';
import { UpdateWebTextDto } from './dto/update-web-text.dto';
import { WebTextsService } from './web-texts.service';

@Controller('web-texts')
export class WebTextsController {
  constructor(private readonly webTextsService: WebTextsService) {}

  @Get()
  findPublic(@Query('locale') locale = 'es', @Query('section') section?: string) {
    return this.webTextsService.findAll(locale, section);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAdmin(@Query('locale') locale = 'es', @Query('section') section?: string) {
    return this.webTextsService.findAll(locale, section);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateWebTextDto) {
    return this.webTextsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateWebTextDto) {
    return this.webTextsService.update(id, dto);
  }
}
