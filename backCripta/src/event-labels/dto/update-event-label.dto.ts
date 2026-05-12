import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEventLabelDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  color?: string;
}
