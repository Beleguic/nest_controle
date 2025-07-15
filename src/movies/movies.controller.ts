import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('movies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau film dans sa watchlist' })
  @ApiResponse({ status: 201, description: 'Film créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  create(@Body() createMovieDto: CreateMovieDto, @Request() req) {
    const userId = req.user.id;
    return this.moviesService.create(createMovieDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les films de l\'utilisateur connecté (peu importe le rôle)' })
  @ApiResponse({ status: 200, description: 'Liste des films de l\'utilisateur' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  findAll(@Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.moviesService.findAll(userId, userRole);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques de la watchlist' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getStats(@Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.moviesService.getStats(userId, userRole);
  }

  @Get('admin/all')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Récupérer toutes les watchlists (admin seulement)' })
  @ApiResponse({ status: 200, description: 'Toutes les watchlists récupérées' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit (admin seulement)' })
  findAllAdmin(@Request() req) {
    return this.moviesService.findAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un film par son ID' })
  @ApiResponse({ status: 200, description: 'Film récupéré' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.moviesService.findOne(id, userId, userRole);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un film' })
  @ApiResponse({ status: 200, description: 'Film modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
    @Request() req,
  ) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.moviesService.update(id, updateMovieDto, userId, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un film' })
  @ApiResponse({ status: 200, description: 'Film supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Film non trouvé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 403, description: 'Permission refusée' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    const userRole = req.user.role;
    return this.moviesService.remove(id, userId, userRole);
  }
}
