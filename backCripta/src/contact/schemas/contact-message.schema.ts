import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactMessageDocument = HydratedDocument<ContactMessage>;

@Schema({ timestamps: true })
export class ContactMessage {
  @Prop({ required: true })
  nombre!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  asunto!: string;

  @Prop({ required: true })
  mensaje!: string;

  @Prop({ default: 'pendiente' })
  estado!: string;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
