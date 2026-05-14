import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateGalleryPhotoDto {
    @IsNotEmpty()
    @IsString()
    title!: string;
    
    @IsNotEmpty()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    filename!: string;

    @IsNotEmpty()
    @IsString()
    originalName!: string;

    @IsNotEmpty()
    @IsNumber()
    size!: number;

    @IsNotEmpty()
    @IsString()
    imageUrl!: string;

    @IsNotEmpty()
    @IsString()
    uploadedBy!: string;

    @IsNotEmpty()
    @IsString()
    uploadedByName?: string;

    @IsNotEmpty()
    @IsBoolean()
    isVisible!: boolean;
}