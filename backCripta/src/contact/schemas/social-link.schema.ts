import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SocialLinkDocument = HydratedDocument<SocialLink>;

@Schema({ timestamps: true })
export class SocialLink {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  handle!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  color!: string;

  @Prop({ required: true })
  icon!: string;

  @Prop({ default: 0 })
  orden!: number;
}

export const SocialLinkSchema = SchemaFactory.createForClass(SocialLink);
