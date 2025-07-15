import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): object {
    return {
      message: 'Bienvenue sur l\'API Watchlist',
      description: 'Système d\'authentification complet avec 2FA et gestion de watchlist de films',
      version: '1.0.0',
      documentation: '/api',
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          verifyEmail: 'GET /auth/verify-email',
          login: 'POST /auth/login',
          verify2FA: 'POST /auth/verify-2fa',
          profile: 'GET /auth/profile',
          refresh: 'POST /auth/refresh'
        },
        movies: {
          create: 'POST /movies',
          getAll: 'GET /movies',
          getOne: 'GET /movies/:id',
          update: 'PATCH /movies/:id',
          delete: 'DELETE /movies/:id',
          stats: 'GET /movies/stats',
          adminAll: 'GET /movies/admin/all'
        }
      },
      features: [
        'Inscription avec validation par email',
        'Authentification 2FA par email',
        'Gestion des rôles (USER, ADMIN)',
        'Watchlist de films privée par utilisateur',
        'Documentation Swagger complète'
      ]
    };
  }
}
