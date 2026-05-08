import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class CreateReservaDto {
  @IsUUID()
  mesaId: string;

  @IsDateString()
  fechaHoraInicio: string;

  @IsDateString()
  fechaHoraFin: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  asientosReservados: number;
}
