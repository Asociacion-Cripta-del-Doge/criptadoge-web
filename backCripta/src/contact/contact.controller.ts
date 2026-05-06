import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateMessageDto } from './dto/create-message.dto';
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

  @Get('redes')
  async getSocialLinks() {
    return this.contactService.getSocialLinks();
  }

  @Get('twitch')
  async getTwitchStream() {
    return this.contactService.getTwitchStream();
  }
}
