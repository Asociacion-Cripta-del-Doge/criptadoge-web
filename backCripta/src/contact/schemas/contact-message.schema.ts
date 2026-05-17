import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContactMessageDocument = HydratedDocument<ContactMessage>;
export const CONTACT_MESSAGE_STATUSES = [
  'pendiente',
  'en_proceso',
  'respondido',
  'resuelto',
  'archivado',
] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

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

  @Prop({ enum: CONTACT_MESSAGE_STATUSES, default: 'pendiente' })
  estado!: ContactMessageStatus;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
