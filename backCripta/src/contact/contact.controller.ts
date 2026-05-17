import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageStatusDto } from './dto/update-message-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('contacto')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Body() dto: CreateMessageDto) {
    return this.contactService.createMessage(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getContactMessages() {
    return this.contactService.getMessages();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateContactMessageStatus(
    @Param('id') id: string,
    @Body() dto: UpdateMessageStatusDto,
  ) {
    return this.contactService.updateMessageStatus(id, dto);
  }

  @Get('redes')
  async getSocialLinks() {
    return this.contactService.getSocialLinks();
  }

  @Get('twitch')
  async getTwitchStream() {
    return this.contactService.getTwitchStream();
  }
}
