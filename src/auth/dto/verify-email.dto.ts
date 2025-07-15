import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Token de validation reçu par email',
    example: 'abc123def456'
  })
  @IsString()
  @IsNotEmpty()
  token: string;
} 