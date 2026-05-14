import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GalleryCommentDocument = HydratedDocument<GalleryComment>;

@Schema({ timestamps: true })
export class GalleryComment {
  @Prop({ required: true })
  photoId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userName!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ required: true })
  isVisible!: boolean;
}

export const GalleryCommentSchema = SchemaFactory.createForClass(GalleryComment);
