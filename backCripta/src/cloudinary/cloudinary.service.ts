import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadAvatar(base64: string, userId: string): Promise<string> {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'avatars',
      public_id: `avatar_${userId}`,
      overwrite: true,
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })
    return result.secure_url
  }

  async uploadCardImage(base64: string, cardId: number): Promise<string> {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'cards',
      public_id: `card_${cardId}`,
      overwrite: true,
      transformation: [
        { width: 400, height: 560, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })
    return result.secure_url
  }

  async uploadCollectionImage(base64: string, collectionId: number): Promise<string> {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'collections',
      public_id: `collection_${collectionId}`,
      overwrite: true,
      transformation: [
        { width: 800, height: 400, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })
    return result.secure_url
  }

  async uploadPackCoverImage(base64: string): Promise<string> {
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'packs',
      public_id: 'pack_cover',
      overwrite: true,
      transformation: [
        { width: 400, height: 680, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })
    return result.secure_url
  }
}
