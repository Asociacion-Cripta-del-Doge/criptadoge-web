import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventLabel, EventLabelSchema } from './schemas/event-label.schema';
import { EventLabelsService } from './event-labels.service';
import { EventLabelsController } from './event-labels.controller';
import { Event, EventSchema } from '../events/schemas/events.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLabel.name, schema: EventLabelSchema },
      { name: Event.name, schema: EventSchema },
    ]),
  ],
  controllers: [EventLabelsController],
  providers: [EventLabelsService],
  exports: [EventLabelsService],
})
export class EventLabelsModule {}
