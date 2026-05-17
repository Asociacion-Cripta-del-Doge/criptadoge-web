import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventLabelsService } from './event-labels.service';
import { CreateEventLabelDto } from './dto/create-event-label.dto';
import { UpdateEventLabelDto } from './dto/update-event-label.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('event-labels')
export class EventLabelsController {
  constructor(private readonly eventLabelsService: EventLabelsService) {}

  @Get()
  findAll() {
    return this.eventLabelsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createEventLabelDto: CreateEventLabelDto) {
    return this.eventLabelsService.create(createEventLabelDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateEventLabelDto: UpdateEventLabelDto,
  ) {
    return this.eventLabelsService.update(id, updateEventLabelDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.eventLabelsService.remove(id);
  }
}
