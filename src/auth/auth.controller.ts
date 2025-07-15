import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyEmailDto, Verify2FADto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur inscrit, vérifiez votre email' })
  @ApiResponse({ status: 400, description: 'Données invalides ou utilisateur déjà existant' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Vérifier l\'email avec un token' })
  @ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide ou expiré' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail({ token });
  }

  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur (envoie un code 2FA par email)' })
  @ApiResponse({ status: 200, description: 'Code 2FA envoyé par email' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  @ApiResponse({ status: 400, description: 'Email non vérifié' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-2fa')
  @ApiOperation({ summary: 'Vérifier le code 2FA pour finaliser la connexion' })
  @ApiResponse({ status: 200, description: 'Connexion réussie avec token JWT' })
  @ApiResponse({ status: 400, description: 'Code 2FA invalide ou expiré' })
  async verify2FA(@Body() verify2FADto: Verify2FADto) {
    return this.authService.verify2FA(verify2FADto, verify2FADto.userId);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rafraîchir le token JWT' })
  @ApiResponse({ status: 200, description: 'Nouveau token généré' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getProfile(@Request() req) {
    return {
      message: 'Profil utilisateur',
      user: req.user
    };
  }
}
