import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      if (user.status !== "Desactivado") return result;
    }
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async register(name: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('El email ya está registrado');
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, role: true, status: true }
    });
  }

  async loginWithGoogle(data: { email: string, name: string }) {
    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { name: data.name, email: data.email, password: '' }
      });
    } else if (user.status === "Desactivado") {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastRenewal: true,
        expirationDate: true,
        createdAt: true,
        avatar: true,
      },
    });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    if (user.status === "Desactivado") throw new UnauthorizedException('Usuario no encontrado');
    return user;
  }

  async updateProfile(userId: string, name: string) {
    if (!name || name.trim().length < 2) {
      throw new UnauthorizedException('El nombre debe tener al menos 2 caracteres');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastRenewal: true,
        expirationDate: true,
        createdAt: true,
        avatar: true,
      },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastRenewal: true,
        expirationDate: true,
        createdAt: true,
        avatar: true,
      },
    });
  }

  async forgotPassword(email: string)
  {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if(!user || user.password === '') return;   //ignora a los usuarios de Google

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000);

    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpires: expires }
    });

    await this.emailService.sendPasswordReset(email, user.name, token)
  }

  async resetPassword(token: string, newPassword: string)
  {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if(!user) throw new UnauthorizedException('Token inválido o expirado');

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpires: null }
    });
  }
}