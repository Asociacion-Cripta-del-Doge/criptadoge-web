import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('contacto')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Body() dto: CreateMessageDto) {
    return this.contactService.createMessage(dto);
  }

  @Get('mensajes')
  async getMessages() {
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
