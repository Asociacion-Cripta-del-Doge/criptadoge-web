import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { EventLabel, EventLabelDocument } from './schemas/event-label.schema';
import { CreateEventLabelDto } from './dto/create-event-label.dto';

@Injectable()
export class EventLabelsService {
  constructor(
    @InjectModel(EventLabel.name)
    private eventLabelModel: Model<EventLabelDocument>,
  ) {}

  async findAll(): Promise<EventLabel[]> {
    return this.eventLabelModel.find().exec();
  }

  async create(dto: CreateEventLabelDto): Promise<EventLabel> {
    try {
      const created = new this.eventLabelModel(dto);
      return await created.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException(`La etiqueta "${dto.name}" ya existe`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Etiqueta no encontrada');
    }
    const result = await this.eventLabelModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Etiqueta no encontrada');
    }
  }
}
