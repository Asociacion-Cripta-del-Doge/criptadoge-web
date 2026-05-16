import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { GalleryPhoto, GalleryPhotoSchema } from './dto/schemas/gallery-photo.schema';
import { GalleryComment, GalleryCommentSchema } from './dto/schemas/gallery-comment.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: GalleryPhoto.name, schema: GalleryPhotoSchema },
      { name: GalleryComment.name, schema: GalleryCommentSchema },
    ]),
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
