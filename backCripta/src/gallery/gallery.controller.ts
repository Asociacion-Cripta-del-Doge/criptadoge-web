import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryPhotoDto } from './dto/create-gallery-photo.dto';
import { CreateGalleryCommentDto } from './dto/create-gallery-comment.dto';
import { UpdateGalleryPhotoDto } from './dto/update-gallery-photo.dto';
import { UpdateGalleryCommentDto } from './dto/update-gallery-comment.dto';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post()
  create(@Body() createGalleryPhotoDto: CreateGalleryPhotoDto) {
    return this.galleryService.create(createGalleryPhotoDto);
  }

  @Get()
  findAll() {
    return this.galleryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGalleryPhotoDto: UpdateGalleryPhotoDto) {
    return this.galleryService.update(+id, updateGalleryPhotoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(+id);
  }
}
