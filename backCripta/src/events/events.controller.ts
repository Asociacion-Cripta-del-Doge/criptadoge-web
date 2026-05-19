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
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.eventsService.findAll((req.user as any)?.id);
  }

  @Get('mis-asistencias')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER', 'ADMIN')
  async getMyAttendances(@Req() req: Request) {
    return this.eventsService.getMyAttendances((req.user as any).id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    return this.eventsService.findOne(id, (req.user as any)?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/asistentes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER', 'ADMIN')
  async joinEvent(@Param('id') eventId: string, @Req() req: Request) {
    return this.eventsService.joinEvent(eventId, (req.user as any).id);
  }

  @Delete(':id/asistentes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER', 'ADMIN')
  async leaveEvent(@Param('id') eventId: string, @Req() req: Request) {
    return this.eventsService.leaveEvent(eventId, (req.user as any).id);
  }

  @Get(':id/asistentes/count')
  async getAttendeesCount(@Param('id') eventId: string) {
    return this.eventsService.getAttendeesCount(eventId);
  }

  @Get(':id/asistentes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAttendees(@Param('id') eventId: string) {
    return this.eventsService.getAttendees(eventId);
  }
}
