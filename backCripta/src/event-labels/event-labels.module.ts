import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventLabel, EventLabelSchema } from './schemas/event-label.schema';
import { EventLabelsService } from './event-labels.service';
import { EventLabelsController } from './event-labels.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLabel.name, schema: EventLabelSchema },
    ]),
  ],
  controllers: [EventLabelsController],
  providers: [EventLabelsService],
  exports: [EventLabelsService],
})
export class EventLabelsModule {}
