import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventLabelDocument = HydratedDocument<EventLabel>;

@Schema({ timestamps: true })
export class EventLabel {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  color?: string;
}

export const EventLabelSchema = SchemaFactory.createForClass(EventLabel);
