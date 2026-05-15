import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class CreateMesaDto {
  @IsInt()
  @Min(1)
  asientos: number;

  @IsInt()
  @Min(1)
  orden: number;

  @IsBoolean()
  @IsOptional()
  esDePago?: boolean;
}
