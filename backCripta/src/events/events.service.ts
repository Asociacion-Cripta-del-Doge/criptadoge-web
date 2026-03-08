import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Event, EventDocument } from './schemas/events.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().populate('label').exec();
  }

  async findOne(id: string): Promise<Event> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID de evento inválido');
    }

    const event = await this.eventModel.findById(id).populate('label').exec();

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    return event;
  }

  async remove(id: string): Promise<Event> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID de evento inválido');
    }

    const event = await this.eventModel.findByIdAndDelete(id).exec();

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID de evento inválido');
    }

    const event = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .populate('label')
      .exec();

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    return event;
  }
}
