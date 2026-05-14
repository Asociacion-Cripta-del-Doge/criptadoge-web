import { Controller, Post, Body, HttpCode, HttpStatus, Get, Req, Res, UseGuards, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;

  constructor(
    private authService: AuthService,
    private cloudinaryService: CloudinaryService,
    configService: ConfigService,
  ) {
    const callbackUrl = configService.get<string>('GOOGLE_CALLBACK_URL') ?? 'http://localhost:8080/api/auth/google/callback';
    this.frontendUrl = new URL(callbackUrl).origin;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    const validUser = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(validUser);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() body: { name: string }) {
    return this.authService.updateProfile(req.user.id, body.name);
  }

  @Patch('avatar')
  @UseGuards(JwtAuthGuard)
  async uploadAvatar(@Req() req: any, @Body() body: { base64: string }) {
    const url = await this.cloudinaryService.uploadAvatar(body.base64, req.user.id)
    return this.authService.updateAvatar(req.user.id, url)
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const { access_token, user } = req.user;
    res.redirect(
      `${this.frontendUrl}/auth/callback?token=${access_token}&user=${encodeURIComponent(JSON.stringify(user))}`
    );
  }
}