import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GalleryService } from './gallery.service';
import { CreateGalleryPhotoDto } from './dto/create-gallery-photo.dto';
import { CreateGalleryCommentDto } from './dto/create-gallery-comment.dto';
import { UpdateGalleryPhotoDto } from './dto/update-gallery-photo.dto';
import { UpdateGalleryCommentDto } from './dto/update-gallery-comment.dto';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) { }

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  create(@Body() createGalleryPhotoDto: CreateGalleryPhotoDto, file: Express.Multer.File, @Req() req: Request) {
    return this.galleryService.createPhoto(createGalleryPhotoDto, file, req.user);
  }

  @Get()
  findAll() {
    return this.galleryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateGalleryPhotoDto: UpdateGalleryPhotoDto) {
    return this.galleryService.update(+id, updateGalleryPhotoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(+id);
  }
}
