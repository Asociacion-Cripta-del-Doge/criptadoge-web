import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WebTextDocument = HydratedDocument<WebText>;

export const WEB_TEXT_TYPES = ['text', 'textarea', 'markdown'] as const;
export type WebTextType = (typeof WEB_TEXT_TYPES)[number];

@Schema({ timestamps: true })
export class WebText {
  @Prop({ required: true, trim: true })
  key!: string;

  @Prop({ required: true })
  value!: string;

  @Prop({ required: true, index: true, trim: true })
  section!: string;

  @Prop({ required: true, enum: WEB_TEXT_TYPES, default: 'text' })
  type!: WebTextType;

  @Prop({ required: true, default: 'es', index: true, trim: true })
  locale!: string;
}

export const WebTextSchema = SchemaFactory.createForClass(WebText);

WebTextSchema.index({ key: 1, locale: 1 }, { unique: true });
