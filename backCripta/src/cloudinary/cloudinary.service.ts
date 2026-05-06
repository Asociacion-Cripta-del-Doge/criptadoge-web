import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService 
{
    constructor() 
    {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
    }

    async uploadAvatar(base64Image: string, userId: string): Promise<string>
    {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'avatars',
            public_id: `avatar_${userId}`,
            overwirte: true,
            transformation: [
                { width: 200, height: 200, crop: 'fill', gravity: 'face'}
            ]
        })
        return result.secure_url;
    }
}