import { IsString, Length, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Verify2FADto {
  @ApiProperty({
    description: 'Code 2FA à 6 chiffres reçu par email',
    example: '123456'
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur (retourné par l\'endpoint login)',
    example: 1
  })
  @IsNumber()
  userId: number;
} 