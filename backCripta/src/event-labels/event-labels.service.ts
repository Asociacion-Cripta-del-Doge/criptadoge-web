import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { EventLabel, EventLabelDocument } from './schemas/event-label.schema';
import { CreateEventLabelDto } from './dto/create-event-label.dto';
import { UpdateEventLabelDto } from './dto/update-event-label.dto';
import { Event, EventDocument } from '../events/schemas/events.schema';

@Injectable()
export class EventLabelsService {
  constructor(
    @InjectModel(EventLabel.name)
    private eventLabelModel: Model<EventLabelDocument>,
    @InjectModel(Event.name)
    private eventModel: Model<EventDocument>,
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

  async update(id: string, dto: UpdateEventLabelDto): Promise<EventLabel> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    const current = await this.eventLabelModel.findById(id).exec();
    if (!current) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    try {
      const updated = await this.eventLabelModel
        .findByIdAndUpdate(id, dto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updated) {
        throw new NotFoundException('Etiqueta no encontrada');
      }

      if (dto.name && dto.name !== current.name) {
        await this.eventModel
          .updateMany({ label: current.name }, { $set: { label: dto.name } })
          .exec();
      }

      return updated;
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

    const label = await this.eventLabelModel.findById(id).exec();
    if (!label) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    const eventsUsingLabel = await this.eventModel
      .countDocuments({ label: label.name })
      .exec();

    if (eventsUsingLabel > 0) {
      throw new ConflictException(
        `No se puede eliminar la etiqueta "${label.name}" porque esta en uso`,
      );
    }

    await this.eventLabelModel.findByIdAndDelete(id).exec();
  }
}
