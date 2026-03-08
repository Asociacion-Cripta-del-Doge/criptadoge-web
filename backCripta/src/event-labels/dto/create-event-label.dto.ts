import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventLabelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  color?: string;
}
