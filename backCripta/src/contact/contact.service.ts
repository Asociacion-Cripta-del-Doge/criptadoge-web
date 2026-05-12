import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ContactMessage, ContactMessageDocument } from './schemas/contact-message.schema';
import { SocialLink, SocialLinkDocument } from './schemas/social-link.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageStatusDto } from './dto/update-message-status.dto';

@Injectable()
export class ContactService {
  private twitchToken: string | null = null;
  private twitchTokenExpiry = 0;

  constructor(
    @InjectModel(ContactMessage.name)
    private messageModel: Model<ContactMessageDocument>,
    @InjectModel(SocialLink.name)
    private socialLinkModel: Model<SocialLinkDocument>,
    private configService: ConfigService,
  ) {}

  async createMessage(dto: CreateMessageDto) {
    return this.messageModel.create(dto);
  }

  async getMessages() {
    return this.messageModel.find().sort({ createdAt: -1 });
  }

  async updateMessageStatus(id: string, dto: UpdateMessageStatusDto) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID de mensaje invalido');
    }

    const message = await this.messageModel
      .findByIdAndUpdate(id, { estado: dto.estado }, { returnDocument: 'after' })
      .exec();

    if (!message) {
      throw new NotFoundException('Mensaje de contacto no encontrado');
    }

    return message;
  }

  async getSocialLinks() {
    return this.socialLinkModel.find().sort({ orden: 1 });
  }

  private async getTwitchToken(): Promise<string> {
    if (this.twitchToken && Date.now() < this.twitchTokenExpiry) {
      return this.twitchToken;
    }

    const clientId = this.configService.get<string>('TWITCH_CLIENT_ID');
    const clientSecret = this.configService.get<string>('TWITCH_CLIENT_SECRET');

    const res = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' },
    );

    const data = await res.json() as { access_token: string; expires_in: number };
    this.twitchToken = data.access_token;
    this.twitchTokenExpiry = Date.now() + (data.expires_in - 3600) * 1000;

    return this.twitchToken;
  }

  async getTwitchStream() {
    const clientId = this.configService.get<string>('TWITCH_CLIENT_ID');
    const channel = this.configService.get<string>('TWITCH_CHANNEL');
    const token = await this.getTwitchToken();

    const headers = {
      'Client-Id': clientId!,
      'Authorization': `Bearer ${token}`,
    };

    const [streamRes, userRes] = await Promise.all([
      fetch(`https://api.twitch.tv/helix/streams?user_login=${channel}`, { headers }),
      fetch(`https://api.twitch.tv/helix/users?login=${channel}`, { headers }),
    ]);

    const streamData = await streamRes.json() as { data: any[] };
    const userData = await userRes.json() as { data: any[] };

    const stream = streamData.data?.[0] ?? null;
    const user = userData.data?.[0] ?? null;

    return {
      live: !!stream,
      titulo: stream?.title ?? null,
      juego: stream?.game_name ?? null,
      viewers: stream?.viewer_count ?? 0,
      thumbnail: user?.profile_image_url ?? null,
      url: `https://www.twitch.tv/${channel}`,
      channel,
    };
  }
}
