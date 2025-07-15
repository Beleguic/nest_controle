import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Titre du film',
    example: 'Inception'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description du film',
    example: 'Un thriller de science-fiction sur les rêves',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Année de sortie du film',
    example: 2010,
    required: false
  })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  @IsOptional()
  year?: number;
} 