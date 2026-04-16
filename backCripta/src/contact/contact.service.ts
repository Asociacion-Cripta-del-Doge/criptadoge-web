import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactMessage, ContactMessageDocument } from './schemas/contact-message.schema';
import { SocialLink, SocialLinkDocument } from './schemas/social-link.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private messageModel: Model<ContactMessageDocument>,
    @InjectModel(SocialLink.name)
    private socialLinkModel: Model<SocialLinkDocument>,
  ) {}

  async createMessage(dto: CreateMessageDto) {
    return this.messageModel.create(dto);
  }

  async getSocialLinks() {
    return this.socialLinkModel.find().sort({ orden: 1 });
  }
}
