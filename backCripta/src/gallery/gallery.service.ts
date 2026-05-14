import { Injectable } from '@nestjs/common';
import { CreateGalleryPhotoDto } from './dto/create-gallery-photo.dto';
import { UpdateGalleryPhotoDto } from './dto/update-gallery-photo.dto';

@Injectable()
export class GalleryService {
  create(createGalleryPhotoDto: CreateGalleryPhotoDto) {
    return 'This action adds a new gallery';
  }

  findAll() {
    return `This action returns all gallery`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gallery`;
  }

  update(id: number, updateGalleryPhotoDto: UpdateGalleryPhotoDto) {
    return `This action updates a #${id} gallery`;
  }

  remove(id: number) {
    return `This action removes a #${id} gallery`;
  }
}
