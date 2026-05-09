import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateWebTextDto } from './dto/create-web-text.dto';
import { UpdateWebTextDto } from './dto/update-web-text.dto';
import { WebText, WebTextDocument } from './schemas/web-text.schema';

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

@Injectable()
export class WebTextsService {
  constructor(
    @InjectModel(WebText.name)
    private webTextModel: Model<WebTextDocument>,
  ) {}

  async findAll(locale = 'es', section?: string): Promise<WebText[]> {
    const filter: Record<string, string> = { locale };
    if (section) {
      filter.section = section;
    }

    return this.webTextModel.find(filter).sort({ section: 1, key: 1 }).exec();
  }

  async create(dto: CreateWebTextDto): Promise<WebText> {
    try {
      const created = new this.webTextModel({
        ...dto,
        locale: dto.locale ?? 'es',
        type: dto.type ?? 'text',
      });
      return await created.save();
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(
          `El texto "${dto.key}" ya existe para este idioma`,
        );
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateWebTextDto): Promise<WebText> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Texto no encontrado');
    }

    const updated = await this.webTextModel
      .findByIdAndUpdate(id, dto, {
        returnDocument: 'after',
        runValidators: true,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException('Texto no encontrado');
    }

    return updated;
  }
}
