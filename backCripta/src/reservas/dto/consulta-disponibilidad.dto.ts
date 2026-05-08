import { Type } from 'class-transformer';
import {
  IsDateString,
  IsDivisibleBy,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class ConsultaDisponibilidadDto {
  @IsUUID()
  mesaId: string;

  @IsDateString()
  fechaHoraInicio: string;

  @IsDateString()
  fechaHoraFin: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsDivisibleBy(2)
  @Min(2)
  asientosReservados?: number;
}
