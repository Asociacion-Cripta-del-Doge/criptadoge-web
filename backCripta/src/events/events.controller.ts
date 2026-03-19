import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('eventos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles('ADMIN')
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @Roles('ADMIN', 'MEMBER')
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'MEMBER')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/asistentes')
  @Roles('MEMBER')
  async joinEvent(@Param('id') eventId: string, @Req() req: Request) {
    return this.eventsService.joinEvent(eventId, (req.user as any).id);
  }

  @Delete(':id/asistentes')
  @Roles('MEMBER')
  async leaveEvent(@Param('id') eventId: string, @Req() req: Request) {
    return this.eventsService.leaveEvent(eventId, (req.user as any).id);
  }

  @Get(':id/asistentes')
  @Roles('ADMIN')
  async getAttendees(@Param('id') eventId: string) {
    return this.eventsService.getAttendees(eventId);
  }
}
