import { Type } from 'class-transformer';
import {
  IsDateString,
  IsDivisibleBy,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateReservaDto {
  @IsUUID()
  mesaId: string;

  @IsDateString()
  fechaHoraInicio: string;

  @IsDateString()
  fechaHoraFin: string;

  @Type(() => Number)
  @IsInt()
  @IsDivisibleBy(2)
  @Min(2)
  asientosReservados: number;
}
