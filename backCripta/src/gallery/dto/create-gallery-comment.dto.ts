import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateGalleryCommentDto {
    @IsNotEmpty()
    @IsString()
    photoId!: string;

    @IsNotEmpty()
    @IsString()
    userId!: string;

    @IsNotEmpty()
    @IsString()
    userName!: string;
    
    @IsNotEmpty()
    @IsString()
    message!: string;

    @IsNotEmpty()
    @IsBoolean()
    isVisible!: boolean;
}