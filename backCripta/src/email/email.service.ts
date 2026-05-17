import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService 
{
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    async sendPasswordReset(email: string, name: string, token: string)
    {
        const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        await this.transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: '🔐 Recupera tu contraseña - La Cripta de Doge',
            html: `
                <div style="font-family: 'Roboto', Arial, sans-serif; background-color: #0f172a; padding: 40px; max-width: 520px; margin: auto; border-radius: 12px; border: 1px solid #334155;">
                    <h1 style="font-family: 'Courier New', monospace; color: #00bfff; font-size: 1.4rem; margin-bottom: 4px; letter-spacing: 2px;">
                        LA CRIPTA DE <span style="color: #eab308;">DOGE</span>
                    </h1>
                    <div style="height: 2px; background: linear-gradient(to right, #00bfff, #ec4899); margin-bottom: 28px; border-radius: 2px;"></div>
                    <p style="color: #f8fafc; font-size: 1rem; margin-bottom: 8px;">
                        Hola, <strong style="color: #ec4899;">${name}</strong> 👋
                    </p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${url}" style="display: inline-block; padding: 14px 32px; background-color: #173d8d; color: #f8fafc; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1rem; letter-spacing: 1px; border: 1px solid #00bfff;">
                            🔐 Restablecer contraseña
                        </a>
                    </div>
                    <p style="color #94a3b8; font-size: 0.8rem; text-align: center; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 16px;">
                        Este enlace caduca en <strong>1 hora</strong>
                        Si no solicitaste esto, ignora este email.
                    </p>
                    <p style="color: #334155; font-size: 0.75rem; text-align: center; margin-top: 8px;">
                        © La Cripta de Doge · Asociación sin ánimo de lucro · Puertollano
                    </p>
                </div>
            `
        })
    }
}