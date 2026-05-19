import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MembershipRequest, MembershipRequestDocument } from './schemas/membership-request.schema';
import { CreateMembershipRequestDto } from './dto/create-membership-request.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class MembershipService {
  constructor(
    @InjectModel(MembershipRequest.name)
    private readonly membershipRequestModel: Model<MembershipRequestDocument>,
    private readonly emailService: EmailService,
  ) {}

  async getRequests(): Promise<MembershipRequest[]> {
    return this.membershipRequestModel
      .find()
      .sort({ createdAt: -1 })
      .lean<MembershipRequest[]>()
      .exec();
  }

  async createRequest(dto: CreateMembershipRequestDto): Promise<void> {
    try {
      await this.membershipRequestModel.create(dto);
      await this.emailService.sendMembershipConfirmation(dto.email, dto.name);
    } catch {
      throw new InternalServerErrorException('Error al procesar la solicitud');
    }
  }
}
