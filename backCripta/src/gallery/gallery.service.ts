import { Injectable } from '@nestjs/common';
import { CreateGalleryPhotoDto } from './dto/create-gallery-photo.dto';
import { UpdateGalleryPhotoDto } from './dto/update-gallery-photo.dto';
import { GalleryPhoto, GalleryPhotoDocument } from './dto/schemas/gallery-photo.schema';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { GalleryComment, GalleryCommentDocument } from './dto/schemas/gallery-comment.schema';
import { Multer } from 'multer';

@Injectable()
export class GalleryService {
  constructor(
      @InjectModel(GalleryPhoto.name)
      private galleryPhotoModel: Model<GalleryPhotoDocument>,
      @InjectModel(GalleryComment.name)
      private galleryCommentModel: Model<GalleryCommentDocument>,
      private configService: ConfigService,
    ) {}

  async createPhoto(
    dto: CreateGalleryPhotoDto,
    file: Express.Multer.File,
    user: any,
    ) {
    const photo = await this.galleryPhotoModel.create({
      title: dto.title,
      description: dto.description,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      imageUrl: `/uploads/gallery/${file.filename}`,
      uploadedBy: user.id,
      uploadedByName: user.name,
      isVisible: true,
    });

    return photo.save();
    // return this.mapPhoto(photo);
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
