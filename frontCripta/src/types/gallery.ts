export interface GalleryPhoto {
id: string;
title: string;
description?: string;
imageUrl: string;
uploadedBy: string;
uploadedByName?: string;
isVisible: boolean;
createdAt: string;
updatedAt: string;
commentsCount?: number;
}


export interface GalleryComment {
id: string;
photoId: string;
userId: string;
userName?: string;
message: string;
isVisible: boolean;
createdAt: string;
updatedAt: string;
}