import { PartialType } from '@nestjs/mapped-types';
import { CreateGalleryCommentDto } from './create-gallery-comment.dto';

export class UpdateGalleryCommentDto extends PartialType(CreateGalleryCommentDto) {}
