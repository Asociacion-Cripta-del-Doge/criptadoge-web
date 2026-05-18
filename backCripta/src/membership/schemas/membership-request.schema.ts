import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MembershipRequestDocument = HydratedDocument<MembershipRequest>;

export const MEMBERSHIP_STATUSES = ['Pendiente', 'Revisada', 'Aprobada', 'Rechazada'] as const;

@Schema({ timestamps: true })
export class MembershipRequest {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  birthdate!: string;

  @Prop()
  howDidYouKnow?: string;

  @Prop({ default: 'Pendiente', enum: MEMBERSHIP_STATUSES })
  status!: string;
}

export const MembershipRequestSchema = SchemaFactory.createForClass(MembershipRequest);