import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WEB_TEXT_TYPES } from '../schemas/web-text.schema';
import type { WebTextType } from '../schemas/web-text.schema';

export class CreateWebTextDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  section: string;

  @IsIn(WEB_TEXT_TYPES)
  @IsOptional()
  type?: WebTextType;

  @IsString()
  @IsOptional()
  locale?: string;
}
