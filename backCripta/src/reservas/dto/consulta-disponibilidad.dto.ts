import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

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
  @Min(1)
  asientosReservados?: number;
}
