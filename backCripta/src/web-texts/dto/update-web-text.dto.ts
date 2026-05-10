import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WEB_TEXT_TYPES } from '../schemas/web-text.schema';
import type { WebTextType } from '../schemas/web-text.schema';

export class UpdateWebTextDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  value?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  section?: string;

  @IsIn(WEB_TEXT_TYPES)
  @IsOptional()
  type?: WebTextType;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  locale?: string;
}
