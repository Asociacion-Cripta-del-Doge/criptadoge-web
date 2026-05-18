import { useEffect, useState } from "react"
import "./Gallery.scss"
import { useWebTexts } from "../../hooks/useWebTexts"
import { GalleryCard } from "./GalleryCard"
import logo from "../../assets/logo.png"
import { getGalleryPhotos } from "../../services/galleryService";
import { GalleryUploadForm } from "./GalleryUploadForm"
import { useAuth } from "../../context/AuthContext"

export const Gallery = () => {
  const text = useWebTexts("nav")
  const { user } = useAuth()
  const canUploadPhotos = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photos = await getGalleryPhotos();
        console.log("Fetched gallery photos:", photos);
      } catch (error) {
        console.error("Error fetching gallery photos:", error);
      }
    };

    fetchPhotos();
  }, []);

  return (
    <>
      <header className="gallery-app">
        <div className="gallery-brand">
          <img src={logo} alt={text("booking.brand")} />
          <div>
            <span>{text("booking.brand")}</span>
            <strong>Galeria de fotos</strong>
          </div>
        </div>
        <div className="gallery-container">
          {canUploadPhotos && (
            <GalleryUploadForm />
          )}
          {!canUploadPhotos && (
            <h2>Solo un admin puede subir fotos</h2>
          )}
          <div className="gallery-grid">
            <GalleryCard image={logo} title="Imagen" />
            <GalleryCard image={logo} title="Imagen" />
            <GalleryCard image={logo} title="Imagen" />
            <GalleryCard image={logo} title="Imagen" />
            <GalleryCard image={logo} title="Imagen" />
            <GalleryCard image={logo} title="Imagen" />
            <GalleryCard image={logo} title="Imagen" />
            <GalleryCard image={logo} title="Imagen" />
          </div>
        </div>
      </header>
    </>
  );
}