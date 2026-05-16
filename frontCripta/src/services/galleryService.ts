import type { GalleryPhoto, GalleryComment } from '../types/gallery';


const API_BASE = "http://localhost:8080/api"

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
const response = await fetch(`${API_BASE}/gallery`);

if (!response.ok) {
throw new Error('No se pudieron cargar las fotos');
}

return response.json();
}

export async function getGalleryPhoto(id: string): Promise<GalleryPhoto> {
const response = await fetch(`${API_BASE}/gallery/${id}`);

if (!response.ok) {
throw new Error('No se pudo cargar la foto');
}

return response.json();
}

export async function uploadGalleryPhoto(
token: string,
data: {
title: string;
description?: string;
file: File;
},
): Promise<GalleryPhoto> {
const formData = new FormData();

formData.append('title', data.title);
formData.append('file', data.file);

if (data.description) {
formData.append('description', data.description);
}

const response = await fetch(`${API_BASE}/gallery`, {
method: 'POST',
headers: {
Authorization: `Bearer ${token}`,
},
body: formData,
});

if (!response.ok) {
throw new Error('No se pudo subir la foto');
}

return response.json();
}

export async function getGalleryComments(
photoId: string,
): Promise<GalleryComment[]> {
const response = await fetch(`${API_BASE}/gallery/${photoId}/comments`);

if (!response.ok) {
throw new Error('No se pudieron cargar los comentarios');
}

return response.json();
}

export async function createGalleryComment(
token: string,
photoId: string,
message: string,
): Promise<GalleryComment> {
const response = await fetch(`${API_BASE}/gallery/${photoId}/comments`, {
method: 'POST',
headers: {
Authorization: `Bearer ${token}`,
'Content-Type': 'application/json',
},
body: JSON.stringify({ message }),
});

if (!response.ok) {
throw new Error('No se pudo publicar el comentario');
}

return response.json();
}

export async function deleteGalleryComment(
token: string,
commentId: string,
): Promise<{ message: string }> {
const response = await fetch(`${API_BASE}/gallery/comments/${commentId}`, {
method: 'DELETE',
headers: {
Authorization: `Bearer ${token}`,
},
});

if (!response.ok) {
throw new Error('No se pudo eliminar el comentario');
}

return response.json();
}