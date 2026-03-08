import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

export const EVENT_STATUSES = ['Próximo', 'En curso', 'Finalizado'] as const;

export class Attendee {
  userId: string;
  joinedAt: Date;
}

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, index: true })
  date!: string;

  @Prop()
  time?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EventLabel', required: true })
  label!: MongooseSchema.Types.ObjectId;

  @Prop({ default: 'Próximo', enum: EVENT_STATUSES })
  status!: string;

  @Prop({
    type: [{ userId: { type: String, required: true }, joinedAt: { type: Date, default: Date.now } }],
    default: [],
  })
  attendees!: Attendee[];
}

export const EventSchema = SchemaFactory.createForClass(Event);
