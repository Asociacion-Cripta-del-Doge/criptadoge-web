import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  date!: string;

  @Prop()
  time?: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ default: 'Próximo' })
  status!: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
