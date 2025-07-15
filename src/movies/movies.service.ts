import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMovieDto, UpdateMovieDto } from './dto';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async create(createMovieDto: CreateMovieDto, userId: number) {
    const movie = await this.prisma.movie.create({
      data: {
        ...createMovieDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return movie;
  }

  async findAll(userId: number, userRole: string) {
    // Toujours retourner uniquement les films de l'utilisateur connecté
    return this.prisma.movie.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllAdmin() {
    // Endpoint admin pour voir tous les films de tous les utilisateurs
    return this.prisma.movie.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number, userId: number, userRole: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Film non trouvé');
    }

    // Vérifier que l'utilisateur peut accéder à ce film
    if (userRole !== 'ADMIN' && movie.userId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce film');
    }

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto, userId: number, userRole: string) {
    // Vérifier que le film existe et que l'utilisateur peut le modifier
    const existingMovie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!existingMovie) {
      throw new NotFoundException('Film non trouvé');
    }

    if (userRole !== 'ADMIN' && existingMovie.userId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas la permission de modifier ce film');
    }

    const movie = await this.prisma.movie.update({
      where: { id },
      data: updateMovieDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return movie;
  }

  async remove(id: number, userId: number, userRole: string) {
    // Vérifier que le film existe et que l'utilisateur peut le supprimer
    const existingMovie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!existingMovie) {
      throw new NotFoundException('Film non trouvé');
    }

    if (userRole !== 'ADMIN' && existingMovie.userId !== userId) {
      throw new ForbiddenException('Vous n\'avez pas la permission de supprimer ce film');
    }

    await this.prisma.movie.delete({
      where: { id },
    });

    return {
      message: 'Film supprimé avec succès',
    };
  }

  // Méthode pour obtenir les statistiques de la watchlist
  async getStats(userId: number, userRole: string) {
    if (userRole === 'ADMIN') {
      // Statistiques globales pour l'admin
      const totalMovies = await this.prisma.movie.count();
      const moviesByYear = await this.prisma.movie.groupBy({
        by: ['year'],
        _count: {
          year: true,
        },
        orderBy: {
          year: 'desc',
        },
      });

      return {
        totalMovies,
        moviesByYear,
      };
    } else {
      // Statistiques personnelles pour l'utilisateur
      const totalMovies = await this.prisma.movie.count({
        where: { userId },
      });

      const moviesByYear = await this.prisma.movie.groupBy({
        by: ['year'],
        where: { userId },
        _count: {
          year: true,
        },
        orderBy: {
          year: 'desc',
        },
      });

      return {
        totalMovies,
        moviesByYear,
      };
    }
  }
}
