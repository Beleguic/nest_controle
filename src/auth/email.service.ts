import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuration pour MailDev
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
      auth: {
        user: '',
        pass: ''
      }
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `http://localhost:3000/auth/verify-email?token=${token}`;
    
    const mailOptions = {
      from: 'noreply@watchlist.com',
      to: email,
      subject: 'Vérification de votre compte Watchlist',
      html: `
        <h2>Bienvenue sur Watchlist !</h2>
        <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Vérifier mon compte
        </a>
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p>${verificationUrl}</p>
        <p>Ce lien expire dans 24 heures.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de vérification envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi de l'email de vérification: ${error.message}`);
      throw new Error('Erreur lors de l\'envoi de l\'email de vérification');
    }
  }

  async send2FACode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: 'noreply@watchlist.com',
      to: email,
      subject: 'Code de connexion Watchlist',
      html: `
        <h2>Code de connexion</h2>
        <p>Voici votre code de connexion à 2 facteurs :</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        </div>
        <p>Ce code expire dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Code 2FA envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du code 2FA: ${error.message}`);
      throw new Error('Erreur lors de l\'envoi du code 2FA');
    }
  }
} 