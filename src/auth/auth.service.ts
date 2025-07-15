import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { EmailService } from './email.service';
import { RegisterDto, LoginDto, VerifyEmailDto, Verify2FADto } from './dto';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw new BadRequestException('Un utilisateur avec cet email ou nom d\'utilisateur existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'USER',
        isEmailVerified: false,
      }
    });

    // Générer un token de vérification
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

    await this.prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      }
    });

    // Envoyer l'email de vérification
    await this.emailService.sendVerificationEmail(email, token);

    return {
      message: 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
      userId: user.id
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    const verification = await this.prisma.emailVerification.findFirst({
      where: { token },
      include: { user: true }
    });

    if (!verification) {
      throw new BadRequestException('Token de vérification invalide');
    }

    if (verification.expiresAt < new Date()) {
      throw new BadRequestException('Token de vérification expiré');
    }

    // Marquer l'utilisateur comme vérifié
    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { isEmailVerified: true }
    });

    // Supprimer le token de vérification
    await this.prisma.emailVerification.delete({
      where: { id: verification.id }
    });

    return {
      message: 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.'
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      throw new BadRequestException('Veuillez vérifier votre email avant de vous connecter');
    }

    // Générer un code 2FA
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Supprimer les anciens codes 2FA de l'utilisateur
    await this.prisma.twoFactorCode.deleteMany({
      where: { userId: user.id }
    });

    // Créer le nouveau code 2FA
    await this.prisma.twoFactorCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      }
    });

    // Envoyer le code par email
    await this.emailService.send2FACode(email, code);

    return {
      message: 'Code de connexion envoyé par email',
      userId: user.id
    };
  }

  async verify2FA(verify2FADto: Verify2FADto, userId: number) {
    const { code } = verify2FADto;

    const twoFactorCode = await this.prisma.twoFactorCode.findFirst({
      where: {
        userId,
        code,
        expiresAt: {
          gt: new Date()
        }
      },
      include: { user: true }
    });

    if (!twoFactorCode) {
      throw new BadRequestException('Code 2FA invalide ou expiré');
    }

    // Supprimer le code utilisé
    await this.prisma.twoFactorCode.delete({
      where: { id: twoFactorCode.id }
    });

    // Générer le token JWT
    const payload = {
      sub: twoFactorCode.user.id,
      email: twoFactorCode.user.email,
      username: twoFactorCode.user.username,
      role: twoFactorCode.user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = twoFactorCode.user;

    return {
      message: 'Connexion réussie',
      user: userWithoutPassword,
      accessToken,
    };
  }

  // Méthode pour générer un nouveau token (refresh)
  async refreshToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
