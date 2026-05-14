import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Event, EventDocument } from './schemas/events.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UsersService } from '../users/users.service';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private usersService: UsersService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async findOne(id: string): Promise<Event> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID de evento inválido');
    }

    const event = await this.eventModel.findById(id).exec();

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
      .findByIdAndUpdate(id, updateEventDto, { returnDocument: 'after' })
      .exec();

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    return event;
  }

  async joinEvent(eventId: string, userId: string): Promise<Event> {
    if (!isValidObjectId(eventId)) {
      throw new BadRequestException('ID de evento inválido');
    }

    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const user = await this.usersService.findBasicInfo(userId);
    if (!user || user.status !== 'Activo') {
      throw new ForbiddenException('Solo los socios con membresía activa pueden apuntarse a eventos');
    }

    const yaApuntado = event.attendees.some((a) => a.userId === userId);
    if (yaApuntado) {
      throw new BadRequestException('Ya estás apuntado a este evento');
    }

    event.attendees.push({ userId, joinedAt: new Date() });
    await event.save();

    this.eventsGateway.emitAttendeeUpdate(eventId, event.attendees.toObject());

    return event;
  }

  async leaveEvent(eventId: string, userId: string): Promise<Event> {
    if (!isValidObjectId(eventId)) {
      throw new BadRequestException('ID de evento inválido');
    }

    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const index = event.attendees.findIndex((a) => a.userId === userId);
    if (index === -1) {
      throw new BadRequestException('No estás apuntado a este evento');
    }

    event.attendees.splice(index, 1);
    await event.save();

    this.eventsGateway.emitAttendeeUpdate(eventId, event.attendees.toObject());

    return event;
  }

  async getAttendees(eventId: string) {
    if (!isValidObjectId(eventId)) {
      throw new BadRequestException('ID de evento inválido');
    }

    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    const attendeesWithInfo = await Promise.all(
      event.attendees.map(async (attendee) => {
        const userInfo = await this.usersService.findBasicInfo(attendee.userId);
        return {
          userId: attendee.userId,
          joinedAt: attendee.joinedAt,
          name: userInfo?.name ?? 'Usuario eliminado',
          email: userInfo?.email ?? null,
        };
      }),
    );

    return attendeesWithInfo;
  }
}
