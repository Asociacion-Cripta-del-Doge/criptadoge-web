import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMembershipRequestDto } from './dto/create-membership-request.dto';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('request')
  @HttpCode(201)
  async createRequest(@Body() dto: CreateMembershipRequestDto): Promise<{ message: string }> {
    await this.membershipService.createRequest(dto);
    return { message: 'Solicitud recibida correctamente' };
  }
}