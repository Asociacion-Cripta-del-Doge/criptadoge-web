import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GalleryPhotoDocument = HydratedDocument<GalleryPhoto>;

@Schema({ timestamps: true })
export class GalleryPhoto {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  originalName!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  size!: number;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: true })
  uploadedBy!: string;

  @Prop()
  uploadedByName?: string;

  @Prop({ required: true })
  isVisible!: boolean;
}

export const GalleryPhotoSchema = SchemaFactory.createForClass(GalleryPhoto);
