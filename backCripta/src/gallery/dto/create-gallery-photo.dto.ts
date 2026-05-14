import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateGalleryPhotoDto {
    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsNotEmpty()
    @IsString()
    description?: string;
}