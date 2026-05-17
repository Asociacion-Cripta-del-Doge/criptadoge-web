import { useEffect, useState } from "react"
import "./Gallery.scss"
import { useWebTexts } from "../../hooks/useWebTexts"
import { GalleryCard } from "./GalleryCard"
import logo from "../../assets/logo.png"

export const Gallery = () => {
  const text = useWebTexts("nav")

  useEffect(() => {
  }, [])

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