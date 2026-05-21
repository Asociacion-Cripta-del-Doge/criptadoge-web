import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { CreateMembershipRequestDto } from './dto/create-membership-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Get('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRequests() {
    return this.membershipService.getRequests();
  }

  @Post('request')
  @HttpCode(201)
  async createRequest(@Body() dto: CreateMembershipRequestDto): Promise<{ message: string }> {
    await this.membershipService.createRequest(dto);
    return { message: 'Solicitud recibida correctamente' };
  }
}
