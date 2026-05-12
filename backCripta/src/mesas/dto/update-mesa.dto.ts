import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateMesaDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  asientos?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  esDePago?: boolean;
}
