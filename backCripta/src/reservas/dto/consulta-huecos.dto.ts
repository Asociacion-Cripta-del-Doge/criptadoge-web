import { Type } from 'class-transformer';
import {
  IsDateString,
  IsDivisibleBy,
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';

export class ConsultaHuecosDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsDivisibleBy(2)
  @Min(2)
  asientosReservados?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  duracionMinutos?: number;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}
