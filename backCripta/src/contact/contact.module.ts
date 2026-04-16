import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactMessage, ContactMessageSchema } from './schemas/contact-message.schema';
import { SocialLink, SocialLinkSchema } from './schemas/social-link.schema';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: SocialLink.name, schema: SocialLinkSchema },
    ]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
